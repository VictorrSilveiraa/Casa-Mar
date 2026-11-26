import { drivingRoute, geoapifyKey, geoJson, notConfigured } from "@/lib/geoapify.server";

/** GET /api/geo/route?lat=…&lon=… — driving route from the chosen origin to the house. */
export async function GET(request: Request) {
  const key = geoapifyKey();
  if (!key) return notConfigured();
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return geoJson({ error: "invalid" }, 400);
  try {
    const route = await drivingRoute(lat, lon, key);
    if (!route) return geoJson({ error: "no_route" }, 404);
    return geoJson(route, 200, "public, max-age=3600, s-maxage=86400");
  } catch (error) {
    console.error("[geo] routing failed", error);
    return geoJson({ error: "upstream" }, 502);
  }
}
