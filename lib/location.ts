import { siteConfig } from "./site.config";

/**
 * Location data — the only place to edit the map, the nearby points and the route links.
 * Points and distances were given by the owner (26/11/2026). Do not add a point without confirmation.
 */

export type LocationIcon = "kite" | "restaurant" | "waves" | "wind";

export const nearbyPoints: { icon: LocationIcon; label: string; detail?: string }[] = [
  { icon: "kite", label: "Kite point", detail: "10 m" },
  { icon: "restaurant", label: "Restaurante", detail: "30 m" },
  { icon: "waves", label: "Frente ao mar" },
  { icon: "wind", label: "Destino de kitesurf" },
];

const { latitude, longitude } = siteConfig.coordinates;
const destination = `${latitude},${longitude}`;

/** MapLibre bounds must be [south-west, north-east]. */
function frame(a: [number, number], b: [number, number]): [[number, number], [number, number]] {
  return [[Math.min(a[0], b[0]), Math.min(a[1], b[1])], [Math.max(a[0], b[0]), Math.max(a[1], b[1])]];
}

export const mapView = {
  center: [longitude, latitude] as [number, number],
  /**
   * Opening frame: the house plus the centre of Acaraú (approximate, framing only — never shown as
   * a fact), so guests see the beach and the town together. Padding keeps both clear of the controls.
   */
  bounds: frame([longitude, latitude], [-40.1197, -2.8856]),
  /** Top clears the "De onde você vem?" box plus the ~56px house marker drawn above its point. */
  padding: { top: 150, right: 72, bottom: 56, left: 48 },
  minZoom: 8,
  maxZoom: 18,
};

/** OpenFreeMap vector tiles, recoloured with the site palette in lib/map-style.ts. */
export const openFreeMap = {
  tiles: "https://tiles.openfreemap.org/planet",
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
};

export const routeLinks = {
  googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
  waze: `https://waze.com/ul?ll=${destination}&navigate=yes`,
  /** Directions from what the visitor typed in "De onde você vem?". */
  googleMapsFrom: (origin: string) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${destination}`,
};
