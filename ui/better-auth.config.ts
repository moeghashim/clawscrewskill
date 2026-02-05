// Placeholder Better Auth config.
// Replace with real configuration and install the Better Auth package when ready.

export const betterAuthConfig = {
  secret: process.env.BETTER_AUTH_SECRET ?? "",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
};
