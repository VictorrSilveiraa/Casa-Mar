"use client";

import { useId, useRef, useState } from "react";
import { images } from "@/lib/images";
import { galleries, type GalleryKey } from "@/lib/galleries";
import { ResponsiveImage } from "./ResponsiveImage";
import styles from "./Lightbox.module.css";

type Props = { label: string; gallery: GalleryKey; className?: string };

export function Lightbox({ label, gallery, className }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const captionId = useId();
  const { label: dialogLabel, heading, images: keys } = galleries[gallery];
  const close = () => dialog.current?.close();
  const move = (delta: number) => setIndex((current) => (current + delta + keys.length) % keys.length);
  return <>
    <button ref={trigger} className={className ?? styles.trigger} type="button" aria-haspopup="dialog" onClick={() => { setIndex(0); dialog.current?.showModal(); }}>{label}</button>
    <dialog ref={dialog} className={styles.dialog} aria-label={dialogLabel} aria-describedby={captionId} onClose={() => trigger.current?.focus()} onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }}>
      <div className={styles.top}><span>{heading}</span><button type="button" onClick={close} aria-label="Fechar galeria">Fechar <span aria-hidden>×</span></button></div>
      <div className={styles.frame}><ResponsiveImage image={keys[index]} sizes="90vw" /></div>
      <div className={styles.bottom}><p id={captionId}>{images[keys[index]].alt}</p><div className={styles.controls}><button type="button" onClick={() => move(-1)} aria-label="Imagem anterior">←</button><span aria-live="polite" aria-atomic="true">{index + 1} / {keys.length}</span><button type="button" onClick={() => move(1)} aria-label="Próxima imagem">→</button></div></div>
    </dialog>
  </>;
}
