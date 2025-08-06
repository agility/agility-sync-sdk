import { logSuccess } from '../util'

export default async function (storeInterface) {
	await storeInterface.clear();
	logSuccess(`Cleared Sync Items`);
}
