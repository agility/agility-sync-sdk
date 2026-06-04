import { logSuccess } from '../util.js'

export default async function (storeInterface) {
	await storeInterface.clear();
	logSuccess(`Cleared Sync Items`);
}
