/**
 * Scroll reveal runtime — docs/superpowers/specs/2026-11-25-experiencia-premium-design.md §5.
 * Pairs with app/motion.css. Every reveal fires once and is never replayed.
 */

export const INTRO_DONE_EVENT = "praiamar:intro-done";

const originalText = new WeakMap<HTMLElement, string>();

/** Wraps a heading's words into masked visual lines (`.m-line > .m-line-inner`). */
export function splitLines(el: HTMLElement): void {
  const text = originalText.get(el) ?? el.textContent?.trim() ?? "";
  originalText.set(el, text);
  const words = text.split(/\s+/).filter(Boolean);

  el.textContent = "";
  const probes = words.map((word, index) => {
    const probe = document.createElement("span");
    probe.textContent = word;
    el.append(probe);
    if (index < words.length - 1) el.append(" ");
    return probe;
  });

  const lines: string[][] = [];
  let currentTop: number | null = null;
  for (const probe of probes) {
    const top = probe.offsetTop;
    if (currentTop === null || Math.abs(top - currentTop) > 2) {
      lines.push([]);
      currentTop = top;
    }
    lines[lines.length - 1].push(probe.textContent ?? "");
  }

  el.textContent = "";
  lines.forEach((lineWords, index) => {
    const line = document.createElement("span");
    line.className = "m-line";
    const inner = document.createElement("span");
    inner.className = "m-line-inner";
    inner.style.setProperty("--line-index", String(index));
    inner.textContent = lineWords.join(" ");
    line.append(inner);
    el.append(line);
    if (index < lines.length - 1) el.append(" ");
  });
  el.dataset.split = "true";
}

/** Observes every pending `[data-reveal]` and marks it `data-visible` once. Returns a cleanup. */
export function startReveals(): () => void {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])"))
    .filter((element) => !element.closest("dialog"));
  const lineTargets = targets.filter((element) => element.dataset.reveal === "lines");
  lineTargets.forEach(splitLines);

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      (entry.target as HTMLElement).dataset.visible = "true";
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  targets.forEach((target) => observer.observe(target));

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      lineTargets.filter((element) => !element.dataset.visible).forEach(splitLines);
    }, 150);
  };
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    observer.disconnect();
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
  };
}

/** Runs `callback` once the opening loader has finished (immediately if it already has). */
export function onIntroDone(callback: () => void): () => void {
  if (document.documentElement.dataset.intro === "done") {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(INTRO_DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(INTRO_DONE_EVENT, handler);
}
