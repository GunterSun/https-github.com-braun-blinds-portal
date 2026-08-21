interface Fetcher {
  fetch(input: Request): Promise<Response>;
}

type D1Database = Parameters<typeof import("drizzle-orm/d1").drizzle>[0];
interface R2ObjectBody { body: ReadableStream; httpMetadata?: { contentType?: string }; }
interface R2Bucket { put(key:string,value:ArrayBuffer|ReadableStream,options?:{httpMetadata?:{contentType?:string};customMetadata?:Record<string,string>}):Promise<unknown>; get(key:string):Promise<R2ObjectBody|null>; }

declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database;
    MEDIA: R2Bucket;
  };
}
