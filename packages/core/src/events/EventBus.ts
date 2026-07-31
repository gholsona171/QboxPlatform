export type EventHandler<TPayload = unknown> = (
  payload: TPayload
) => void | Promise<void>;

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  public on<TPayload>(
    eventName: string,
    handler: EventHandler<TPayload>
  ): () => void {
    const handlers =
      this.handlers.get(eventName) ?? new Set<EventHandler>();

    handlers.add(handler as EventHandler);
    this.handlers.set(eventName, handlers);

    return () => {
      handlers.delete(handler as EventHandler);

      if (handlers.size === 0) {
        this.handlers.delete(eventName);
      }
    };
  }

  public async emit<TPayload>(
    eventName: string,
    payload: TPayload
  ): Promise<void> {
    const handlers = this.handlers.get(eventName);

    if (!handlers) {
      return;
    }

    await Promise.all(
      [...handlers].map((handler) => handler(payload))
    );
  }
}
