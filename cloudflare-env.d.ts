interface Fetcher {
  fetch(input: Request): Promise<Response>;
}

type D1Database = Parameters<typeof import("drizzle-orm/d1").drizzle>[0];

/** Minimal R2 binding surface used by measurement, installation and service media routes. */
interface BraunMediaBucket {
  put(key: string, value: ArrayBuffer | ReadableStream, options?: {
    httpMetadata?: { contentType?: string };
    customMetadata?: Record<string, string>;
  }): Promise<unknown>;
  get(key: string): Promise<{
    body: ReadableStream;
    httpMetadata?: { contentType?: string };
  } | null>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database;
    MEDIA: BraunMediaBucket;
  };
}
