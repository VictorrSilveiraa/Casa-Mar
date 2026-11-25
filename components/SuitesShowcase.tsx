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

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (scrollEndRef.current !== null) window.clearTimeout(scrollEndRef.current);
  }, []);

  const syncActiveFromTrack = () => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft <= 2) {
      setActive(0);
      return;
    }
    if (maxScroll - track.scrollLeft <= 2) {
      setActive(images.length - 1);
      return;
    }

    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
      if (nextDistance < distance) { distance = nextDistance; closest = index; }
    });
    setActive(closest);
  };

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(images.length - 1, index));
    const firstStageAtDesktopEdge = next === 0 && window.matchMedia("(min-width: 901px)").matches;
    const lastStage = next === images.length - 1;
    targetRef.current = next;
    itemRefs.current[next]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: firstStageAtDesktopEdge ? "start" : lastStage ? "end" : "center",
    });
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

      <div ref={trackRef} className={styles.track} onScroll={updateActive}>
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

      <div className={styles.controls}>
        <p className={styles.counter} aria-live="polite"><span>{String(active + 1).padStart(2, "0")}</span> / {String(images.length).padStart(2, "0")}</p>
        <span className={styles.progress} aria-hidden="true"><span style={{ transform: `scaleX(${(active + 1) / images.length})` }} /></span>
        <div className={styles.buttons}>
          <button type="button" aria-label="Suíte anterior" disabled={active === 0} onClick={() => goTo(active - 1)}><Arrow direction="previous" /></button>
          <button type="button" aria-label="Próxima suíte" disabled={active === images.length - 1} onClick={() => goTo(active + 1)}><Arrow direction="next" /></button>
        </div>
      </div>
    </section>
  );
}
