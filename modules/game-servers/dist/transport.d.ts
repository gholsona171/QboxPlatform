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
export type SrvResolver = (name: string) => Promise<{
    readonly host: string;
    readonly port: number;
} | undefined>;
export declare class TimeoutError extends Error {
    constructor();
}
export declare const dialTcp: TcpDialer;
export declare const dialUdp: UdpDialer;
/** `_minecraft._tcp.<name>` SRV lookup; undefined when there is none. */
export declare const resolveMinecraftSrv: SrvResolver;
/** Runs `operation` with a deadline; rejects with `TimeoutError`. */
export declare function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T>;
/** Plain-language reason for a failed query. */
export declare function failureReason(error: unknown): string;
//# sourceMappingURL=transport.d.ts.map