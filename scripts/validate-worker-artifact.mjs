import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function validateWorkerSource(source) {
  if (/export\s+default\s*\{[\s\S]*?\b(?:async\s+)?fetch\s*\(/m.test(source)) return;

  const defaultExport = source.match(/export\s*\{\s*([A-Za-z_$][\w$]*)\s+as\s+default\s*\}/m);
  if (!defaultExport) {
    throw new Error("Worker entry must have an ESM default export");
  }

  const binding = escapeRegExp(defaultExport[1]);
  const workerObject = new RegExp(
    `(?:const|let|var)\\s+${binding}\\s*=\\s*\\{[\\s\\S]*?\\b(?:async\\s+)?fetch\\s*\\(`,
    "m",
  );
  if (!workerObject.test(source)) {
    throw new Error("Worker default export must define fetch(request, env, ctx)");
  }
}

export function validateHostingManifest(source) {
  const manifest = JSON.parse(source);
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("Sites hosting manifest must be a JSON object");
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const [workerPath, hostingPath] = process.argv.slice(2);
  if (!workerPath || !hostingPath) throw new Error("usage: validate-worker-artifact.mjs worker hosting-manifest");
  const [workerSource, hostingSource] = await Promise.all([
    readFile(workerPath, "utf8"),
    readFile(hostingPath, "utf8"),
  ]);
  validateWorkerSource(workerSource);
  validateHostingManifest(hostingSource);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
