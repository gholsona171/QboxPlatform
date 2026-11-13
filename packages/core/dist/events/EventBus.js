export class EventBus {
    handlers = new Map();
    on(eventName, handler) {
        const handlers = this.handlers.get(eventName) ?? new Set();
        handlers.add(handler);
        this.handlers.set(eventName, handlers);
        return () => {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.handlers.delete(eventName);
            }
        };
    }
    async emit(eventName, payload) {
        const handlers = this.handlers.get(eventName);
        if (!handlers) {
            return;
        }
        await Promise.all([...handlers].map((handler) => handler(payload)));
    }
}
//# sourceMappingURL=EventBus.js.map