import { logSuccess } from '../util'

export default async function () {
    const syncStorageInterface = this.syncStorageInterface;
	await syncStorageInterface.clear();
	logSuccess(`Cleared Sync Items`);
}
