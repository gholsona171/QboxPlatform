export class Kernel {
  public async start(): Promise<void> {
    console.log("Qbox Platform Kernel starting...");
  }

  public async stop(): Promise<void> {
    console.log("Qbox Platform Kernel stopping...");
  }
}
