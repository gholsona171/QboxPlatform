import type { MessagePlaceholder } from "@qbox/shared/messages";
/** Sample values for previews, by placeholder name. */
export declare const PLACEHOLDER_SAMPLES: Readonly<Record<string, string>>;
/** A sensible sample for a placeholder the map does not know, from its name. */
export declare function sampleFor(name: string): string;
/** Sample values for every placeholder of a message key. `server` uses the real server name when known. */
export declare function sampleValues(placeholders: readonly MessagePlaceholder[], guildName?: string): Readonly<Record<string, string>>;
//# sourceMappingURL=samples.d.ts.map