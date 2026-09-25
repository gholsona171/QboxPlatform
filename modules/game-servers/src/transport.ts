import { createSocket } from "node:dgram";
import { promises as dns } from "node:dns";
import { connect } from "node:net";

/**
 * Small network ports the protocol clients use, so unit tests can feed
 * recorded packets instead of opening sockets.
 */

/** A TCP connection: bytes go out with `write`, chunks come back from the async iterator. */
export interface TcpStream extends AsyncIterable<Buffer> {
  write(data: Buffer): void;
  destroy(): void;
}

export type TcpDialer = (host: string, port: number, timeoutMs: number) => Promise<TcpStream>;

/** A UDP conversation with one peer. */
export interface UdpChannel {
  send(data: Buffer): Promise<void>;
  /** The next datagram, or rejects with `TimeoutError` after `timeoutMs`. */
  receive(timeoutMs: number): Promise<Buffer>;
  close(): void;
}

export type UdpDialer = (host: string, port: number) => Promise<UdpChannel>;

export type SrvResolver = (name: string) => Promise<{ readonly host: string; readonly port: number } | undefined>;

export class TimeoutError extends Error {
  public constructor() {
    super("The server did not answer in time.");
    this.name = "TimeoutError";
  }
}

export const dialTcp: TcpDialer = (host, port, timeoutMs) =>
  new Promise((resolve, reject) => {
    const socket = connect({ host, port });
    socket.setTimeout(timeoutMs, () => socket.destroy(new TimeoutError()));
    socket.once("connect", () => resolve(socket));
    socket.once("error", reject);
  });

export const dialUdp: UdpDialer = async (host, port) => {
  const socket = createSocket("udp4");
  const queue: Buffer[] = [];
  const waiting: { resolve: (data: Buffer) => void; reject: (error: Error) => void }[] = [];
  socket.on("message", (data) => {
    const next = waiting.shift();
    if (next) next.resolve(data);
    else queue.push(data);
  });
  socket.on("error", (error) => {
    for (const next of waiting.splice(0)) next.reject(error);
  });
  return {
    send: (data) => new Promise((resolve, reject) => socket.send(data, port, host, (error) => (error ? reject(error) : resolve()))),
    receive: (timeoutMs) => {
      const queued = queue.shift();
      if (queued) return Promise.resolve(queued);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const index = waiting.findIndex((item) => item.resolve === settle);
          if (index >= 0) waiting.splice(index, 1);
          reject(new TimeoutError());
        }, timeoutMs);
        const settle = (data: Buffer): void => {
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
export const resolveMinecraftSrv: SrvResolver = async (name) => {
  try {
    const records = await dns.resolveSrv(`_minecraft._tcp.${name}`);
    const record = records.sort((left, right) => left.priority - right.priority || right.weight - left.weight)[0];
    return record ? { host: record.name, port: record.port } : undefined;
  } catch {
    return undefined;
  }
};

/** Runs `operation` with a deadline; rejects with `TimeoutError`. */
export async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new TimeoutError()), timeoutMs);
  });
  try {
    return await Promise.race([operation, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

/** Plain-language reason for a failed query. */
export function failureReason(error: unknown): string {
  if (error instanceof TimeoutError) return error.message;
  if (error instanceof Error && "code" in error) {
    const code = String(error.code);
    if (code === "ECONNREFUSED") return "The server refused the connection.";
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "The server address could not be found.";
    if (code === "ETIMEDOUT") return "The server did not answer in time.";
  }
  if (error instanceof Error && error.message.startsWith("The server ")) return error.message;
  return "The server could not be reached.";
}
