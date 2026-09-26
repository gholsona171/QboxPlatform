import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import {
  MusicError,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  controlKey,
  controlStatus,
  parseMusicActor,
  parseMusicCommand,
  verifyControlRequest,
  type MusicControl,
} from "@qbox/music";

const MAX_BODY_BYTES = 64 * 1024;
const ROUTE = /^\/music\/(\d{17,20})\/(state|command)$/;

export interface MusicControlServerLog {
  warn(message: string, details: Readonly<Record<string, unknown>>): void;
}

/**
 * The bot's local control endpoint for the portal: `GET /music/:guildId/state`
 * and `POST /music/:guildId/command`, bound to 127.0.0.1. Every request must
 * come from this machine and carry an HMAC signature keyed by the bot token.
 */
export class MusicControlServer {
  private server: Server | undefined;
  private readonly key: Buffer;

  public constructor(
    private readonly control: MusicControl,
    discordToken: string,
    private readonly log: MusicControlServerLog = { warn: () => undefined },
    private readonly now: () => number = Date.now,
  ) {
    this.key = controlKey(discordToken);
  }

  /** Starts listening on 127.0.0.1 and resolves with the bound port. */
  public listen(port: number): Promise<number> {
    const server = createServer((request, response) => void this.handle(request, response));
    this.server = server;
    return new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, "127.0.0.1", () => {
        server.off("error", reject);
        resolve((server.address() as AddressInfo).port);
      });
    });
  }

  public close(): Promise<void> {
    const server = this.server;
    this.server = undefined;
    if (!server) return Promise.resolve();
    return new Promise((resolve) => server.close(() => resolve()));
  }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const route = ROUTE.exec(url.pathname);
      const body = await readBody(request);
      const verification = verifyControlRequest(this.key, {
        remoteAddress: request.socket.remoteAddress,
        timestamp: header(request, TIMESTAMP_HEADER),
        signature: header(request, SIGNATURE_HEADER),
        body,
      }, this.now());
      if (!verification.ok) {
        this.log.warn("Refused a music control request.", { reason: verification.reason, remoteAddress: request.socket.remoteAddress });
        return send(response, verification.reason === "remote" ? 403 : 401, { error: { code: "FORBIDDEN", message: "Not allowed." } });
      }
      if (!route) return send(response, 404, { error: { code: "NOT_FOUND", message: "Not found." } });
      const [, guildId, action] = route as unknown as [string, string, "state" | "command"];
      if (action === "state" && request.method === "GET") return send(response, 200, { state: await this.control.state(guildId) });
      if (action === "command" && request.method === "POST") {
        const parsed = JSON.parse(body || "{}") as Record<string, unknown>;
        return send(response, 200, await this.control.command(guildId, parseMusicCommand(parsed), parseMusicActor(parsed["actor"])));
      }
      return send(response, 405, { error: { code: "INVALID_INPUT", message: "Method not allowed." } });
    } catch (error) {
      if (error instanceof MusicError) return send(response, controlStatus(error.code), { error: { code: error.code, message: error.message } });
      if (error instanceof SyntaxError) return send(response, 400, { error: { code: "INVALID_INPUT", message: "The request is not valid JSON." } });
      if (error instanceof BodyTooLargeError) return send(response, 413, { error: { code: "INVALID_INPUT", message: "The request is too large." } });
      this.log.warn("Music control request failed.", { err: error });
      return send(response, 500, { error: { code: "DEPENDENCY_UNAVAILABLE", message: "The music player hit an error. Try again." } });
    }
  }
}

class BodyTooLargeError extends Error {}

function header(request: IncomingMessage, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new BodyTooLargeError("Body too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function send(response: ServerResponse, status: number, payload: unknown): void {
  const text = JSON.stringify(payload);
  response.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(text), "cache-control": "no-store" });
  response.end(text);
}
