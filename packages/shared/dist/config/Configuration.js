export class Configuration {
    nodeEnv = process.env.NODE_ENV ?? "development";
    discordToken = process.env.DISCORD_TOKEN ?? "";
    redisUrl = process.env.REDIS_URL ?? "";
    openAIKey = process.env.OPENAI_API_KEY ?? "";
}
export const configuration = new Configuration();
//# sourceMappingURL=Configuration.js.map