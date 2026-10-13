import { content } from "@/lib/content";
import { ResponsiveImage } from "./ResponsiveImage";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="topo" className={styles.hero} aria-labelledby="hero-title">
      <ResponsiveImage image="heroDesktop" mobileImage="heroMobile" sizes="100vw" className={styles.photo} priority />
      <div className={`${styles.scrim} ${styles.topScrim}`} aria-hidden="true" />
      <div className={`${styles.scrim} ${styles.bottomScrim}`} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
        <h1 id="hero-title">{content.hero.title}</h1>
        <p className={styles.description}>{content.hero.description}</p>
        <a href="#a-casa" className={styles.link}>{content.hero.action}<span aria-hidden="true">↗</span></a>
      </div>
      <a href="#a-casa" className={styles.scroll}>{content.hero.scroll}<span aria-hidden="true" /></a>
    </section>
  );
}
