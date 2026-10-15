import { type MusicControl } from "@qbox/music";
export interface MusicControlServerLog {
    warn(message: string, details: Readonly<Record<string, unknown>>): void;
}
/**
 * The bot's local control endpoint for the portal: `GET /music/:guildId/state`
 * and `POST /music/:guildId/command`, bound to 127.0.0.1. Every request must
 * come from this machine and carry an HMAC signature keyed by the bot token.
 */
export declare class MusicControlServer {
    private readonly control;
    private readonly log;
    private readonly now;
    private server;
    private readonly key;
    constructor(control: MusicControl, discordToken: string, log?: MusicControlServerLog, now?: () => number);
    /** Starts listening on 127.0.0.1 and resolves with the bound port. */
    listen(port: number): Promise<number>;
    close(): Promise<void>;
    private handle;
}
//# sourceMappingURL=MusicControlServer.d.ts.map