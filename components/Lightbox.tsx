"use client";

import { useRef, useState } from "react";
import { images, type ImageKey } from "@/lib/images";
import { ResponsiveImage } from "./ResponsiveImage";
import styles from "./Lightbox.module.css";

const environmentImages: ImageKey[] = ["poolNight", "poolDay", "kitchen", "social", "dusk", "poolSide"];

export function Lightbox({ label }: { label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const close = () => dialog.current?.close();
  const move = (delta: number) => setIndex((current) => (current + delta + environmentImages.length) % environmentImages.length);
  return <>
    <button ref={trigger} className={styles.trigger} type="button" onClick={() => { setIndex(0); dialog.current?.showModal(); }}>{label}</button>
    <dialog ref={dialog} className={styles.dialog} aria-label="Galeria de ambientes" onClose={() => trigger.current?.focus()} onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }}>
      <div className={styles.top}><span>CASA PRAIAMAR — AMBIENTES</span><button type="button" onClick={close} aria-label="Fechar galeria">Fechar <span aria-hidden>×</span></button></div>
      <div className={styles.frame}><ResponsiveImage image={environmentImages[index]} sizes="90vw" /></div>
      <div className={styles.bottom}><p id="gallery-caption">{images[environmentImages[index]].alt}</p><div className={styles.controls}><button type="button" onClick={() => move(-1)} aria-label="Imagem anterior">←</button><span aria-live="polite" aria-atomic="true">{index + 1} / {environmentImages.length}</span><button type="button" onClick={() => move(1)} aria-label="Próxima imagem">→</button></div></div>
    </dialog>
  </>;
}
