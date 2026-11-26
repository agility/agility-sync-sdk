import { logSuccess } from '../util'

export default async function (storeInterface) {
	// take the sync lock, so the cache isn't deleted while a sync is writing to it
	let lockRelease = null
	if (storeInterface.mutexLock !== undefined) {
		lockRelease = await storeInterface.mutexLock()
	}

	try {
		await storeInterface.clear();
	} finally {
		if (lockRelease) {
			await lockRelease()
		}
	}
	logSuccess(`Cleared Sync Items`);
}
