"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import type { ImageKey } from "@/lib/images";
import { Lightbox } from "./Lightbox";
import { ResponsiveImage } from "./ResponsiveImage";
import { SectionHeading } from "./SectionHeading";
import styles from "./SuitesShowcase.module.css";

function Arrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" className={direction === "previous" ? styles.previousIcon : undefined}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function SuitesShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const scrollEndRef = useRef<number | null>(null);
  const targetRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const images = content.suites.images;
  /** Distinct scroll positions the arrows can reach. On wide screens the last photos share one stop. */
  const stopsRef = useRef<number[]>([]);
  const [stopCount, setStopCount] = useState<number>(images.length);

  const computeStops = (): number[] => {
    const track = trackRef.current;
    if (!track) return [];
    const desktop = window.matchMedia("(min-width: 901px)").matches;
    const padLeft = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    const max = track.scrollWidth - track.clientWidth;
    const trackLeft = track.getBoundingClientRect().left;
    const stops: number[] = [];
    for (const item of itemRefs.current) {
      if (!item) continue;
      const rect = item.getBoundingClientRect();
      const start = track.scrollLeft + rect.left - trackLeft;
      // Desktop: each photo rests on the start edge. Mobile: each photo is centered.
      const target = desktop ? start - padLeft : start - (track.clientWidth - rect.width) / 2;
      const stop = Math.round(Math.max(0, Math.min(max, target)));
      if (!stops.length || stop - stops[stops.length - 1] > 8) stops.push(stop);
    }
    if (stops.length && max - stops[stops.length - 1] > 8) stops.push(Math.round(max));
    return stops;
  };

  const nearestStop = (left: number) => {
    const stops = stopsRef.current;
    let closest = 0;
    stops.forEach((stop, index) => { if (Math.abs(stop - left) < Math.abs(stops[closest] - left)) closest = index; });
    return closest;
  };

  useEffect(() => {
    let timer = 0;
    const measure = () => {
      stopsRef.current = computeStops();
      setStopCount(Math.max(1, stopsRef.current.length));
      const track = trackRef.current;
      if (track) setActive(nearestStop(track.scrollLeft));
    };
    const frame = requestAnimationFrame(measure);
    const onResize = () => { window.clearTimeout(timer); timer = window.setTimeout(measure, 150); };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (scrollEndRef.current !== null) window.clearTimeout(scrollEndRef.current);
    };
    // computeStops/nearestStop only read refs; measuring once on mount and on resize is intended.
  }, []);

  const syncActiveFromTrack = () => {
    const track = trackRef.current;
    if (track) setActive(nearestStop(track.scrollLeft));
  };

  const goTo = (index: number) => {
    // Re-measure: the track may have been revealed (it slides in) or resized since the last measure.
    stopsRef.current = computeStops();
    const stops = stopsRef.current;
    if (!stops.length) return;
    const next = Math.max(0, Math.min(stops.length - 1, index));
    targetRef.current = next;
    // Scroll only the track horizontally. scrollIntoView would also move the page vertically
    // whenever the section is not fully in view, making the page jump on every arrow click.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    trackRef.current?.scrollTo({ left: stops[next], behavior: reduce ? "auto" : "smooth" });
    setActive(next);
  };

  const updateActive = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (targetRef.current === null) syncActiveFromTrack();
    });
    if (scrollEndRef.current !== null) window.clearTimeout(scrollEndRef.current);
    scrollEndRef.current = window.setTimeout(() => {
      targetRef.current = null;
      syncActiveFromTrack();
    }, 140);
  };

  return (
    <section id="suites" className={styles.section} aria-label="Suítes da Casa Praiamar">
      <div className={styles.intro}>
        <SectionHeading title={content.suites.title} />
        <Lightbox label={content.suites.action} gallery="suites" className={styles.cta} />
      </div>

      <div ref={trackRef} className={styles.track} onScroll={updateActive} data-reveal="slide" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
        {images.map((image, index) => (
          <article
            ref={(node) => { itemRefs.current[index] = node; }}
            className={styles.frame}
            key={image}
            aria-label={`Vista ${index + 1} das suítes`}
          >
            <ResponsiveImage image={image as ImageKey} sizes="(max-width: 767px) 84vw, (max-width: 1200px) 62vw, 52vw" />
          </article>
        ))}
      </div>

      <div className={styles.controls} data-reveal="fade" style={{ "--reveal-delay": "320ms" } as React.CSSProperties}>
        <p className={styles.counter} aria-live="polite"><span>{String(active + 1).padStart(2, "0")}</span> / {String(stopCount).padStart(2, "0")}</p>
        <span className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${(active + 1) / stopCount})` }} /></span>
        <div className={styles.buttons}>
          <button type="button" aria-label="Suíte anterior" disabled={active === 0} onClick={() => goTo(active - 1)}><Arrow direction="previous" /></button>
          <button type="button" aria-label="Próxima suíte" disabled={active >= stopCount - 1} onClick={() => goTo(active + 1)}><Arrow direction="next" /></button>
        </div>
      </div>
    </section>
  );
}
