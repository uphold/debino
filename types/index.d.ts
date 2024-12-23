import { Logger, ChildLoggerOptions, pino } from "pino";

declare function debino(namespace: string, options?: { prefix?: string, suffix?: string } & ChildLoggerOptions): Logger

declare function setRootLogger(logger: Logger)

export default debino;
export { setRootLogger, pino }
