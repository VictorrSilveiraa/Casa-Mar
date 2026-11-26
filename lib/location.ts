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

/**
 * The map opens centred on the house (owner's request, 26/11/2026) at street level — the scale
 * reads 100 m, as the owner asked. The "Centralizar" button returns to this same view.
 */
export const mapView = {
  center: [longitude, latitude] as [number, number],
  zoom: 15.2,
  minZoom: 8,
  maxZoom: 18,
};

/** OpenFreeMap vector tiles, styled in lib/map-style.ts. */
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
