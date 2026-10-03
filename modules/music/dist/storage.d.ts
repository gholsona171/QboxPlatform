import type { MusicStorage } from "./types.js";
/** Library files under `<root>/<guildId>/<uuid>.<ext>`. The API writes; the bot reads. */
export declare class LocalMusicStorage implements MusicStorage {
    private readonly root;
    constructor(root: string);
    path(guildId: string, fileName: string): string;
    write(guildId: string, fileName: string, data: Buffer): Promise<void>;
    read(guildId: string, fileName: string): Promise<Buffer>;
    remove(guildId: string, fileName: string): Promise<void>;
}
//# sourceMappingURL=storage.d.ts.map