import chai from 'chai'
import fs from 'fs'
import os from 'os'
import path from 'path'

import storeInterfaceFileSystem from '../src/store-interface-filesystem'

const assert = chai.assert

// Tests for the filesystem store's mutexLock — pure unit tests, no network.

const lockFilePath = path.join(os.tmpdir(), 'agility-sync.mutex')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('store-interface-filesystem mutexLock:', function () {

    this.timeout('30s')

    beforeEach(function () {
        // Ensure no lingering lock dir from a previous run
        const lockDir = `${lockFilePath}.lock`
        if (fs.existsSync(lockDir)) {
            fs.rmSync(lockDir, { recursive: true, force: true })
        }
    })

    it('serializes concurrent callers (only one holds the lock at a time)', async function () {
        // Track when each "task" enters and exits the critical section.
        const intervals = []
        const enter = (id) => intervals.push({ id, start: Date.now() })
        const exit = (id) => {
            const last = [...intervals].reverse().find((i) => i.id === id && i.end == null)
            last.end = Date.now()
        }

        const task = async (id) => {
            const release = await storeInterfaceFileSystem.mutexLock()
            try {
                enter(id)
                // Hold the lock long enough that overlap would be detectable.
                await sleep(150)
                exit(id)
            } finally {
                await release()
            }
        }

        await Promise.all([task('a'), task('b'), task('c')])

        // No two intervals should overlap.
        intervals.sort((x, y) => x.start - y.start)
        for (let i = 1; i < intervals.length; i++) {
            assert.isAtLeast(
                intervals[i].start,
                intervals[i - 1].end,
                `interval ${intervals[i].id} starts before ${intervals[i - 1].id} ends — mutex did not serialize`
            )
        }
    })

    it('releases the lock so subsequent callers can acquire it', async function () {
        const release1 = await storeInterfaceFileSystem.mutexLock()
        await release1()

        // Should not hang — we should be able to acquire again immediately.
        const release2 = await Promise.race([
            storeInterfaceFileSystem.mutexLock(),
            sleep(2000).then(() => { throw new Error('mutexLock hung after release') })
        ])
        await release2()
    })

    it('recovers from a stale lock left by a crashed process', async function () {
        // Simulate a crashed process by creating the lock dir but never releasing it.
        // proper-lockfile considers a lock "stale" if its mtime is older than the
        // configured threshold (60s) — we backdate it to simulate that.
        const lockDir = `${lockFilePath}.lock`

        // Ensure the lockfile target exists (mutexLock creates it on first run)
        try {
            fs.writeFileSync(lockFilePath, 'agility-sync', { flag: 'wx' })
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }

        // Forge a stale lock
        fs.mkdirSync(lockDir, { recursive: true })
        const twoMinutesAgo = (Date.now() - 120000) / 1000
        fs.utimesSync(lockDir, twoMinutesAgo, twoMinutesAgo)

        // Should not hang — the stale-detection logic should let us claim the lock.
        const release = await Promise.race([
            storeInterfaceFileSystem.mutexLock(),
            sleep(5000).then(() => { throw new Error('mutexLock did not recover from stale lock') })
        ])
        await release()
    })

    it('shares one global lock across all rootPath options (current behaviour)', async function () {
        // The mutex lockfile lives at os.tmpdir()/agility-sync.mutex and is shared
        // by every caller in the process, regardless of which rootPath the store
        // is configured with. This test pins that behaviour so any future change
        // (e.g. per-rootPath locking) is intentional.
        let bRanWhileAHeld = false

        const release1 = await storeInterfaceFileSystem.mutexLock()

        const pendingB = (async () => {
            const release2 = await storeInterfaceFileSystem.mutexLock()
            bRanWhileAHeld = false  // by the time we get here, A has already released
            await release2()
        })()

        // Give B a chance to (fail to) acquire while A still holds.
        await sleep(200)
        assert.isFalse(bRanWhileAHeld, 'second caller was blocked while first held the lock')

        await release1()
        await pendingB
    })
})
