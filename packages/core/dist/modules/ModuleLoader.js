export class ModuleLoader {
    modules = [];
    register(module) {
        const alreadyRegistered = this.modules.some((existingModule) => existingModule.name === module.name);
        if (alreadyRegistered) {
            throw new Error(`Module '${module.name}' is already registered.`);
        }
        this.modules.push(module);
    }
    async startAll(context) {
        for (const module of this.modules) {
            await module.start(context);
        }
    }
    async stopAll(context) {
        for (const module of [...this.modules].reverse()) {
            await module.stop?.(context);
        }
    }
    list() {
        return this.modules;
    }
}
//# sourceMappingURL=ModuleLoader.js.map