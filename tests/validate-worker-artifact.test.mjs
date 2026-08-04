import assert from "node:assert/strict";
import test from "node:test";
import { validateHostingManifest, validateWorkerSource } from "../scripts/validate-worker-artifact.mjs";

test("accepts a bundled Cloudflare Worker without importing its runtime modules", () => {
  assert.doesNotThrow(() => validateWorkerSource(`
    import { env } from "cloudflare:workers";
    var worker_entry_default = { async fetch(request, env, ctx) { return new Response("ok"); } };
    export { worker_entry_default as default };
  `));
});

test("accepts a direct default Worker object", () => {
  assert.doesNotThrow(() => validateWorkerSource("export default { fetch(request) { return new Response(); } };"));
});

test("rejects a module without a default export", () => {
  assert.throws(() => validateWorkerSource("export const fetch = () => {};"), /default export/);
});

test("rejects a default binding without fetch", () => {
  assert.throws(() => validateWorkerSource("const worker = {}; export { worker as default };"), /must define fetch/);
});

test("requires a JSON object hosting manifest", () => {
  assert.doesNotThrow(() => validateHostingManifest('{"d1":"DB"}'));
  assert.throws(() => validateHostingManifest("[]"), /JSON object/);
  assert.throws(() => validateHostingManifest("not-json"), /JSON/);
});
