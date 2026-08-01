/** Safe structured fields accepted by API loggers. */
export type ApiLogFields = Readonly<Record<string, unknown>>;

/** Minimal Pino-compatible logger boundary used by the HTTP transport. */
export interface ApiLogger {
  child(bindings: ApiLogFields): ApiLogger;
  info(fields: ApiLogFields, message: string): void;
  warn(fields: ApiLogFields, message: string): void;
  error(fields: ApiLogFields, message: string): void;
}
