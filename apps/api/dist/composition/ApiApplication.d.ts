import { PlatformKernel } from "@qbox/core";
import { ApiConfiguration, type ApiConfigurationInput } from "../config/ApiConfiguration.js";
import { ApiAuthenticationConfiguration, type ApiAuthenticationConfigurationInput } from "../auth/ApiAuthenticationConfiguration.js";
import { ApiLifecycleHealth } from "../lifecycle/ApiLifecycleHealth.js";
import { ApiModule } from "../lifecycle/ApiModule.js";
/** Validated composition input supplied by the executable environment layer. */
export interface ApiApplicationInput {
    readonly api: ApiConfigurationInput;
    readonly authentication: ApiAuthenticationConfigurationInput;
    readonly databaseUrl: string | undefined;
    /** Absolute portal asset directory served from the API origin, when present. */
    readonly portalDirectory?: string | undefined;
    readonly discord?: {
        readonly token?: string | undefined;
        readonly applicationId?: string | undefined;
    } | undefined;
}
/** Process-owned API application with idempotent bounded cleanup. */
export declare class ApiApplication {
    readonly kernel: PlatformKernel;
    readonly configuration: ApiConfiguration;
    readonly authenticationConfiguration: ApiAuthenticationConfiguration;
    readonly health: ApiLifecycleHealth;
    readonly apiModule: ApiModule;
    private startAttempted;
    private shutdownPromise;
    constructor(kernel: PlatformKernel, configuration: ApiConfiguration, authenticationConfiguration: ApiAuthenticationConfiguration, health: ApiLifecycleHealth, apiModule: ApiModule);
    start(): Promise<void>;
    shutdown(): Promise<void>;
}
/** Composes one API process without starting it or reading process environment. */
export declare function createApiApplication(input: ApiApplicationInput): ApiApplication;
//# sourceMappingURL=ApiApplication.d.ts.map