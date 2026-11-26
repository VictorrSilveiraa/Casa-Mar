"use client";

import { useEffect, useState } from "react";
import art from "./LoaderArt.generated.module.css";
import { INTRO_DONE_EVENT } from "@/lib/motion";
import styles from "./Loader.module.css";

/** Minimum time on screen so the sunrise completes, measured from navigation start. */
const MIN_MS = 1900;
/** Hard cap: the page is never held longer than this, even if the hero photo is still loading. */
const MAX_MS = 2800;
const EXIT_MS = 950;
const REDUCED = { min: 400, max: 1200, exit: 320 };

type Stage = "intro" | "exiting" | "gone";

/**
 * Opening "o sol nasce sobre o mar": waves draw, the house rises, the sun is born, then PRAIAMAR.
 * Server-rendered so it paints with the first frame (only under html.js); this effect decides when it leaves.
 */
export function Loader() {
  const [stage, setStage] = useState<Stage>("intro");

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro === "done") {
      // Back/forward navigation: the boot script already skipped the opening (CSS hides it).
      window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduce ? REDUCED.min : MIN_MS;
    const max = reduce ? REDUCED.max : MAX_MS;
    const exit = reduce ? REDUCED.exit : EXIT_MS;
    const timers: number[] = [];
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      root.dataset.intro = "exiting";
      setStage("exiting");
      timers.push(window.setTimeout(() => {
        root.dataset.intro = "done";
        setStage("gone");
        window.dispatchEvent(new Event(INTRO_DONE_EVENT));
      }, exit));
    };

    const hero = document.querySelector<HTMLImageElement>("#topo img");
    const heroReady = hero ? hero.decode().catch(() => undefined) : Promise.resolve();
    const minElapsed = new Promise<void>((resolve) => {
      timers.push(window.setTimeout(resolve, Math.max(0, min - performance.now())));
    });
    void Promise.all([heroReady, minElapsed]).then(finish);
    timers.push(window.setTimeout(finish, Math.max(0, max - performance.now())));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  if (stage === "gone") return null;

  return (
    <div className={styles.loader} data-loader data-stage={stage} aria-hidden="true">
      <div className={styles.mark}>
        <div className={styles.symbol}>
          <span className={`${styles.part} ${styles.sun}`}><span className={`${styles.art} ${art.sun}`} /></span>
          <span className={`${styles.part} ${styles.house}`}><span className={`${styles.art} ${art.house}`} /></span>
          <span className={`${styles.part} ${styles.waves}`}><span className={`${styles.art} ${art.waves}`} /></span>
        </div>
        <span className={styles.wordmark}><span className={`${styles.art} ${art.wordmark}`} /></span>
        <span className={styles.rule} />
      </div>
    </div>
  );
}
