import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { images, imageWidths } from "../lib/images.ts";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "public", "media");
await mkdir(output, { recursive: true });

for (const image of Object.values(images)) {
  const source = resolve(root, image.source);
  for (const width of imageWidths(image.width)) {
    for (const format of ["avif", "webp"]) {
      const target = resolve(output, `${image.slug}-${width}.${format}`);
      await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .toFormat(format, format === "avif" ? { quality: image.slug === "hero-mobile" ? 44 : 53, effort: 5 } : { quality: 78, effort: 5 })
        .toFile(target);
      console.log(`${image.slug} ${width}px ${format}`);
    }
  }
}
