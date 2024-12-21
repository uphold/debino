# debino

[![Tests](https://github.com/uphold/debino/actions/workflows/tests.yaml/badge.svg)](https://github.com/uphold/debino/actions/workflows/tests.yaml)
[![Release](https://github.com/uphold/debino/actions/workflows/release.yaml/badge.svg)](https://github.com/uphold/debino/actions/workflows/release.yaml)

A logging library that combines the simplicity and convenience of [debug](https://github.com/debug-js/debug) with the power of [pino](https://github.com/pinojs/pino).

## Installation

```bash
npm install @uphold/debino
```

## Usage

By default, similarly to `debug`'s behavior, loggers do not output any content. Each logger output can be selectively activated by using the `DEBUG` environment variable. Pattern matching is based on the logger's name and it can optionally contain colons (`:`) to create (sub)-components properties on the logger instance.

A logger named `foo:bar:biz` creates a `pino` child logger with `name` equal to `foo`, property `component` equal to `bar` and `subcomponent` equal to `biz`.

Considering the following example:

```js
// example.js
import debino from '@uphold/debino';

const child1 = debino('foo');
const child2 = debino('foo:bar');

child1.debug('net');
child2.debug('qux');
```

*Example output with `DEBUG=foo*`*:

```bash
DEBUG=foo* node example.js

{"level":20,"time":1734717092221,"pid":99831,"hostname":"Andr-Cruz-0688L","name":"foo","msg":"net"}
{"level":20,"time":1734717092221,"pid":99831,"hostname":"Andr-Cruz-0688L","name":"foo","component":"bar","msg":"qux"}
```

*Example output with `DEBUG=foo:bar`*:

```bash
DEBUG=foo:bar node example.js

{"level":20,"time":1734717270874,"pid":1035,"hostname":"Andr-Cruz-0688L","name":"foo","component":"bar","msg":"qux"}
```

The `prefix` and `suffix` for each component is also customizable:

```js
const child = debino('foo', { suffix: 'module' });
```

When creating a child logger, you may also pass any options accepted by `pino.child()` method:

```js
const child = debino('foo', { redact: ['foo']});
```

### Log level

The `level` pino option is respected if the logger output is active.

```js
const logger = debino('root')('foo', { level: 'info' });
```

You may also set the log level via the `LOG_LEVEL` environment variable. However, the `level` option will always take precedence over it.

### Root logger

Every call to `debino` creates a child logger based on a root logger. The default root logger is an instance returned by `pino()`, without any options. You may set your own root logger by calling `setRootLogger()`:

```js
import pino from 'pino';
import debino, { setRootLogger } from '@uphold/debino';

// Call this as soon as possible in your application.
setRootLogger(pino({ redact: ['foo'] }));

const logger = debino('foo');
```

## License

[MIT](./LICENSE)

## Contributing

### Development

Install dependencies:

```bash
npm i
```

Run tests:

```bash
npm run test
```

### Cutting a release

The release process is automated via the [release](https://github.com/uphold/debino/actions/workflows/release.yaml) GitHub workflow. Run it by clicking the "Run workflow" button.
