import { createSocket } from "node:dgram";
import { promises as dns } from "node:dns";
import { connect } from "node:net";
export class TimeoutError extends Error {
    constructor() {
        super("The server did not answer in time.");
        this.name = "TimeoutError";
    }
}
export const dialTcp = (host, port, timeoutMs) => new Promise((resolve, reject) => {
    const socket = connect({ host, port });
    socket.setTimeout(timeoutMs, () => socket.destroy(new TimeoutError()));
    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
});
export const dialUdp = async (host, port) => {
    const socket = createSocket("udp4");
    const queue = [];
    const waiting = [];
    socket.on("message", (data) => {
        const next = waiting.shift();
        if (next)
            next.resolve(data);
        else
            queue.push(data);
    });
    socket.on("error", (error) => {
        for (const next of waiting.splice(0))
            next.reject(error);
    });
    return {
        send: (data) => new Promise((resolve, reject) => socket.send(data, port, host, (error) => (error ? reject(error) : resolve()))),
        receive: (timeoutMs) => {
            const queued = queue.shift();
            if (queued)
                return Promise.resolve(queued);
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    const index = waiting.findIndex((item) => item.resolve === settle);
                    if (index >= 0)
                        waiting.splice(index, 1);
                    reject(new TimeoutError());
                }, timeoutMs);
                const settle = (data) => {
                    clearTimeout(timer);
                    resolve(data);
                };
                waiting.push({ resolve: settle, reject: (error) => { clearTimeout(timer); reject(error); } });
            });
        },
        close: () => socket.close(),
    };
};
/** `_minecraft._tcp.<name>` SRV lookup; undefined when there is none. */
export const resolveMinecraftSrv = async (name) => {
    try {
        const records = await dns.resolveSrv(`_minecraft._tcp.${name}`);
        const record = records.sort((left, right) => left.priority - right.priority || right.weight - left.weight)[0];
        return record ? { host: record.name, port: record.port } : undefined;
    }
    catch {
        return undefined;
    }
};
/** Runs `operation` with a deadline; rejects with `TimeoutError`. */
export async function withTimeout(operation, timeoutMs) {
    let timer;
    const deadline = new Promise((_resolve, reject) => {
        timer = setTimeout(() => reject(new TimeoutError()), timeoutMs);
    });
    try {
        return await Promise.race([operation, deadline]);
    }
    finally {
        clearTimeout(timer);
    }
}
/** Plain-language reason for a failed query. */
export function failureReason(error) {
    if (error instanceof TimeoutError)
        return error.message;
    if (error instanceof Error && "code" in error) {
        const code = String(error.code);
        if (code === "ECONNREFUSED")
            return "The server refused the connection.";
        if (code === "ENOTFOUND" || code === "EAI_AGAIN")
            return "The server address could not be found.";
        if (code === "ETIMEDOUT")
            return "The server did not answer in time.";
    }
    if (error instanceof Error && error.message.startsWith("The server "))
        return error.message;
    return "The server could not be reached.";
}
//# sourceMappingURL=transport.js.map