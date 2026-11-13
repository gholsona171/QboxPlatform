export class ServiceContainer {
    services = new Map();
    register(name, service) {
        this.services.set(name, service);
    }
    get(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service '${name}' is not registered.`);
        }
        return service;
    }
}
//# sourceMappingURL=ServiceContainer.js.map