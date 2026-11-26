"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { content } from "@/lib/content";
import { mapView, routeLinks } from "@/lib/location";
import { trackEvent } from "@/lib/analytics";
import { LocationGlyph } from "./LocationIcons";
import styles from "./LocationMap.module.css";

const copy = content.location.map;
/** Copied from node_modules by scripts/copy-map-worker.mjs (predev / prebuild). */
const WORKER_URL = "/vendor/maplibre-gl-worker.mjs";
const HOUSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 10.5 12 4.25l7.5 6.25"/><path d="M6.5 9v10.25h11V9"/><path d="M10.25 19.25v-5h3.5v5"/></svg>';

type Status = "idle" | "ready" | "error";

/**
 * OpenFreeMap map, loaded only when the section approaches the viewport so MapLibre never weighs
 * on the first paint. Until it is ready, a quiet placeholder in the map colours holds the space.
 */
export function LocationMap() {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const inputId = useId();

  useEffect(() => {
    const frameEl = frame.current;
    const canvasEl = canvas.current;
    if (!frameEl || !canvasEl) return;
    let map: MapLibreMap | undefined;
    let cancelled = false;

    const load = async () => {
      try {
        const [maplibre, { mapStyle }] = await Promise.all([
          import("maplibre-gl"),
          import("@/lib/map-style"),
          import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (cancelled) return;
        maplibre.setWorkerUrl(`${WORKER_URL}?v=${maplibre.getVersion()}`);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        map = new maplibre.Map({
          container: canvasEl,
          style: mapStyle,
          bounds: mapView.bounds,
          fitBoundsOptions: { padding: mapView.padding },
          minZoom: mapView.minZoom,
          maxZoom: mapView.maxZoom,
          maxPitch: 0,
          dragRotate: false,
          touchPitch: false,
          pitchWithRotate: false,
          renderWorldCopies: false,
          cooperativeGestures: true,
          attributionControl: { compact: true },
          fadeDuration: reduceMotion ? 0 : 300,
          locale: {
            "Map.Title": copy.label,
            "Marker.Title": copy.marker,
            "FullscreenControl.Enter": copy.fullscreen,
            "FullscreenControl.Exit": copy.exitFullscreen,
            "NavigationControl.ZoomIn": copy.zoomIn,
            "NavigationControl.ZoomOut": copy.zoomOut,
            "AttributionControl.ToggleAttribution": "Créditos do mapa",
            "CooperativeGesturesHandler.WindowsHelpText": copy.gestureDesktop,
            "CooperativeGesturesHandler.MacHelpText": copy.gestureMac,
            "CooperativeGesturesHandler.MobileHelpText": copy.gestureMobile,
          },
        });
        map.addControl(new maplibre.FullscreenControl({ container: frameEl }), "top-right");
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new maplibre.ScaleControl({ unit: "metric", maxWidth: 88 }), "bottom-left");

        const marker = document.createElement("div");
        marker.className = styles.marker;
        marker.innerHTML = HOUSE_SVG;
        new maplibre.Marker({ element: marker, anchor: "bottom" }).setLngLat(mapView.center).addTo(map);

        map.once("load", () => {
          if (cancelled) return;
          // The compact attribution opens expanded on load; keep only the "i" until someone asks for it.
          canvasEl.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
          setStatus("ready");
        });
        map.on("error", (event) => { if (!map?.loaded()) console.warn("[mapa]", event.error?.message); });
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
      map?.remove();
    };
  }, []);

  const submitOrigin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const origin = new FormData(event.currentTarget).get("origem")?.toString().trim() ?? "";
    trackEvent("route_click", { app: "google_maps", source: "map_origin" });
    window.open(origin ? routeLinks.googleMapsFrom(origin) : routeLinks.googleMaps, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={frame} className={styles.frame} data-status={status} data-location-map>
      <div className={styles.placeholder} aria-hidden="true" />
      <div ref={canvas} className={styles.canvas} role="region" aria-label={copy.label} />
      <form className={styles.origin} onSubmit={submitOrigin} role="search" aria-label={copy.originLabel}>
        <label className={styles.srOnly} htmlFor={inputId}>{copy.originLabel}</label>
        <svg className={styles.originIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></svg>
        <input id={inputId} name="origem" type="text" autoComplete="address-level2" enterKeyHint="go" placeholder={copy.originLabel} />
        <button type="submit" aria-label={copy.originSubmit}><LocationGlyph name="arrow" /></button>
      </form>
      {status === "error" && <a className={styles.fallback} href={routeLinks.googleMaps} target="_blank" rel="noopener noreferrer">{copy.fallback}</a>}
    </div>
  );
}
