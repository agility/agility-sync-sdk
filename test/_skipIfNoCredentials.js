import { hasLiveCredentials } from './_syncClients.config'

// Mocha `before` hook factory: skips all tests in the enclosing describe()
// when the live-API credentials aren't set (e.g. fork PRs without secrets).
export function skipIfNoCredentials() {
    return function () {
        if (!hasLiveCredentials) {
            console.log('Skipping live-API tests: AGILITY_TEST_* env vars not set')
            this.skip()
        }
    }
}
