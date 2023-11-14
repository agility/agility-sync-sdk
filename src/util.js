
const asyncForEach = async (array, callback) => {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}


const getLogLevel = () => {
	const logLevel = (process.env.AGILITY_LOG_LEVEL || 'warning').toLowerCase();

	if (logLevel !== 'debug' && logLevel !== 'info' && logLevel !== 'warning' && logLevel !== 'error' && logLevel !== 'none') {
		return 'warning';
	}

	return logLevel;

}


const logSuccess = (message) => {

	const logLevel = getLogLevel();
	if (logLevel === 'debug' || logLevel === 'info') {

		message = `AgilityCMS => ${message} `;
		console.log('\x1b[32m%s\x1b[0m', message);
	}
}

const logWarning = (message) => {

	const logLevel = getLogLevel();
	if (logLevel === 'debug' || logLevel === 'info' || logLevel === 'warning') {

		message = `AgilityCMS => ${message} `;
		console.log('\x1b[33m%s\x1b[0m', message);
	}
}

const logError = (message) => {

	const logLevel = getLogLevel();
	if (logLevel === 'debug' || logLevel === 'info' || logLevel === 'warning' || logLevel === 'error') {

		message = `AgilityCMS => ${message} `;
		console.log('\x1b[31m%s\x1b[0m', message);
	}
}

const logInfo = (message) => {
	const logLevel = getLogLevel();
	if (logLevel === 'debug' || logLevel === 'info') {
		message = `AgilityCMS => ${message} `;
		console.log(message);
	}
}

const logDebug = (message) => {
	const logLevel = getLogLevel();
	if (logLevel === 'debug') {
		console.log('#######################################################################');
		message = `AgilityCMS(debug) => ${message} `;
		console.log('"\x1b[35m%s\x1b[0m', message);
	}
};


const sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	logDebug,
	logInfo,
	logError,
	logWarning,
	logSuccess,
	asyncForEach,
	sleep
}