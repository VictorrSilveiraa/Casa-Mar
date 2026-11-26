import { siteConfig } from "./site.config";

/**
 * Geoapify (autocomplete + driving route) for the location map. The API key lives only on the
 * server, in the GEOAPIFY_API_KEY environment variable (.env.local locally, Vercel project settings
 * in production). The browser talks to /api/geo/*, never to Geoapify, so the key is never exposed.
 */
const BASE = "https://api.geoapify.com/v1";
const { latitude, longitude } = siteConfig.coordinates;

export const geoapifyKey = () => process.env.GEOAPIFY_API_KEY?.trim() || "";

export const geoJson = (body: unknown, status = 200, cache = "no-store") =>
  Response.json(body, { status, headers: { "Cache-Control": cache } });

/** No key yet: a normal 200 so visitors' consoles stay clean; the map falls back to Google Maps. */
export const notConfigured = () => geoJson({ configured: false });

export type Suggestion = { id: string; label: string; lat: number; lon: number };

type AutocompleteResult = { place_id?: string; formatted?: string; address_line1?: string; address_line2?: string; lat: number; lon: number };

/** Places in Brazil, biased toward the house, labelled like "Acaraú, CE, Brasil". */
export async function autocomplete(text: string, key: string): Promise<Suggestion[]> {
  const url = new URL(`${BASE}/geocode/autocomplete`);
  url.search = new URLSearchParams({
    text,
    lang: "pt",
    limit: "5",
    filter: "countrycode:br",
    bias: `proximity:${longitude},${latitude}`,
    format: "json",
    apiKey: key,
  }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error(`autocomplete ${response.status}`);
  const data = (await response.json()) as { results?: AutocompleteResult[] };
  return (data.results ?? []).map((result, index) => ({
    id: result.place_id ?? `${result.lat},${result.lon},${index}`,
    label: result.formatted ?? [result.address_line1, result.address_line2].filter(Boolean).join(", "),
    lat: result.lat,
    lon: result.lon,
  }));
}

export type RouteResult = { distance: number; time: number; coordinates: [number, number][] };

/** Driving route from the visitor's origin to the house: metres, seconds and a [lon, lat] line. */
export async function drivingRoute(lat: number, lon: number, key: string): Promise<RouteResult | null> {
  const url = new URL(`${BASE}/routing`);
  url.search = new URLSearchParams({
    waypoints: `${lat},${lon}|${latitude},${longitude}`,
    mode: "drive",
    lang: "pt",
    format: "geojson",
    apiKey: key,
  }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`routing ${response.status}`);
  const data = (await response.json()) as { features?: { properties?: { distance?: number; time?: number }; geometry?: { type: string; coordinates: unknown } }[] };
  const feature = data.features?.[0];
  if (!feature?.geometry || typeof feature.properties?.distance !== "number") return null;
  const { type, coordinates } = feature.geometry;
  const line = (type === "MultiLineString" ? (coordinates as [number, number][][]).flat() : coordinates) as [number, number][];
  return { distance: feature.properties.distance, time: feature.properties.time ?? 0, coordinates: line };
}
