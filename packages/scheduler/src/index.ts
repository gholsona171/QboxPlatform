export class Scheduler {
  start() {
    console.log("Scheduler started.");
  }

  stop() {
    console.log("Scheduler stopped.");
  }
}

export const scheduler = new Scheduler();
