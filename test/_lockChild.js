// Run in a separate Node process by 08-sync-lock-and-repair: take the sync lock on a folder, hold it,
// and append "start" and "end" times to a log so the test can check no two holders overlapped.
// Usage: node -r @babel/register test/_lockChild.js <rootPath> <logFile> <holdMs>

import fs from 'fs'
import store from '../src/store-interface-filesystem'

const [rootPath, logFile, holdMs] = process.argv.slice(2)

const main = async () => {
	const release = await store.mutexLock({ options: { rootPath } })
	fs.appendFileSync(logFile, `${process.pid} start ${Date.now()}\n`)
	await new Promise((resolve) => setTimeout(resolve, parseInt(holdMs, 10)))
	fs.appendFileSync(logFile, `${process.pid} end ${Date.now()}\n`)
	await release()
}

// mocha --recursive loads every file under test/; only act when run as a script
if (require.main === module) {
	main().catch((err) => {
		console.error(err)
		process.exit(1)
	})
}
