/**
 * Module dependencies.
 */

const debug = require('debug');
const pino = require('pino');

/**
 * Variables
 */

const globalSymbol = Symbol.for('debino');

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
 * Configure the root logger.
 */

const setRootLogger = logger => {
  // The logger instance must not have a name binding configured.
  if (logger.bindings().name) {
    throw new Error('The logger instance must not have a name binding configured');
  }

  if (global[globalSymbol].loggers.size > 0) {
    throw new Error('The root logger must be set before creating any child logger');
  }

  global[globalSymbol].rootLogger = logger;
};

/**
 * Create a logger based on a given `namespace` and `options`.
 */

const debino = (namespace, { prefix = 'sub', suffix = 'component', ...options } = {}) => {
  let { loggers, rootLogger } = global[globalSymbol];
  let childLogger = loggers.get(namespace);

  // Ensure the root logger is set.
  if (!rootLogger) {
    rootLogger = global[globalSymbol].rootLogger = pino({ level: 'debug' });
  }

  // Create the logger for this namespace if it doesn't exist.
  if (!childLogger) {
    const bindings = createBindings(namespace, prefix, suffix);

    childLogger = rootLogger.child(bindings, options);
    loggers.set(namespace, childLogger);
  }

  // Set the log level based on the debug namespace.
  if (debug.enabled(namespace)) {
    childLogger.level = options.level ?? process.env.LOG_LEVEL ?? rootLogger.level;
  } else {
    childLogger.level = 'silent';
  }

  return childLogger;
};

/**
 * Configure the default root logger and initialize loggers cache.
 */

global[globalSymbol] = {
  loggers: new Map(),
  rootLogger: null
};

/**
 * Exports.
 */

module.exports.debino = debino;
module.exports.pino = pino;
module.exports.setRootLogger = setRootLogger;
