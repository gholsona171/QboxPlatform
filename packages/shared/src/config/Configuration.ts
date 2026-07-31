export class Configuration {

    public readonly nodeEnv =
        process.env.NODE_ENV ?? "development";

    public readonly discordToken =
        process.env.DISCORD_TOKEN ?? "";

    public readonly databaseUrl =
        process.env.DATABASE_URL ?? "";

    public readonly redisUrl =
        process.env.REDIS_URL ?? "";

    public readonly openAIKey =
        process.env.OPENAI_API_KEY ?? "";

}

export const configuration = new Configuration();
