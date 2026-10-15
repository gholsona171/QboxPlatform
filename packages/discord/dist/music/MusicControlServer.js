import { createServer } from "node:http";
import { MusicError, SIGNATURE_HEADER, TIMESTAMP_HEADER, controlKey, controlStatus, parseMusicActor, parseMusicCommand, verifyControlRequest, } from "@qbox/music";
const MAX_BODY_BYTES = 64 * 1024;
const ROUTE = /^\/music\/(\d{17,20})\/(state|command)$/;
/**
 * The bot's local control endpoint for the portal: `GET /music/:guildId/state`
 * and `POST /music/:guildId/command`, bound to 127.0.0.1. Every request must
 * come from this machine and carry an HMAC signature keyed by the bot token.
 */
export class MusicControlServer {
    control;
    log;
    now;
    server;
    key;
    constructor(control, discordToken, log = { warn: () => undefined }, now = Date.now) {
        this.control = control;
        this.log = log;
        this.now = now;
        this.key = controlKey(discordToken);
    }
    /** Starts listening on 127.0.0.1 and resolves with the bound port. */
    listen(port) {
        const server = createServer((request, response) => void this.handle(request, response));
        this.server = server;
        return new Promise((resolve, reject) => {
            server.once("error", reject);
            server.listen(port, "127.0.0.1", () => {
                server.off("error", reject);
                resolve(server.address().port);
            });
        });
    }
    close() {
        const server = this.server;
        this.server = undefined;
        if (!server)
            return Promise.resolve();
        return new Promise((resolve) => server.close(() => resolve()));
    }
    async handle(request, response) {
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
            if (!route)
                return send(response, 404, { error: { code: "NOT_FOUND", message: "Not found." } });
            const [, guildId, action] = route;
            if (action === "state" && request.method === "GET")
                return send(response, 200, { state: await this.control.state(guildId) });
            if (action === "command" && request.method === "POST") {
                const parsed = JSON.parse(body || "{}");
                return send(response, 200, await this.control.command(guildId, parseMusicCommand(parsed), parseMusicActor(parsed["actor"])));
            }
            return send(response, 405, { error: { code: "INVALID_INPUT", message: "Method not allowed." } });
        }
        catch (error) {
            if (error instanceof MusicError)
                return send(response, controlStatus(error.code), { error: { code: error.code, message: error.message } });
            if (error instanceof SyntaxError)
                return send(response, 400, { error: { code: "INVALID_INPUT", message: "The request is not valid JSON." } });
            if (error instanceof BodyTooLargeError)
                return send(response, 413, { error: { code: "INVALID_INPUT", message: "The request is too large." } });
            this.log.warn("Music control request failed.", { err: error });
            return send(response, 500, { error: { code: "DEPENDENCY_UNAVAILABLE", message: "The music player hit an error. Try again." } });
        }
    }
}
class BodyTooLargeError extends Error {
}
function header(request, name) {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0] : value;
}
async function readBody(request) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES)
            throw new BodyTooLargeError("Body too large.");
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
}
function send(response, status, payload) {
    const text = JSON.stringify(payload);
    response.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(text), "cache-control": "no-store" });
    response.end(text);
}
//# sourceMappingURL=MusicControlServer.js.map