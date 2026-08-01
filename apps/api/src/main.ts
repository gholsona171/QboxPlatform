import { logger } from "@qbox/logger";
import { createApiApplication } from "./composition/ApiApplication.js";
import type { ApiConfigurationInput } from "./config/ApiConfiguration.js";
import { installApiSignalHandlers } from "./process/ApiSignalHandler.js";

/** Raw values read only by the executable composition boundary. */
export interface ApiProcessEnvironment {
  readonly NODE_ENV?: string | undefined;
  readonly DATABASE_URL?: string | undefined;
  readonly API_HOST?: string | undefined;
  readonly API_PORT?: string | undefined;
  readonly API_BODY_SIZE_LIMIT_BYTES?: string | undefined;
  readonly API_REQUEST_TIMEOUT_MS?: string | undefined;
  readonly API_KEEP_ALIVE_TIMEOUT_MS?: string | undefined;
  readonly API_SHUTDOWN_TIMEOUT_MS?: string | undefined;
  readonly API_TRUST_PROXY?: string | undefined;
  readonly API_PUBLIC_BASE_URL?: string | undefined;
  readonly LOG_LEVEL?: string | undefined;
  readonly QBOX_BUILD_VERSION?: string | undefined;
}

/** Parses raw process values without applying empty-string fallbacks. */
export function apiConfigurationFromEnvironment(
  environment: ApiProcessEnvironment,
): ApiConfigurationInput {
  return {
    environment: environment.NODE_ENV,
    host: environment.API_HOST,
    port: optionalNumber(environment.API_PORT),
    bodySizeLimitBytes: optionalNumber(environment.API_BODY_SIZE_LIMIT_BYTES),
    requestTimeoutMs: optionalNumber(environment.API_REQUEST_TIMEOUT_MS),
    keepAliveTimeoutMs: optionalNumber(environment.API_KEEP_ALIVE_TIMEOUT_MS),
    shutdownTimeoutMs: optionalNumber(environment.API_SHUTDOWN_TIMEOUT_MS),
    trustProxy: parseTrustProxy(environment.API_TRUST_PROXY),
    publicBaseUrl: environment.API_PUBLIC_BASE_URL,
    logLevel: environment.LOG_LEVEL,
    buildVersion: environment.QBOX_BUILD_VERSION,
  };
}

/** Starts the real API process; imports alone never invoke this function. */
export async function main(environment: ApiProcessEnvironment): Promise<() => void> {
  const application = createApiApplication({
    api: apiConfigurationFromEnvironment(environment),
    databaseUrl: environment.DATABASE_URL,
  });
  const removeSignals = installApiSignalHandlers(application, logger);
  try {
    await application.start();
    const bound = application.apiModule.diagnostics();
    logger.info(
      {
        service: "qbox-api",
        version: application.configuration.diagnostics().buildVersion,
        host: bound?.host,
        port: bound?.port,
        readiness: "ready",
      },
      "Qbox API started.",
    );
    return removeSignals;
  } catch (error) {
    removeSignals();
    logger.error(
      { errorName: error instanceof Error ? error.name : "unknown" },
      "Qbox API startup failed.",
    );
    throw error;
  }
}

function optionalNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseTrustProxy(value: string | undefined): false | readonly string[] | undefined {
  if (value === undefined) return undefined;
  if (value === "false") return false;
  return value.split(",").map((address) => address.trim());
}
