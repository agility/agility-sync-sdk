type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'none';

export const asyncForEach = async <T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<void>
): Promise<void> => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const getLogLevel = (): LogLevel => {
  const logLevel = (process.env.AGILITY_LOG_LEVEL || 'warning').toLowerCase() as LogLevel;

  if (!['debug', 'info', 'warning', 'error', 'none'].includes(logLevel)) {
    return 'warning';
  }

  return logLevel;
};

export const logSuccess = (message: string): void => {
  const logLevel = getLogLevel();
  if (logLevel === 'debug' || logLevel === 'info') {
    message = `AgilityCMS => ${message} `;
    console.log('\x1b[32m%s\x1b[0m', message);
  }
};

export const logWarning = (message: string): void => {
  const logLevel = getLogLevel();
  if (logLevel === 'debug' || logLevel === 'info' || logLevel === 'warning') {
    message = `AgilityCMS => ${message} `;
    console.log('\x1b[33m%s\x1b[0m', message);
  }
};

export const logError = (message: string): void => {
  const logLevel = getLogLevel();
  if (logLevel === 'debug' || logLevel === 'info' || logLevel === 'warning' || logLevel === 'error') {
    message = `AgilityCMS => ${message} `;
    console.log('\x1b[31m%s\x1b[0m', message);
  }
};

export const logInfo = (message: string): void => {
  const logLevel = getLogLevel();
  if (logLevel === 'debug' || logLevel === 'info') {
    message = `AgilityCMS => ${message} `;
    console.log(message);
  }
};

export const logDebug = (message: string): void => {
  const logLevel = getLogLevel();
  if (logLevel === 'debug') {
    console.log('#######################################################################');
    message = `AgilityCMS(debug) => ${message} `;
    console.log('"\x1b[35m%s\x1b[0m', message);
  }
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 