import type { AutoroleConfig, AutoroleRule, AutoroleRuleInput, CommunityRepository, CommunitySettings, CounterConfig, CounterInput, CustomCommand, CustomCommandInput, EmbedTemplate, EmbedTemplateInput, RulesConfig, ServerLogConfig, StarboardConfig, StarboardEntry, StarboardEntryInput, Suggestion, SuggestionInput, SuggestionUpdate, WelcomeGoodbyeConfig } from "@qbox/discord-community";
import type { PrismaClient } from "@qbox/prisma";
type Client = Pick<PrismaClient, "guild" | "welcomeGoodbyeConfig" | "autoroleConfig" | "autoroleRule" | "rulesConfig" | "communityCounter" | "serverLogConfig" | "embedTemplate" | "customCommand" | "suggestion" | "starboardConfig" | "starboardEntry" | "$transaction">;
export declare class PrismaDiscordCommunityRepository implements CommunityRepository {
    private readonly client;
    private readonly guildRows;
    constructor(client: Client);
    getSettings(guildId: string): Promise<CommunitySettings>;
    saveWelcomeGoodbye(input: WelcomeGoodbyeConfig): Promise<WelcomeGoodbyeConfig>;
    saveAutoroles(input: AutoroleConfig): Promise<AutoroleConfig>;
    addAutorole(input: AutoroleRuleInput): Promise<AutoroleRule>;
    removeAutorole(guildId: string, roleId: string): Promise<void>;
    saveRules(input: RulesConfig): Promise<RulesConfig>;
    saveCounter(input: CounterInput): Promise<CounterConfig>;
    deleteCounter(guildId: string, id: string): Promise<void>;
    saveLogs(input: ServerLogConfig): Promise<ServerLogConfig>;
    saveEmbedTemplate(input: EmbedTemplateInput): Promise<EmbedTemplate>;
    deleteEmbedTemplate(guildId: string, id: string): Promise<void>;
    saveCustomCommand(input: CustomCommandInput): Promise<CustomCommand>;
    deleteCustomCommand(guildId: string, name: string): Promise<void>;
    createSuggestion(input: SuggestionInput): Promise<Suggestion>;
    updateSuggestion(input: SuggestionUpdate): Promise<Suggestion>;
    saveStarboard(input: StarboardConfig): Promise<StarboardConfig>;
    upsertStarboardEntry(input: StarboardEntryInput): Promise<StarboardEntry>;
    markStarboardEntryDeleted(guildId: string, sourceMessageId: string): Promise<void>;
    private ensureGuild;
    private updateAutoroles;
    private updateRules;
}
export {};
//# sourceMappingURL=PrismaDiscordCommunityRepository.d.ts.map