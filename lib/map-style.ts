import type { StyleSpecification } from "maplibre-gl";
import { openFreeMap } from "./location";

/**
 * Map style (26/11/2026, owner's request: brighter and more detailed, in the spirit of travel-app
 * maps). Built on OpenFreeMap's OpenMapTiles schema: fresh green land, clear blue sea, wide white
 * roads with route shields, layered vegetation, beaches, buildings and points of interest.
 * No sprite: the route shield is drawn at runtime (see `drawShield`) and the house marker is HTML.
 */
export const mapColors = {
  land: "#EEF2DC",
  residential: "#E6EAD6",
  farmland: "#E7EFCB",
  grass: "#DDEBBF",
  wood: "#CFE3AE",
  wetland: "#D8E9CB",
  park: "#C9E2A8",
  sand: "#F7EFCF",
  water: "#B6DAEE",
  waterDeep: "#A8D3EC",
  waterway: "#93C4E0",
  building: "#E1E3D3",
  buildingLine: "#D2D5C2",
  roadCasing: "#D5DCC2",
  road: "#FFFFFF",
  path: "#C2CBAE",
  boundary: "#A9B394",
  label: "#2F352D",
  labelSoft: "#4F5749",
  waterLabel: "#22526B",
  poi: "#5E6B4E",
  halo: "#FFFFFF",
  shieldBorder: "#8C9786",
  shieldText: "#3D4339",
};

const c = mapColors;
const name = ["coalesce", ["get", "name:pt"], ["get", "name"]];
const polygon = ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false];
const line = ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false];
const point = ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false];
const classIs = (...values: string[]) => ["match", ["get", "class"], values, true, false];
const regular = ["Noto Sans Regular"];
const bold = ["Noto Sans Bold"];
const italic = ["Noto Sans Italic"];
const halo = { "text-halo-color": c.halo, "text-halo-width": 1.6, "text-halo-blur": 0.3 };
const width = (stops: number[]) => ["interpolate", ["exponential", 1.45], ["zoom"], ...stops];

export const SHIELD_IMAGE = "route-shield";

export const mapStyle = {
  version: 8,
  glyphs: openFreeMap.glyphs,
  sources: { openmaptiles: { type: "vector", url: openFreeMap.tiles, attribution: openFreeMap.attribution } },
  layers: [
    { id: "background", type: "background", paint: { "background-color": c.land } },

    /* Land cover, from broad to specific */
    { id: "farmland", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, classIs("farmland")], paint: { "fill-color": c.farmland } },
    { id: "grass", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, classIs("grass")], paint: { "fill-color": c.grass, "fill-opacity": 0.9 } },
    { id: "wood", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, classIs("wood")], paint: { "fill-color": c.wood, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 13, 1] } },
    { id: "wetland", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, classIs("wetland")], paint: { "fill-color": c.wetland } },
    { id: "sand", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, classIs("sand")], paint: { "fill-color": c.sand } },
    { id: "residential", type: "fill", source: "openmaptiles", "source-layer": "landuse", maxzoom: 16, filter: ["all", polygon, classIs("residential", "suburb", "neighbourhood")], paint: { "fill-color": c.residential, "fill-opacity": 0.85 } },
    { id: "park", type: "fill", source: "openmaptiles", "source-layer": "park", filter: polygon, paint: { "fill-color": c.park, "fill-opacity": 0.8 } },

    /* Water */
    { id: "water", type: "fill", source: "openmaptiles", "source-layer": "water", filter: ["all", polygon, ["!=", ["get", "brunnel"], "tunnel"]], paint: { "fill-color": ["match", ["get", "class"], "ocean", c.waterDeep, c.water], "fill-antialias": true } },
    { id: "waterway", type: "line", source: "openmaptiles", "source-layer": "waterway", filter: line, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.waterway, "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.6, 13, 1.4, 17, 4] } },

    /* Buildings */
    { id: "building", type: "fill", source: "openmaptiles", "source-layer": "building", minzoom: 14, paint: { "fill-color": c.building, "fill-outline-color": c.buildingLine, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 1] } },

    /* Roads: casings first, then fills, from small to large */
    { id: "road-path", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 14, filter: ["all", line, classIs("path")], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.path, "line-width": 1.1, "line-dasharray": [2, 1.6] } },
    { id: "road-minor-casing", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 12, filter: ["all", line, classIs("minor", "service", "track")], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.roadCasing, "line-width": width([12, 1.2, 14, 3.4, 18, 16]) } },
    { id: "road-major-casing", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 6, filter: ["all", line, classIs("tertiary", "secondary", "primary", "trunk", "motorway")], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.roadCasing, "line-width": width([6, 1, 9, 2.6, 12, 6.4, 15, 13, 18, 32]) } },
    { id: "road-minor", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 11, filter: ["all", line, classIs("minor", "service", "track")], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.road, "line-width": width([11, 0.6, 14, 2.4, 18, 13]) } },
    { id: "road-major", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 6, filter: ["all", line, classIs("tertiary", "secondary", "primary", "trunk", "motorway")], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.road, "line-width": width([6, 0.6, 9, 1.8, 12, 4.6, 15, 10.5, 18, 28]) } },

    { id: "boundary", type: "line", source: "openmaptiles", "source-layer": "boundary", minzoom: 8, filter: ["all", ["==", ["typeof", ["get", "admin_level"]], "number"], [">=", ["get", "admin_level"], 4], ["<=", ["get", "admin_level"], 8], ["!=", ["get", "maritime"], 1]], paint: { "line-color": c.boundary, "line-width": 0.9, "line-dasharray": [3, 2.5], "line-opacity": 0.7 } },

    /* Labels */
    { id: "water-name", type: "symbol", source: "openmaptiles", "source-layer": "water_name", filter: point, layout: { "text-field": name, "text-font": italic, "text-size": ["interpolate", ["linear"], ["zoom"], 8, 12, 14, 14], "text-letter-spacing": 0.08, "text-max-width": 8 }, paint: { "text-color": c.waterLabel, "text-halo-color": "rgba(255,255,255,0.6)", "text-halo-width": 1 } },
    { id: "waterway-name", type: "symbol", source: "openmaptiles", "source-layer": "waterway", minzoom: 12, filter: ["all", line, ["has", "name"]], layout: { "symbol-placement": "line", "text-field": name, "text-font": italic, "text-size": 11.5, "symbol-spacing": 400 }, paint: { "text-color": c.waterLabel, ...halo } },
    { id: "road-name", type: "symbol", source: "openmaptiles", "source-layer": "transportation_name", minzoom: 13, filter: ["all", line, classIs("primary", "secondary", "tertiary", "trunk", "minor")], layout: { "symbol-placement": "line", "text-field": name, "text-font": regular, "text-size": ["interpolate", ["linear"], ["zoom"], 13, 11, 17, 13], "text-rotation-alignment": "map" }, paint: { "text-color": c.labelSoft, ...halo } },
    { id: "road-shield", type: "symbol", source: "openmaptiles", "source-layer": "transportation_name", minzoom: 9, filter: ["all", line, ["has", "ref"], ["<=", ["get", "ref_length"], 8]], layout: { "symbol-placement": "line", "symbol-spacing": ["interpolate", ["linear"], ["zoom"], 9, 260, 14, 480], "text-field": ["get", "ref"], "text-font": regular, "text-size": 10.5, "text-rotation-alignment": "viewport", "icon-rotation-alignment": "viewport", "icon-image": SHIELD_IMAGE, "icon-text-fit": "both", "icon-text-fit-padding": [2, 5, 2, 5] }, paint: { "text-color": c.shieldText } },
    { id: "poi", type: "symbol", source: "openmaptiles", "source-layer": "poi", minzoom: 14.5, filter: ["all", point, ["has", "name"], ["<=", ["get", "rank"], 25]], layout: { "text-field": name, "text-font": regular, "text-size": 11.5, "text-max-width": 9, "text-anchor": "top", "text-offset": [0, 0.5] }, paint: { "text-color": c.poi, ...halo } },
    { id: "poi-dot", type: "circle", source: "openmaptiles", "source-layer": "poi", minzoom: 14.5, filter: ["all", point, ["has", "name"], ["<=", ["get", "rank"], 25]], paint: { "circle-radius": 3.2, "circle-color": c.poi, "circle-stroke-color": c.halo, "circle-stroke-width": 1.2 } },
    { id: "place-minor", type: "symbol", source: "openmaptiles", "source-layer": "place", minzoom: 11, filter: classIs("hamlet", "suburb", "neighbourhood", "quarter", "locality", "isolated_dwelling"), layout: { "text-field": name, "text-font": regular, "text-size": ["interpolate", ["linear"], ["zoom"], 11, 11.5, 15, 13], "text-max-width": 8 }, paint: { "text-color": c.labelSoft, ...halo } },
    { id: "place-village", type: "symbol", source: "openmaptiles", "source-layer": "place", minzoom: 9, filter: classIs("village"), layout: { "text-field": name, "text-font": regular, "text-size": ["interpolate", ["linear"], ["zoom"], 9, 12, 14, 15], "text-max-width": 8 }, paint: { "text-color": c.label, ...halo } },
    { id: "place-town", type: "symbol", source: "openmaptiles", "source-layer": "place", minzoom: 6, filter: classIs("town", "city"), layout: { "text-field": name, "text-font": bold, "text-size": ["interpolate", ["linear"], ["zoom"], 6, 12, 11, 15, 14, 18], "text-max-width": 8 }, paint: { "text-color": c.label, ...halo, "text-halo-width": 2 } },
  ],
} as unknown as StyleSpecification;

/**
 * Route shield ("CE-085"): white plate with a fine grey border, stretchable around the text.
 * Returned at 2x for crisp edges; registered when MapLibre asks for SHIELD_IMAGE.
 */
export function drawShield() {
  const size = 40;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = mapColors.shieldBorder;
  ctx.beginPath();
  ctx.roundRect(1, 1, size - 2, size - 2, 6);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(3.5, 3.5, size - 7, size - 7, 4);
  ctx.fill();
  return {
    image: ctx.getImageData(0, 0, size, size),
    options: { pixelRatio: 2, stretchX: [[8, 32]] as [number, number][], stretchY: [[8, 32]] as [number, number][], content: [8, 8, 32, 32] as [number, number, number, number] },
  };
}
