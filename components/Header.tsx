"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import styles from "./Header.module.css";

export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
  return (
    <header className={`${styles.header} ${solid || open ? styles.solid : ""}`}>
      <div className={styles.inner}>
        <a href="#topo" className={styles.wordmark} onClick={() => setOpen(false)}>CASA PRAIAMAR</a>
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {content.navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <a className={styles.reserve} href="#reservas" data-focus-booking>Reservar</a>
        <button ref={toggle} className={styles.menuToggle} type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}><span /><span /></button>
      </div>
      <div ref={menu} id="mobile-menu" className={`${styles.mobileMenu} ${open ? styles.mobileOpen : ""}`} aria-hidden={!open}>
        <nav aria-label="Navegação mobile">
          {content.navigation.map((item) => <a key={item.href} href={item.href} onClick={close}>{item.label}</a>)}
          <a href="#reservas" data-focus-booking onClick={close}>Reservar</a>
        </nav>
        <p>O privilégio de viver sem pressa.</p>
      </div>
    </header>
  );
}
