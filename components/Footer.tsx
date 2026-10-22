"use client";

import { useEffect, useRef } from "react";
import { content } from "@/lib/content";
import { siteConfig } from "@/lib/site.config";
import styles from "./Footer.module.css";

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    footer.dataset.motion = "ready";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        footer.dataset.visible = "true";
        observer.disconnect();
      },
      { threshold: 0.08 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer id="rodape" className={styles.footer} ref={footerRef}>
      <div className={styles.inner}>
        <div className={styles.info} data-footer-info>
          <div className={styles.identity}>
            <a className={styles.brand} href="#topo">{content.footer.brand}</a>
            <p className={styles.statement}>{content.footer.statement}</p>
          </div>

          <div className={styles.navigationGroup}>
            <p className={styles.label}>{content.footer.navigationLabel}</p>
            <nav className={styles.navigation} aria-label="Navegação do rodapé">
              {content.footer.links.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
            </nav>
          </div>

          <div className={styles.destination}>
            <p className={styles.label}>{content.footer.destinationLabel}</p>
            <p className={styles.location}>{content.footer.location}</p>
            <a className={styles.action} href="#reservas" data-focus-booking>
              {content.footer.action}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className={styles.meta} data-footer-meta>
          <span>© {new Date().getFullYear()} Casa Praiamar</span>
          {siteConfig.instagramHandle && <a href={`https://instagram.com/${siteConfig.instagramHandle}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
        </div>
      </div>

      <div className={styles.wordmarkFrame}>
        <a className={styles.wordmark} href="#topo" aria-label="Casa Praiamar — voltar ao início" data-footer-wordmark>
          {content.footer.wordmark}
        </a>
      </div>
    </footer>
  );
}
