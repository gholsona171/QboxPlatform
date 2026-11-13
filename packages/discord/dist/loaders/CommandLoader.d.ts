import type { DiscordCommand } from "../commands/DiscordCommand.js";
import { CommandValidator } from "../validation/CommandValidator.js";
import type { CommandDiagnostic } from "../validation/CommandValidator.js";
export interface CommandLoadDiagnostics {
    readonly discovered: number;
    readonly validated: number;
    readonly loadDurationMs: number;
    readonly commandFiles: readonly string[];
    readonly commandNames: readonly string[];
    readonly commandAliases: readonly string[];
    readonly warnings: readonly CommandDiagnostic[];
    readonly failures: readonly CommandDiagnostic[];
}
export interface CommandLoadResult {
    readonly commands: readonly DiscordCommand[];
    readonly diagnostics: CommandLoadDiagnostics;
}
export declare class CommandLoadError extends Error {
    readonly diagnostics: CommandLoadDiagnostics;
    constructor(message: string, diagnostics: CommandLoadDiagnostics);
}
export type CommandModuleImporter = (filePath: string) => Promise<Record<string, unknown>>;
export interface CommandLoaderOptions {
    readonly commandDirectory?: string;
    readonly readDirectory?: (directory: string) => Promise<string[]>;
    readonly importModule?: CommandModuleImporter;
    readonly validator?: CommandValidator;
}
export declare class CommandLoader {
    private readonly commandDirectory;
    private readonly readDirectory;
    private readonly importModule;
    private readonly validator;
    constructor(options?: CommandLoaderOptions);
    load(): Promise<CommandLoadResult>;
}
//# sourceMappingURL=CommandLoader.d.ts.map