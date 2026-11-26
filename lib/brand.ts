export const brandAssets = {
  header: {
    transparent: {
      source: "assets/brand/praiamar-white-original.png",
      crop: { left: 92, top: 444, width: 1271, height: 191 },
      avif: "/brand/praiamar-transparent.avif",
      webp: "/brand/praiamar-transparent.webp",
    },
    solid: {
      source: "assets/brand/praiamar-dark-original.png",
      crop: { left: 89, top: 443, width: 1284, height: 201 },
      avif: "/brand/praiamar-solid.avif",
      webp: "/brand/praiamar-solid.webp",
    },
  },
  /** Sunrise loader parts, cut in horizontal bands from the official white logo (gaps between bands are empty). */
  loader: {
    source: "assets/brand/praiamar-white-original.png",
    symbolBox: { top: 456, height: 168 },
    parts: {
      sun: { left: 105, top: 456, width: 162, height: 64 },
      house: { left: 105, top: 521, width: 162, height: 68 },
      waves: { left: 105, top: 594, width: 162, height: 30 },
      wordmark: { left: 337, top: 488, width: 1014, height: 135 },
    },
  },
} as const;
