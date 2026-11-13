import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { commandFileIdentity, CommandValidationError, CommandValidator } from "../validation/CommandValidator.js";
export class CommandLoadError extends Error {
    diagnostics;
    constructor(message, diagnostics) {
        super(message);
        this.diagnostics = diagnostics;
        this.name = "CommandLoadError";
    }
}
const commandFilePattern = /\.command\.(?:ts|js)$/;
function defaultCommandDirectory() {
    return fileURLToPath(new URL("../commands/", import.meta.url));
}
async function defaultImportModule(filePath) {
    return await import(pathToFileURL(filePath).href);
}
export class CommandLoader {
    commandDirectory;
    readDirectory;
    importModule;
    validator;
    constructor(options = {}) {
        this.commandDirectory =
            options.commandDirectory ?? defaultCommandDirectory();
        this.readDirectory = options.readDirectory ?? readdir;
        this.importModule = options.importModule ?? defaultImportModule;
        this.validator = options.validator ?? new CommandValidator();
    }
    async load() {
        const startedAt = performance.now();
        const files = (await this.readDirectory(this.commandDirectory))
            .filter((file) => commandFilePattern.test(file))
            .sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
        const discoveredModules = [];
        const importFailures = [];
        const discoveryWarnings = files.length === 0
            ? [{
                    file: this.commandDirectory,
                    message: "No command files were discovered."
                }]
            : [];
        const discoveredIdentities = new Map();
        const duplicateFailures = [];
        for (const file of files) {
            const identity = commandFileIdentity(file);
            const existingFile = discoveredIdentities.get(identity);
            if (existingFile) {
                duplicateFailures.push({
                    file,
                    message: `Duplicate command file identity also used by '${existingFile}'.`
                });
            }
            else {
                discoveredIdentities.set(identity, file);
            }
        }
        if (duplicateFailures.length > 0) {
            throw new CommandLoadError("Duplicate command files were discovered.", {
                discovered: files.length,
                validated: 0,
                loadDurationMs: performance.now() - startedAt,
                commandFiles: files,
                commandNames: [],
                commandAliases: [],
                warnings: discoveryWarnings,
                failures: duplicateFailures
            });
        }
        for (const file of files) {
            const filePath = join(this.commandDirectory, file);
            try {
                discoveredModules.push({
                    file,
                    exports: await this.importModule(filePath)
                });
            }
            catch (error) {
                importFailures.push({
                    file,
                    message: error instanceof Error
                        ? `Import failed: ${error.message}`
                        : "Import failed with a non-Error value."
                });
            }
        }
        try {
            const validation = this.validator.validate(discoveredModules);
            const failures = [
                ...importFailures,
                ...validation.failures
            ];
            const diagnostics = {
                discovered: files.length,
                validated: validation.commands.length,
                loadDurationMs: performance.now() - startedAt,
                commandFiles: files,
                commandNames: validation.commands.map((command) => command.data.name),
                commandAliases: validation.commands.flatMap((command) => command.aliases ?? []),
                warnings: [
                    ...discoveryWarnings,
                    ...validation.warnings
                ],
                failures
            };
            if (failures.length > 0) {
                throw new CommandLoadError("Command loading failed validation.", diagnostics);
            }
            return {
                commands: validation.commands,
                diagnostics
            };
        }
        catch (error) {
            if (error instanceof CommandLoadError) {
                throw error;
            }
            if (error instanceof CommandValidationError) {
                throw new CommandLoadError(error.message, {
                    discovered: files.length,
                    validated: error.validatedCount,
                    loadDurationMs: performance.now() - startedAt,
                    commandFiles: files,
                    commandNames: [],
                    commandAliases: [],
                    warnings: [
                        ...discoveryWarnings,
                        ...error.warnings
                    ],
                    failures: [
                        ...importFailures,
                        ...error.failures
                    ]
                });
            }
            throw error;
        }
    }
}
//# sourceMappingURL=CommandLoader.js.map