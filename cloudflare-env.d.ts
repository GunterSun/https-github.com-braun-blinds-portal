interface Fetcher {
  fetch(input: Request): Promise<Response>;
}

type D1Database = Parameters<typeof import("drizzle-orm/d1").drizzle>[0];

declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database;
  };
}
