"use client";

import { Fragment, type CSSProperties, type ElementType, useEffect, useMemo, useRef } from "react";
import { content } from "@/lib/content";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import styles from "./EssenceSection.module.css";

const splitWords = (text: string) => text.trim().split(/\s+/);

function RevealWords({ as: Tag, text, start, className, id }: { as: ElementType; text: string; start: number; className?: string; id?: string }) {
  const words = splitWords(text);
  return (
    <Tag className={className} id={id}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className={styles.word} data-reveal-word style={{ "--word-index": start + index } as CSSProperties}>{word}</span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

export function EssenceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textBlocks = useMemo(() => [content.essence.title, ...content.essence.paragraphs], []);
  const wordCounts = useMemo(() => textBlocks.map((text) => splitWords(text).length), [textBlocks]);
  const wordCount = wordCounts.reduce((total, count) => total + count, 0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const image = section.querySelector<HTMLElement>("[data-essence-image]");
    let frame = 0;
    let active = true;

    section.dataset.motion = "ready";

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const mobile = window.innerWidth <= 767;
      const start = viewportHeight * .82;
      const travel = Math.max(1, Math.min(rect.height * .62, viewportHeight * (mobile ? .92 : 1.08)));
      const progress = Math.min(1, Math.max(0, (start - rect.top) / travel));

      section.style.setProperty("--reveal-progress", progress.toFixed(4));
      if (progress >= .965) section.dataset.revealComplete = "true";
      else delete section.dataset.revealComplete;
    };

    const requestUpdate = () => {
      if (!active || frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const proximityObserver = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestUpdate();
      },
      { rootMargin: "75% 0px" },
    );

    const imageObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.dataset.imageVisible = "true";
        imageObserver.disconnect();
      },
      { threshold: .12 },
    );

    proximityObserver.observe(section);
    if (image) imageObserver.observe(image);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    return () => {
      proximityObserver.disconnect();
      imageObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="a-casa"
      className={styles.section}
      aria-labelledby="essence-title"
      data-essence-section
      ref={sectionRef}
      style={{ "--word-count": wordCount } as CSSProperties}
    >
      <div className={styles.container}>
        <div className={styles.copy} data-essence-copy>
          <div className={styles.heading}>
            <RevealWords as="h2" id="essence-title" className={styles.title} text={textBlocks[0]} start={0} />
          </div>
          <div className={styles.paragraphs}>
            {content.essence.paragraphs.map((text, index) => (
              <RevealWords
                as="p"
                key={text}
                text={text}
                start={wordCounts.slice(0, index + 1).reduce((total, count) => total + count, 0)}
              />
            ))}
          </div>
          <a className={styles.action} href="#ambientes" data-essence-action>{content.essence.action}</a>
        </div>
        <div className={styles.imageFrame} data-essence-image>
          <div className={styles.image}>
            <ResponsiveImage image="garden" sizes="(max-width: 767px) 100vw, 48vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
