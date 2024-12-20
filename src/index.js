/**
 * Module dependencies.
 */

const debug = require('debug');
const pino = require('pino');

/**
 * Variables
 */

let rootLogger;
const loggersSymbol = Symbol('debino.loggers');

/**
 * Create child logger bindings based on a given `namespace`, `prefix` and `suffix`.
 */

const createBindings = (namespace, prefix, suffix) => {
  const [name, ...components] = namespace.split(':');

  return components.reduce(
    (total, current, i) => {
      total[`${prefix.repeat(i)}${suffix}`] = current;

      return total;
    },
    { name }
  );
};

/**
 * Configure debino, allowing to set the root logger.
 */

const setRootLogger = logger => {
  // The logger instance must not have a name binding configured.
  if (logger.bindings().name) {
    throw new Error('The logger instance must not have a name binding configured');
  }

  // Ensure loggers cache map is set on the root logger.
  if (!logger[loggersSymbol]) {
    logger[loggersSymbol] = new Map();
  }

  rootLogger = logger;
};

/**
 * Create a logger based on a given `namespace` and `options`.
 */

const debino = (namespace, { prefix = 'sub', suffix = 'component', ...options } = {}) => {
  const loggers = rootLogger[loggersSymbol];
  let childLogger = loggers.get(namespace);

  // Create the logger for this namespace if it doesn't exist.
  if (!childLogger) {
    const bindings = createBindings(namespace, prefix, suffix);

    childLogger = rootLogger.child(bindings, options);
    loggers.set(namespace, childLogger);
  }

  // Set the log level based on the debug namespace.
  if (debug.enabled(namespace)) {
    childLogger.level = options.level ?? process.env.LOG_LEVEL ?? 'debug';
  } else {
    childLogger.level = 'silent';
  }

  return childLogger;
};

/**
 * Configure the default root logger.
 */

setRootLogger(pino());

/**
 * Exports.
 */

module.exports = debino;
module.exports.setRootLogger = setRootLogger;
