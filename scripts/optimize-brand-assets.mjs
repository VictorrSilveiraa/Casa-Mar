import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { brandAssets } from "../lib/brand.ts";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public", "brand");
await mkdir(output, { recursive: true });

for (const [name, asset] of Object.entries(brandAssets.header)) {
  const source = resolve(root, asset.source);
  const pipeline = sharp(source).extract(asset.crop).resize({ width: 640, withoutEnlargement: true });
  await pipeline.clone().avif({ quality: 58, effort: 5 }).toFile(resolve(output, `praiamar-${name}.avif`));
  await pipeline.clone().webp({ quality: 82, effort: 5 }).toFile(resolve(output, `praiamar-${name}.webp`));
  console.log(`praiamar-${name}: AVIF and WebP`);
}
