export class ServiceContainer {

    private readonly services = new Map<string, unknown>();

    public register<T>(name: string, service: T): void {
        this.services.set(name, service);
    }

    public get<T>(name: string): T {
        const service = this.services.get(name);

        if (!service) {
            throw new Error(`Service '${name}' is not registered.`);
        }

        return service as T;
    }

}
