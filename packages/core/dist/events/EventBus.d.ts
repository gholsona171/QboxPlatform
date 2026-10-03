export type EventHandler<TPayload = unknown> = (payload: TPayload) => void | Promise<void>;
export declare class EventBus {
    private readonly handlers;
    on<TPayload>(eventName: string, handler: EventHandler<TPayload>): () => void;
    emit<TPayload>(eventName: string, payload: TPayload): Promise<void>;
}
//# sourceMappingURL=EventBus.d.ts.map