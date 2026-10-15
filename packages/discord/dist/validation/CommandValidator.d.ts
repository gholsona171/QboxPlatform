import type { DiscordCommand } from "../commands/DiscordCommand.js";
export interface DiscoveredCommandModule {
    readonly file: string;
    readonly exports: Record<string, unknown>;
}
export interface CommandDiagnostic {
    readonly file: string;
    readonly message: string;
}
export interface CommandValidationResult {
    readonly commands: readonly DiscordCommand[];
    readonly warnings: readonly CommandDiagnostic[];
    readonly failures: readonly CommandDiagnostic[];
}
export declare class CommandValidationError extends Error {
    readonly failures: readonly CommandDiagnostic[];
    readonly warnings: readonly CommandDiagnostic[];
    readonly validatedCount: number;
    constructor(failures: readonly CommandDiagnostic[], warnings: readonly CommandDiagnostic[], validatedCount: number);
}
export declare function commandFileIdentity(file: string): string;
export declare class CommandValidator {
    validate(modules: readonly DiscoveredCommandModule[]): CommandValidationResult;
    private validateCommand;
    private validateOptions;
    private validateOptionList;
    private validatePolicy;
    private validateUniqueNames;
}
//# sourceMappingURL=CommandValidator.d.ts.map