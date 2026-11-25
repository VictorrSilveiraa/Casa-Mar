import { content } from "./content";
import type { ImageKey } from "./images";

export type GalleryKey = keyof typeof galleries;

export const galleries = {
  ambientes: {
    label: "Galeria de ambientes",
    heading: "CASA PRAIAMAR — AMBIENTES",
    images: ["poolNight", "poolDay", "kitchen", "social", "dusk", "poolSide"] as ImageKey[],
  },
  suites: {
    label: "Galeria de suítes",
    heading: "CASA PRAIAMAR — SUÍTES",
    images: [...content.suites.images] as ImageKey[],
  },
} as const;
