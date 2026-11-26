"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { brandAssets } from "@/lib/brand";
import { ReserveLink } from "./ReserveLink";
import styles from "./Header.module.css";

export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide while reading downward past the hero; any upward scroll, focus inside, or the hero brings it back.
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const heroBottom = document.querySelector<HTMLElement>("#topo")?.offsetHeight ?? window.innerHeight;
        const delta = y - lastY;
        if (y <= heroBottom || delta < -8) setHidden(false);
        else if (delta > 4 && !header.current?.matches(":focus-within")) setHidden(true);
        lastY = y;
      });
    };
    const onFocus = () => setHidden(false);
    const element = header.current;
    window.addEventListener("scroll", onScroll, { passive: true });
    element?.addEventListener("focusin", onFocus);
    return () => { window.removeEventListener("scroll", onScroll); element?.removeEventListener("focusin", onFocus); window.cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    const background = [document.querySelector("main"), document.querySelector("footer")].filter(Boolean) as HTMLElement[];
    background.forEach((element) => element.setAttribute("inert", ""));
    const first = menu.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
      if (event.key !== "Tab") return;
      const focusables = [toggle.current, ...Array.from(menu.current?.querySelectorAll<HTMLElement>("a") ?? [])].filter(Boolean) as HTMLElement[];
      const current = focusables.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && current <= 0) { event.preventDefault(); focusables.at(-1)?.focus(); }
      else if (!event.shiftKey && current === focusables.length - 1) { event.preventDefault(); focusables[0]?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("menu-open"); background.forEach((element) => element.removeAttribute("inert")); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const close = () => { setOpen(false); toggle.current?.focus(); };
  const logo = solid || open ? brandAssets.header.solid : brandAssets.header.transparent;
  return (
    <header ref={header} className={`${styles.header} ${solid || open ? styles.solid : ""}`} data-hidden={hidden && !open ? "true" : undefined}>
      <div className={styles.inner}>
        <a href="#topo" className={styles.wordmark} aria-label="Casa Praiamar — voltar ao início" onClick={() => setOpen(false)}>
          <picture>
            <source srcSet={logo.avif} type="image/avif" />
            <source srcSet={logo.webp} type="image/webp" />
            <img src={logo.webp} alt="" width={logo.crop.width} height={logo.crop.height} />
          </picture>
        </a>
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {content.navigation.map((item) => <a key={item.href} href={item.href} data-underline>{item.label}</a>)}
        </nav>
        <ReserveLink className={styles.reserve} source="header">Reservar</ReserveLink>
        <button ref={toggle} className={styles.menuToggle} type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}><span /><span /></button>
      </div>
      <div ref={menu} id="mobile-menu" className={`${styles.mobileMenu} ${open ? styles.mobileOpen : ""}`} aria-hidden={!open}>
        <nav aria-label="Navegação mobile">
          {content.navigation.map((item) => <a key={item.href} href={item.href} onClick={close}>{item.label}</a>)}
          <ReserveLink source="mobile-menu" onClick={close}>Reservar</ReserveLink>
        </nav>
        <p>O privilégio de viver sem pressa.</p>
      </div>
    </header>
  );
}
