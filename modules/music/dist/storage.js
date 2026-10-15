import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { MusicError, isSnowflake } from "./validation.js";
/** Stored names are always `<uuid>.<ext>`; client file names never reach the disk. */
const STORED_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/;
/** Library files under `<root>/<guildId>/<uuid>.<ext>`. The API writes; the bot reads. */
export class LocalMusicStorage {
    root;
    constructor(root) {
        this.root = resolve(root);
    }
    path(guildId, fileName) {
        if (!isSnowflake(guildId) || !STORED_NAME.test(fileName))
            throw new MusicError("INVALID_INPUT", "That file name is not valid.");
        return join(this.root, guildId, fileName);
    }
    async write(guildId, fileName, data) {
        const path = this.path(guildId, fileName);
        await mkdir(join(this.root, guildId), { recursive: true });
        await writeFile(path, data, { flag: "wx" });
    }
    read(guildId, fileName) {
        return readFile(this.path(guildId, fileName));
    }
    async remove(guildId, fileName) {
        await rm(this.path(guildId, fileName), { force: true });
    }
}
//# sourceMappingURL=storage.js.map