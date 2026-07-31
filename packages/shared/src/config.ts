export const AppConfig = {
  name: "Qbox Platform",
  version: "0.1.0",
  environment: process.env.NODE_ENV ?? "development",
  debug: process.env.NODE_ENV !== "production"
} as const;
