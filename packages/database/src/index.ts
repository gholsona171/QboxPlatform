export class Database {
  async connect() {
    console.log("Database connected.");
  }

  async disconnect() {
    console.log("Database disconnected.");
  }
}

export const database = new Database();
