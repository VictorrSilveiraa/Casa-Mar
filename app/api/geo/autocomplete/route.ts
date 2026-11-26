import { autocomplete, geoapifyKey, geoJson, notConfigured } from "@/lib/geoapify.server";

/** GET /api/geo/autocomplete?text=… — place suggestions for "De onde você vem?". */
export async function GET(request: Request) {
  const key = geoapifyKey();
  if (!key) return notConfigured();
  const text = new URL(request.url).searchParams.get("text")?.trim() ?? "";
  if (text.length < 3 || text.length > 120) return geoJson({ results: [] });
  try {
    return geoJson({ results: await autocomplete(text, key) }, 200, "public, max-age=300, s-maxage=86400");
  } catch (error) {
    console.error("[geo] autocomplete failed", error);
    return geoJson({ error: "upstream" }, 502);
  }
}
