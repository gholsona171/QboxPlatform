import type {
  PlatformModule,
  PlatformModuleContext
} from "./PlatformModule.js";

export class ModuleLoader {
  private readonly modules: PlatformModule[] = [];

  public register(module: PlatformModule): void {
    const alreadyRegistered = this.modules.some(
      (existingModule) => existingModule.name === module.name
    );

    if (alreadyRegistered) {
      throw new Error(
        `Module '${module.name}' is already registered.`
      );
    }

    this.modules.push(module);
  }

  public async startAll(
    context: PlatformModuleContext
  ): Promise<void> {
    for (const module of this.modules) {
      await module.start(context);
    }
  }

  public async stopAll(
    context: PlatformModuleContext
  ): Promise<void> {
    for (const module of [...this.modules].reverse()) {
      await module.stop?.(context);
    }
  }

  public list(): readonly PlatformModule[] {
    return this.modules;
  }
}
