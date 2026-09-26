import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { MusicStorage } from "./types.js";
import { MusicError, isSnowflake } from "./validation.js";

/** Stored names are always `<uuid>.<ext>`; client file names never reach the disk. */
const STORED_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/;

/** Library files under `<root>/<guildId>/<uuid>.<ext>`. The API writes; the bot reads. */
export class LocalMusicStorage implements MusicStorage {
  private readonly root: string;

  public constructor(root: string) {
    this.root = resolve(root);
  }

  public path(guildId: string, fileName: string): string {
    if (!isSnowflake(guildId) || !STORED_NAME.test(fileName)) throw new MusicError("INVALID_INPUT", "That file name is not valid.");
    return join(this.root, guildId, fileName);
  }

  public async write(guildId: string, fileName: string, data: Buffer): Promise<void> {
    const path = this.path(guildId, fileName);
    await mkdir(join(this.root, guildId), { recursive: true });
    await writeFile(path, data, { flag: "wx" });
  }

  public read(guildId: string, fileName: string): Promise<Buffer> {
    return readFile(this.path(guildId, fileName));
  }

  public async remove(guildId: string, fileName: string): Promise<void> {
    await rm(this.path(guildId, fileName), { force: true });
  }
}
