import { config } from "dotenv";

config();

export function loadEnvironment(): void {
    console.log("✅ Environment loaded.");
}
