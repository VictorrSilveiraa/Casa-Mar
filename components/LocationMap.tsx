"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { content } from "@/lib/content";
import { mapView, routeLinks } from "@/lib/location";
import { trackEvent } from "@/lib/analytics";
import styles from "./LocationMap.module.css";

const copy = content.location.map;
/** Copied from node_modules by scripts/copy-map-worker.mjs (predev / prebuild). */
const WORKER_URL = "/vendor/maplibre-gl-worker.mjs";
const HOUSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 10.5 12 4.25l7.5 6.25"/><path d="M6.5 9v10.25h11V9"/><path d="M10.25 19.25v-5h3.5v5"/></svg>';

type Status = "idle" | "ready" | "error";

const icons = {
  search: <><circle cx="10.75" cy="10.75" r="6.25" /><path d="m15.5 15.5 4.75 4.75" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
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
  const inputId = useId();
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
            "AttributionControl.ToggleAttribution": "Créditos do mapa",
            "CooperativeGesturesHandler.WindowsHelpText": copy.gestureDesktop,
            "CooperativeGesturesHandler.MacHelpText": copy.gestureMac,
            "CooperativeGesturesHandler.MobileHelpText": copy.gestureMobile,
          },
        });
        map.current = instance;
        instance.addControl(new maplibre.ScaleControl({ unit: "metric", maxWidth: 80 }), "bottom-left");
        instance.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-left");
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

  const submitOrigin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const origin = new FormData(event.currentTarget).get("origem")?.toString().trim() ?? "";
    trackEvent("route_click", { app: "google_maps", source: "map_origin" });
    window.open(origin ? routeLinks.googleMapsFrom(origin) : routeLinks.googleMaps, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={frame} className={styles.frame} data-status={status} data-fullscreen={fullscreen || undefined} data-location-map>
      <div className={styles.placeholder} aria-hidden="true" />
      <div ref={canvas} className={styles.canvas} role="region" aria-label={copy.label} />

      <form className={styles.origin} onSubmit={submitOrigin} role="search" aria-label={copy.originLabel}>
        <label className={styles.srOnly} htmlFor={inputId}>{copy.originLabel}</label>
        <span className={styles.originIcon}><Icon name="search" /></span>
        <input id={inputId} name="origem" type="text" autoComplete="address-level2" enterKeyHint="go" placeholder={copy.originLabel} />
        <button type="submit" className={styles.originSubmit} aria-label={copy.originSubmit}><Icon name="arrow" /></button>
      </form>

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
