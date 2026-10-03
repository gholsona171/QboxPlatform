import { EmbedBuilder } from "discord.js";
/** Embed shape the feature modules produce (knowledge base, FiveM). */
export interface FeatureEmbed {
    readonly title: string;
    readonly description: string;
    readonly color: string;
    readonly url?: string | undefined;
    readonly fields?: readonly {
        readonly name: string;
        readonly value: string;
        readonly inline?: boolean;
    }[] | undefined;
    readonly footer?: string | undefined;
    readonly timestamp?: Date | undefined;
}
/** Converts a feature embed into a discord.js embed for interaction replies. */
export declare function toEmbedBuilder(embed: FeatureEmbed): EmbedBuilder;
//# sourceMappingURL=featureEmbeds.d.ts.map