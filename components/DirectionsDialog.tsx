"use client";

import { useId, useRef } from "react";
import { content } from "@/lib/content";
import { routeLinks } from "@/lib/location";
import { trackEvent } from "@/lib/analytics";
import { LocationGlyph } from "./LocationIcons";
import styles from "./DirectionsDialog.module.css";

const copy = content.location.directions;
const apps = [
  { key: "google_maps", label: copy.googleMaps, href: routeLinks.googleMaps },
  { key: "waze", label: copy.waze, href: routeLinks.waze },
] as const;

/** "Como chegar" — native <dialog> to pick Google Maps or Waze, both pointing at the house coordinates. */
export function DirectionsDialog({ label, className }: { label: string; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const close = () => dialog.current?.close();

  return <>
    <button ref={trigger} className={className} type="button" aria-haspopup="dialog" data-fill onClick={() => { dialog.current?.showModal(); trackEvent("directions_open"); }}>{label}</button>
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={() => trigger.current?.focus()}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <div className={styles.panel}>
        <div className={styles.top}>
          <h2 id={titleId}>{copy.title}</h2>
          <button type="button" className={styles.close} onClick={close}>{copy.close} <span aria-hidden="true">×</span></button>
        </div>
        <p id={descriptionId} className={styles.description}>{copy.description}</p>
        <ul className={styles.options}>
          {apps.map((app) => (
            <li key={app.key}>
              <a href={app.href} target="_blank" rel="noopener noreferrer" onClick={() => { trackEvent("route_click", { app: app.key, source: "directions_dialog" }); close(); }}>
                <span>{app.label}</span>
                <LocationGlyph name="arrow" className={styles.arrow} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  </>;
}
