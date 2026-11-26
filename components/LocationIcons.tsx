import type { LocationIcon } from "@/lib/location";
import { KITESURF_PATH } from "./kitesurfIcon";

/** Thin line icons for the location section. Stroke-only, currentColor, 24px grid. */
const paths: Record<LocationIcon | "pin" | "house" | "arrow", React.ReactNode> = {
  kite: null,
  restaurant: <><path d="M7 3v7.5M4.75 3v5a2.25 2.25 0 0 0 4.5 0V3M7 10.5V21" /><path d="M17.25 21V3c-2.1 1.3-3 3.9-3 6.6V13h3" /></>,
  waves: <><path d="M3 9.5c1.5 0 1.5-1.25 3-1.25S7.5 9.5 9 9.5s1.5-1.25 3-1.25 1.5 1.25 3 1.25 1.5-1.25 3-1.25 1.5 1.25 3 1.25" /><path d="M3 14.25c1.5 0 1.5-1.25 3-1.25s1.5 1.25 3 1.25 1.5-1.25 3-1.25 1.5 1.25 3 1.25 1.5-1.25 3-1.25 1.5 1.25 3 1.25" /><path d="M3 19c1.5 0 1.5-1.25 3-1.25S7.5 19 9 19s1.5-1.25 3-1.25S13.5 19 15 19" /></>,
  wind: <><path d="M3 9h11.5a2.75 2.75 0 1 0-2.75-2.75" /><path d="M3 13h15.25a2.75 2.75 0 1 1-2.75 2.75" /><path d="M3 17h7" /></>,
  pin: <><path d="M12 21s-6.25-5.6-6.25-11a6.25 6.25 0 0 1 12.5 0c0 5.4-6.25 11-6.25 11Z" /><circle cx="12" cy="10" r="2.25" /></>,
  house: <><path d="M4.5 10.5 12 4.25l7.5 6.25" /><path d="M6.5 9v10.25h11V9" /><path d="M10.25 19.25v-5h3.5v5" /></>,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
};

export function LocationGlyph({ name, className }: { name: keyof typeof paths; className?: string }) {
  // The owner's kitesurf glyph is a filled 50×50 drawing, so it gets its own svg.
  if (name === "kite") return <svg className={className} viewBox="0 0 50 50" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d={KITESURF_PATH} /></svg>;
  return <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
