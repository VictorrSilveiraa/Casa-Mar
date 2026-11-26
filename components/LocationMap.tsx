"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { content } from "@/lib/content";
import { mapView, routeLinks } from "@/lib/location";
import { trackEvent } from "@/lib/analytics";
import { OriginSearch, type Suggestion } from "./OriginSearch";
import styles from "./LocationMap.module.css";

const copy = content.location.map;
/** Copied from node_modules by scripts/copy-map-worker.mjs (predev / prebuild). */
const WORKER_URL = "/vendor/maplibre-gl-worker.mjs";
const HOUSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 10.5 12 4.25l7.5 6.25"/><path d="M6.5 9v10.25h11V9"/><path d="M10.25 19.25v-5h3.5v5"/></svg>';

type Status = "idle" | "ready" | "error";
type RouteState =
  | { status: "idle" }
  | { status: "loading" | "error"; place: Suggestion }
  | { status: "ready"; place: Suggestion; distance: number; time: number };

const ROUTE_SOURCE = "origin-route";
const emptyLine = { type: "FeatureCollection" as const, features: [] };
const routeCopy = copy.route;
const kmFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** 171,8 km · 850 m */
function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.round(metres / 10) * 10} m` : `${kmFormat.format(metres / 1000)} km`;
}
/** 2 h 20 min · 45 min */
function formatTime(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} h${minutes % 60 ? ` ${minutes % 60} min` : ""}` : `${minutes} min`;
}

const icons = {
  expand: <><path d="M4.5 9V4.5H9" /><path d="M15 4.5h4.5V9" /><path d="M19.5 15v4.5H15" /><path d="M9 19.5H4.5V15" /></>,
  collapse: <><path d="M9 4.5V9H4.5" /><path d="M19.5 9H15V4.5" /><path d="M15 19.5V15h4.5" /><path d="M4.5 15H9v4.5" /></>,
  recenter: <><circle cx="12" cy="12" r="3.25" /><circle cx="12" cy="12" r="7.25" /><path d="M12 2.5v2.25M12 19.25v2.25M2.5 12h2.25M19.25 12h2.25" /></>,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
};

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{icons[name]}</svg>;
}

/**
 * OpenFreeMap map, loaded only when the section approaches the viewport so MapLibre never weighs
 * on the first paint. Opens centred on the house; custom round controls (fullscreen, recentre,
 * zoom) replace MapLibre's defaults so they follow the site.
 */
export function LocationMap() {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [route, setRoute] = useState<RouteState>({ status: "idle" });
  /** Bumped when the card clears the route, so the search box starts empty again. */
  const [searchKey, setSearchKey] = useState(0);
  const maplibreLib = useRef<typeof import("maplibre-gl") | null>(null);
  const originMarker = useRef<Marker | null>(null);
  const routeRequest = useRef<AbortController | null>(null);
  const routeBounds = useRef<import("maplibre-gl").LngLatBounds | null>(null);
  const routeCard = useRef<HTMLElement>(null);
  const ready = status === "ready";

  useEffect(() => {
    const frameEl = frame.current;
    const canvasEl = canvas.current;
    if (!frameEl || !canvasEl) return;
    let cancelled = false;

    const syncFullscreen = () => setFullscreen(document.fullscreenElement === frameEl);
    document.addEventListener("fullscreenchange", syncFullscreen);
    // Runs after hydration; iPhone Safari has no element fullscreen, so the button stays hidden there.
    queueMicrotask(() => { if (!cancelled) setCanFullscreen(Boolean(document.fullscreenEnabled && frameEl.requestFullscreen)); });

    const load = async () => {
      try {
        const [maplibre, { mapStyle, drawShield, SHIELD_IMAGE }] = await Promise.all([
          import("maplibre-gl"),
          import("@/lib/map-style"),
          import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (cancelled) return;
        maplibre.setWorkerUrl(`${WORKER_URL}?v=${maplibre.getVersion()}`);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const instance = new maplibre.Map({
          container: canvasEl,
          style: mapStyle,
          center: mapView.center,
          zoom: mapView.zoom,
          minZoom: mapView.minZoom,
          maxZoom: mapView.maxZoom,
          maxPitch: 0,
          dragRotate: false,
          touchPitch: false,
          pitchWithRotate: false,
          renderWorldCopies: false,
          cooperativeGestures: true,
          attributionControl: false,
          fadeDuration: reduceMotion ? 0 : 300,
          locale: {
            "Map.Title": copy.label,
            "Marker.Title": copy.marker,
            "CooperativeGesturesHandler.WindowsHelpText": copy.gestureDesktop,
            "CooperativeGesturesHandler.MacHelpText": copy.gestureMac,
            "CooperativeGesturesHandler.MobileHelpText": copy.gestureMobile,
          },
        });
        map.current = instance;
        maplibreLib.current = maplibre;
        instance.addControl(new maplibre.ScaleControl({ unit: "metric", maxWidth: 80 }), "bottom-left");
        // No credits button on the map (owner, 26/11/2026): the required credits are printed under the map (LocationSection).
        // Route shields ("CE-085") are drawn on demand, so the style needs no sprite sheet.
        instance.setMissingStyleImageResolver(async (id) => {
          if (id !== SHIELD_IMAGE || instance.hasImage(SHIELD_IMAGE)) return;
          const shield = drawShield();
          if (shield) instance.addImage(SHIELD_IMAGE, shield.image, shield.options);
        });

        const marker = document.createElement("div");
        marker.className = styles.marker;
        marker.innerHTML = `<span class="${styles.markerPin}">${HOUSE_SVG}</span>`;
        new maplibre.Marker({ element: marker, anchor: "center" }).setLngLat(mapView.center).addTo(instance);

        instance.once("load", () => {
          if (cancelled) return;
          // The compact attribution opens expanded on load; keep only the "i" until someone asks for it.
          canvasEl.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
          // Route line (graphite on a white casing), drawn under the labels so names stay legible.
          instance.addSource(ROUTE_SOURCE, { type: "geojson", data: emptyLine });
          const beforeLabels = instance.getStyle().layers.find((layer) => layer.type === "symbol")?.id;
          instance.addLayer({ id: "origin-route-casing", type: "line", source: ROUTE_SOURCE, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#FFFFFF", "line-width": ["interpolate", ["linear"], ["zoom"], 6, 5, 14, 10] } }, beforeLabels);
          instance.addLayer({ id: "origin-route-line", type: "line", source: ROUTE_SOURCE, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#232824", "line-width": ["interpolate", ["linear"], ["zoom"], 6, 3, 14, 5.5] } }, beforeLabels);
          setStatus("ready");
        });
      } catch (error) {
        console.warn("[mapa] não foi possível carregar o mapa", error);
        if (!cancelled) setStatus("error");
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void load();
    }, { rootMargin: "600px 0px" });
    observer.observe(frameEl);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.removeEventListener("fullscreenchange", syncFullscreen);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const zoomBy = (delta: number) => map.current?.easeTo({ zoom: map.current.getZoom() + delta, duration: reduceMotion() ? 0 : 300 });
  const recenter = () => {
    trackEvent("map_recenter");
    map.current?.flyTo({ center: mapView.center, zoom: mapView.zoom, duration: reduceMotion() ? 0 : 900, essential: false });
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.current?.requestFullscreen();
  };

  const setRouteLine = (coordinates: [number, number][]) => {
    (map.current?.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined)?.setData(coordinates.length
      ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } }
      : emptyLine);
  };

  /** Asks the server for the driving route from the chosen place and draws it. */
  const showRoute = async (place: Suggestion) => {
    const instance = map.current;
    const lib = maplibreLib.current;
    if (!instance || !lib) return;
    routeRequest.current?.abort();
    const controller = new AbortController();
    routeRequest.current = controller;
    setRoute({ status: "loading", place });
    originMarker.current?.remove();
    const dot = document.createElement("div");
    dot.className = styles.originMarker;
    originMarker.current = new lib.Marker({ element: dot, anchor: "center" }).setLngLat([place.lon, place.lat]).addTo(instance);
    try {
      const response = await fetch(`/api/geo/route?lat=${place.lat}&lon=${place.lon}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`route ${response.status}`);
      const data = (await response.json()) as { distance: number; time: number; coordinates: [number, number][] };
      setRouteLine(data.coordinates);
      const bounds = data.coordinates.reduce((box, point) => box.extend(point), new lib.LngLatBounds(mapView.center, mapView.center));
      bounds.extend([place.lon, place.lat]);
      routeBounds.current = bounds;
      setRoute({ status: "ready", place, distance: data.distance, time: data.time });
      trackEvent("route_drawn", { distance_km: Math.round(data.distance / 1000) });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.warn("[mapa] rota indisponível", error);
      setRouteLine([]);
      setRoute({ status: "error", place });
    }
  };

  // Once the summary card is on screen, frame the route in the free space between the search bar and the card.
  useEffect(() => {
    if (route.status !== "ready" || !routeBounds.current || !map.current || !frame.current) return;
    const frameBox = frame.current.getBoundingClientRect();
    const searchBottom = (frame.current.querySelector("form[role=search]")?.firstElementChild?.getBoundingClientRect().bottom ?? frameBox.top + 72) - frameBox.top;
    const cardTop = (routeCard.current?.getBoundingClientRect().top ?? frameBox.bottom - 24) - frameBox.top;
    const side = frameBox.width < 560 ? 40 : 88;
    // Room for the house pin drawn above its point (~56px) and the origin dot below.
    map.current.fitBounds(routeBounds.current, { padding: { top: searchBottom + 64, bottom: frameBox.height - cardTop + 28, left: side, right: side }, maxZoom: 15, duration: reduceMotion() ? 0 : 1100 });
  }, [route]);

  const clearRoute = () => {
    routeBounds.current = null;
    routeRequest.current?.abort();
    originMarker.current?.remove();
    originMarker.current = null;
    setRouteLine([]);
    if (route.status !== "idle") map.current?.flyTo({ center: mapView.center, zoom: mapView.zoom, duration: reduceMotion() ? 0 : 900, essential: false });
    setRoute({ status: "idle" });
  };

  return (
    <div ref={frame} className={styles.frame} data-status={status} data-fullscreen={fullscreen || undefined} data-route={route.status !== "idle" || undefined} data-location-map>
      <div className={styles.placeholder} aria-hidden="true" />
      <div ref={canvas} className={styles.canvas} role="region" aria-label={copy.label} />

      <OriginSearch key={searchKey} onSelect={(place) => void showRoute(place)} onClear={clearRoute} hasRoute={route.status !== "idle"} />

      {route.status !== "idle" && (
        <section ref={routeCard} className={styles.routeCard} aria-label={routeCopy.region} data-route-card data-state={route.status}>
          <p className={styles.routeLabel}>{routeCopy.from}</p>
          <p className={styles.routePlace}>{route.place.label}</p>
          <div role="status" aria-live="polite">
            {route.status === "loading" && <p className={styles.routeNote}>{routeCopy.loading}</p>}
            {route.status === "error" && <p className={styles.routeNote}>{routeCopy.error}</p>}
            {route.status === "ready" && (
              <dl className={styles.routeStats}>
                <div><dt>{routeCopy.distance}</dt><dd>{formatDistance(route.distance)}</dd></div>
                <div><dt>{routeCopy.time}</dt><dd>{formatTime(route.time)}</dd></div>
              </dl>
            )}
          </div>
          <button type="button" className={styles.routeClear} onClick={() => { clearRoute(); setSearchKey((key) => key + 1); }}>{routeCopy.clear}</button>
        </section>
      )}

      <div className={styles.controls} role="group" aria-label={copy.controls}>
        {canFullscreen && <button type="button" className={styles.control} onClick={toggleFullscreen} aria-label={fullscreen ? copy.exitFullscreen : copy.fullscreen} aria-pressed={fullscreen}><Icon name={fullscreen ? "collapse" : "expand"} /></button>}
        <button type="button" className={styles.control} onClick={recenter} disabled={!ready} aria-label={copy.recenter}><Icon name="recenter" /></button>
      </div>
      <div className={styles.zoom} role="group" aria-label={`${copy.zoomIn} / ${copy.zoomOut}`}>
        <button type="button" onClick={() => zoomBy(1)} disabled={!ready} aria-label={copy.zoomIn}><Icon name="plus" /></button>
        <span aria-hidden="true" />
        <button type="button" onClick={() => zoomBy(-1)} disabled={!ready} aria-label={copy.zoomOut}><Icon name="minus" /></button>
      </div>

      {status === "error" && <a className={styles.fallback} href={routeLinks.googleMaps} target="_blank" rel="noopener noreferrer">{copy.fallback}</a>}
    </div>
  );
}
