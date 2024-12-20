import { Logger, ChildLoggerOptions } from "pino";

export function setRootLogger(logger: Logger)

declare function debino(namespace: string, options?: { prefix?: string, suffix?: string } & ChildLoggerOptions): Logger

export default debino;
