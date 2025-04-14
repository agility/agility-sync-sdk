import { logSuccess } from '../util';
import { StoreInterface } from '../store-interface';

export default async function clearSync(this: { store: StoreInterface }): Promise<void> {
    const storeInterface = this.store;
    await storeInterface.clearItems({ options: {} });
    logSuccess(`Cleared Sync Items`);
} 