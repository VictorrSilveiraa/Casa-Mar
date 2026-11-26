/**
 * MapLibre 6 runs its tile worker as a separate module file. Copies it from node_modules to
 * public/vendor/ so the map (components/LocationMap.tsx) can load it from the site itself.
 * Runs automatically before `next dev` and `next build` (predev / prebuild).
 */
import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
const target = resolve(root, "public/vendor/maplibre-gl-worker.mjs");

await mkdir(resolve(root, "public/vendor"), { recursive: true });
await copyFile(source, target);
console.log("map worker copied to public/vendor/maplibre-gl-worker.mjs");
