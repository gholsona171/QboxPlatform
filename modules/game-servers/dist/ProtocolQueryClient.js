import { MinecraftBedrockClient } from "./MinecraftBedrockClient.js";
import { MinecraftJavaClient } from "./MinecraftJavaClient.js";
import { SteamQueryClient } from "./SteamQueryClient.js";
/** Picks the protocol client for a server kind. Never throws: failures come back as offline. */
export class ProtocolQueryClient {
    java;
    bedrock;
    steam;
    constructor(java = new MinecraftJavaClient(), bedrock = new MinecraftBedrockClient(), steam = new SteamQueryClient()) {
        this.java = java;
        this.bedrock = bedrock;
        this.steam = steam;
    }
    async query(kind, address) {
        if (kind === "minecraft-java")
            return this.java.query(address);
        if (kind === "minecraft-bedrock")
            return this.bedrock.query(address);
        return this.steam.query(address);
    }
}
//# sourceMappingURL=ProtocolQueryClient.js.map