/**
 * Module dependencies.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { debino, pino, setRootLogger } from '.';
import debug from 'debug';

/**
 * Tests for `debino()`.
 */

beforeEach(() => {
  global[Symbol.for('debino')].loggers.clear();
});

describe('debino', () => {
  beforeEach(() => {
    delete process.env.LOG_LEVEL;
  });

  it('should return a pino logger', () => {
    const logger = debino('foo');

    ['fatal', 'error', 'warn', 'info', 'debug', 'trace'].forEach(level => {
      expect(logger[level]).toBeInstanceOf(Function);
    });
  });

  it('should forward options when creating the child logger', () => {
    const serializers = { foo: () => {} };

    const logger = debino('biz', { serializers });

    expect(logger[pino.symbols.serializersSym].foo).toBe(serializers.foo);
  });

  it('should return the same logger instance for the same namespace', () => {
    const logger1 = debino('fuu');
    const logger2 = debino('fuu');

    expect(logger1).toEqual(logger2);
  });

  it('should be silent by default', () => {
    const logger = debino('net');

    expect(logger.level).toEqual('silent');
  });

  it('should be on the default debug level if `DEBUG` matches logger name', () => {
    debug.enable('abc');

    const logger = debino('abc');

    expect(logger.level).toEqual('debug');
  });

  it('should be on the specified `options.level` if `DEBUG` matches logger name', () => {
    debug.enable('abc');
    process.env.LOG_LEVEL = 'info';

    const logger = debino('abc', { level: 'warn' });

    expect(logger.level).toEqual('warn');
  });

  it('should be on the specified level via `process.env.LOG_LEVEL` if `DEBUG` matches logger name', () => {
    debug.enable('abc');
    process.env.LOG_LEVEL = 'warn';

    const logger = debino('abc');

    expect(logger.level).toEqual('warn');
  });

  it('should support multiple components separated by colons', () => {
    const logger = debino('foo:bar:biz:qux');
    const bindings = logger.bindings();

    expect(bindings.name).toEqual('foo');
    expect(bindings.component).toEqual('bar');
    expect(bindings.subcomponent).toEqual('biz');
    expect(bindings.subsubcomponent).toEqual('qux');
  });

  it('should support a different prefix and suffix', () => {
    const logger = debino('foo:bar:biz:qux2', { prefix: 'child', suffix: 'module' });
    const bindings = logger.bindings();

    expect(bindings.name).toEqual('foo');
    expect(bindings.module).toEqual('bar');
    expect(bindings.childmodule).toEqual('biz');
    expect(bindings.childchildmodule).toEqual('qux2');
  });
});

/**
 * Tests for `setRootLogger()`.
 */

describe('setRootLogger', () => {
  it('should throw an error if root logger has `name` binding set', () => {
    expect(() => setRootLogger(pino({ name: 'foo' }))).toThrow(
      'The logger instance must not have a name binding configured'
    );
  });

  it('should throw an error if called after a child logger has been created', () => {
    debino('foo');

    expect(() => setRootLogger(pino())).toThrow('The root logger must be set before creating any child logger');
  });

  it('should store the logger as the root one', () => {
    const rootLogger = pino({ base: { foo: 'bar' } });

    setRootLogger(rootLogger);
    vi.spyOn(rootLogger, 'child');

    const logger = debino('foo');

    expect(rootLogger.child).toHaveBeenCalledTimes(1);
    expect(rootLogger.child).toHaveBeenCalledWith({ name: 'foo' }, {});
    expect(logger.bindings().name).toBe('foo');
    expect(logger.bindings().foo).toBe('bar');
  });
});
