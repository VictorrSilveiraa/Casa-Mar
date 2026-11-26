import type { StyleSpecification } from "maplibre-gl";
import { openFreeMap } from "./location";

/**
 * Map style in the Casa Praiamar palette, built on OpenFreeMap's OpenMapTiles schema
 * (layer filters adapted from OpenFreeMap "Positron"). Land in off-white/sand, vegetation in a
 * soft olive, sea in a muted sage, roads in white, labels in graphite. No sprite: the house marker
 * is HTML and road shields are left out to keep the map quiet.
 */
const color = {
  land: "#ECE7DB",
  residential: "#E5DFD1",
  sand: "#F1E9D6",
  green: "#DCDDC6",
  water: "#C7D4CF",
  waterLabel: "#43544C",
  building: "#DFD7C6",
  roadCasing: "#D9CFBC",
  road: "#FFFFFF",
  minorRoad: "#FAF8F3",
  boundary: "#BDB4A2",
  label: "#454A43",
  labelSoft: "#5B5F55",
  halo: "#F5F3EE",
};

const name: ["coalesce", ...unknown[]] = ["coalesce", ["get", "name:pt"], ["get", "name"]];
const polygon = ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false];
const line = ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false];
const majorRoads = ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk", "motorway"], true, false];
const minorRoads = ["match", ["get", "class"], ["minor", "service", "track"], true, false];
const font = ["Noto Sans Regular"];
const labelPaint = { "text-color": color.label, "text-halo-color": color.halo, "text-halo-width": 1.4, "text-halo-blur": 0.4 };

export const mapStyle = {
  version: 8,
  glyphs: openFreeMap.glyphs,
  sources: { openmaptiles: { type: "vector", url: openFreeMap.tiles, attribution: openFreeMap.attribution } },
  layers: [
    { id: "background", type: "background", paint: { "background-color": color.land } },
    { id: "residential", type: "fill", source: "openmaptiles", "source-layer": "landuse", maxzoom: 16, filter: ["all", polygon, ["==", ["get", "class"], "residential"]], paint: { "fill-color": color.residential, "fill-opacity": 0.7 } },
    { id: "sand", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, ["==", ["get", "class"], "sand"]], paint: { "fill-color": color.sand } },
    { id: "green", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["all", polygon, ["match", ["get", "class"], ["wood", "grass", "farmland", "wetland"], true, false]], paint: { "fill-color": color.green, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.45, 13, 0.8] } },
    { id: "park", type: "fill", source: "openmaptiles", "source-layer": "park", filter: polygon, paint: { "fill-color": color.green, "fill-opacity": 0.7 } },
    { id: "water", type: "fill", source: "openmaptiles", "source-layer": "water", filter: ["all", polygon, ["!=", ["get", "brunnel"], "tunnel"]], paint: { "fill-color": color.water, "fill-antialias": true } },
    { id: "waterway", type: "line", source: "openmaptiles", "source-layer": "waterway", filter: line, paint: { "line-color": color.water, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 16, 2] } },
    { id: "building", type: "fill", source: "openmaptiles", "source-layer": "building", minzoom: 14, paint: { "fill-color": color.building, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 0.9] } },
    { id: "road-path", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 14, filter: ["all", line, ["==", ["get", "class"], "path"]], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color.roadCasing, "line-width": 1, "line-dasharray": [2, 2] } },
    { id: "road-minor", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 11, filter: ["all", line, minorRoads], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color.minorRoad, "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 0.6, 14, 2.2, 18, 12] } },
    { id: "road-major-casing", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 8, filter: ["all", line, majorRoads], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color.roadCasing, "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 8, 1.4, 12, 4, 18, 26] } },
    { id: "road-major", type: "line", source: "openmaptiles", "source-layer": "transportation", minzoom: 8, filter: ["all", line, majorRoads], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": color.road, "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 8, 0.8, 12, 2.8, 18, 22] } },
    { id: "boundary", type: "line", source: "openmaptiles", "source-layer": "boundary", minzoom: 8, filter: ["all", ["==", ["typeof", ["get", "admin_level"]], "number"], [">=", ["get", "admin_level"], 4], ["<=", ["get", "admin_level"], 8], ["!=", ["get", "maritime"], 1]], paint: { "line-color": color.boundary, "line-width": 0.8, "line-dasharray": [3, 3] } },
    { id: "water-name", type: "symbol", source: "openmaptiles", "source-layer": "water_name", filter: ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false], layout: { "text-field": name, "text-font": font, "text-size": 12, "text-letter-spacing": 0.2, "text-max-width": 8 }, paint: { "text-color": color.waterLabel, "text-halo-color": color.water, "text-halo-width": 1 } },
    { id: "road-name", type: "symbol", source: "openmaptiles", "source-layer": "transportation_name", minzoom: 13, filter: ["all", line, ["match", ["get", "class"], ["primary", "secondary", "tertiary", "trunk", "minor"], true, false]], layout: { "symbol-placement": "line", "text-field": name, "text-font": font, "text-size": 11, "text-rotation-alignment": "map" }, paint: { ...labelPaint, "text-color": color.labelSoft } },
    { id: "place-minor", type: "symbol", source: "openmaptiles", "source-layer": "place", minzoom: 11, filter: ["match", ["get", "class"], ["hamlet", "suburb", "neighbourhood", "quarter", "locality", "isolated_dwelling"], true, false], layout: { "text-field": name, "text-font": font, "text-size": 11.5, "text-max-width": 8 }, paint: { ...labelPaint, "text-color": color.labelSoft } },
    { id: "place-village", type: "symbol", source: "openmaptiles", "source-layer": "place", minzoom: 9, filter: ["==", ["get", "class"], "village"], layout: { "text-field": name, "text-font": font, "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 14, 13.5], "text-max-width": 8 }, paint: labelPaint },
    { id: "place-town", type: "symbol", source: "openmaptiles", "source-layer": "place", minzoom: 6, filter: ["match", ["get", "class"], ["town", "city"], true, false], layout: { "text-field": name, "text-font": font, "text-size": ["interpolate", ["linear"], ["zoom"], 6, 12, 12, 16], "text-max-width": 8 }, paint: labelPaint },
  ],
} as unknown as StyleSpecification;
