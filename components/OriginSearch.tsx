"use client";

import { useEffect, useId, useRef, useState } from "react";
import { content } from "@/lib/content";
import { routeLinks } from "@/lib/location";
import { trackEvent } from "@/lib/analytics";
import styles from "./LocationMap.module.css";

const copy = content.location.map;

export type Suggestion = { id: string; label: string; lat: number; lon: number };
type Availability = "unknown" | "ready" | "unavailable";

const glyph = {
  search: <><circle cx="10.75" cy="10.75" r="6.25" /><path d="m15.5 15.5 4.75 4.75" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  close: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  place: <><path d="M12 21s-6.25-5.6-6.25-11a6.25 6.25 0 0 1 12.5 0c0 5.4-6.25 11-6.25 11Z" /><circle cx="12" cy="10" r="2.25" /></>,
};
function Glyph({ name, size = 20 }: { name: keyof typeof glyph; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{glyph[name]}</svg>;
}

/**
 * "De onde você vem?" — accessible combobox (WAI-ARIA 1.2) fed by /api/geo/autocomplete.
 * While the Geoapify key is not configured the endpoint answers { configured: false } and the box falls back to
 * opening the route in Google Maps, exactly as before.
 */
export function OriginSearch({ onSelect, onClear, hasRoute }: { onSelect: (place: Suggestion) => void; onClear: () => void; hasRoute: boolean }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability>("unknown");
  const input = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  /** Label of the place just picked: filling the box with it must not start a new search. */
  const picked = useRef("");
  const inputId = useId();
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;

  // Learn once whether the server has a Geoapify key (an empty query costs nothing upstream).
  const probe = () => {
    if (availability !== "unknown") return;
    fetch("/api/geo/autocomplete?text=").then((response) => response.json()).then((data: { configured?: boolean }) => setAvailability(data.configured === false ? "unavailable" : "ready")).catch(() => setAvailability("unavailable"));
  };

  useEffect(() => {
    const query = text.trim();
    if (availability === "unavailable" || query.length < 3 || query === picked.current) return;
    const timer = window.setTimeout(async () => {
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      setLoading(true);
      try {
        const response = await fetch(`/api/geo/autocomplete?text=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await response.json()) as { results?: Suggestion[]; configured?: boolean };
        if (data.configured === false) { setAvailability("unavailable"); setOpen(false); return; }
        setAvailability("ready");
        setResults(data.results ?? []);
        setActive(-1);
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") { setResults([]); setOpen(true); }
      } finally {
        if (request.current === controller) setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [text, availability]);

  const choose = (place: Suggestion) => {
    picked.current = place.label;
    request.current?.abort();
    setText(place.label);
    setOpen(false);
    setActive(-1);
    trackEvent("route_search", { source: "map_origin" });
    onSelect(place);
  };

  const clear = () => {
    request.current?.abort();
    picked.current = "";
    setText("");
    setResults([]);
    setOpen(false);
    setActive(-1);
    onClear();
    input.current?.focus();
  };

  const openGoogleMaps = () => {
    const origin = text.trim();
    trackEvent("route_click", { app: "google_maps", source: "map_origin" });
    window.open(origin ? routeLinks.googleMapsFrom(origin) : routeLinks.googleMaps, "_blank", "noopener,noreferrer");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (availability === "ready" && open && results.length) return choose(results[Math.max(active, 0)]);
    if (availability !== "ready") openGoogleMaps();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) { event.preventDefault(); setOpen(true); setActive((index) => (index + 1) % results.length); }
    else if (event.key === "ArrowUp" && results.length) { event.preventDefault(); setOpen(true); setActive((index) => (index <= 0 ? results.length - 1 : index - 1)); }
    else if (event.key === "Escape") { if (open) { event.preventDefault(); setOpen(false); setActive(-1); } else if (text) { event.preventDefault(); clear(); } }
  };

  const query = text.trim();
  const showList = open && availability === "ready" && query.length >= 3;
  const smart = availability !== "unavailable";

  return (
    <form className={styles.origin} onSubmit={submit} role="search" aria-label={copy.originLabel} data-open={showList || undefined}>
      <div className={styles.originBar}>
        <label className={styles.srOnly} htmlFor={inputId}>{copy.originLabel}</label>
        <span className={styles.originIcon}><Glyph name="search" /></span>
        <input
          ref={input}
          id={inputId}
          name="origem"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint={smart ? "search" : "go"}
          placeholder={copy.originLabel}
          value={text}
          onFocus={() => { probe(); if (results.length && query.length >= 3 && query !== picked.current) setOpen(true); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => { setText(event.target.value); if (event.target.value.trim().length < 3) { setResults([]); setOpen(false); } }}
          onKeyDown={onKeyDown}
        />
        {smart && (text || hasRoute)
          ? <button type="button" className={styles.originClear} onClick={clear} aria-label={copy.originClear}><Glyph name="close" size={18} /></button>
          : <button type="submit" className={styles.originSubmit} aria-label={copy.originSubmit}><Glyph name="arrow" size={18} /></button>}
      </div>
      <div className={styles.suggestions} hidden={!showList}>
        <ul id={listId} role="listbox" aria-label={copy.suggestionsLabel}>
          {results.map((place, index) => (
            <li key={place.id} id={optionId(index)} role="option" aria-selected={index === active} data-active={index === active || undefined} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(place)} onMouseEnter={() => setActive(index)}>
              <Glyph name="place" size={18} />
              <span>{place.label}</span>
            </li>
          ))}
        </ul>
        {!results.length && <p className={styles.suggestionsEmpty}>{loading ? copy.searching : copy.noResults}</p>}
        <p className={styles.poweredBy}>Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener noreferrer">Geoapify</a></p>
      </div>
      <span className={styles.srOnly} aria-live="polite">{showList ? (results.length ? `${results.length} ${copy.suggestionsCount}` : loading ? "" : copy.noResults) : ""}</span>
    </form>
  );
}
