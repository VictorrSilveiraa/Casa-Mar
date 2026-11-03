import { content } from "@/lib/content";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { SectionHeading } from "@/components/SectionHeading";
import styles from "./EssenceSection.module.css";

export function EssenceSection() {
  return (
    <section id="a-casa" className={styles.section} aria-labelledby="essence-title" data-essence-section>
      <div className={styles.container}>
        <div className={styles.copy} data-essence-copy>
          <SectionHeading id="essence-title" title={content.essence.title} />
          <div className={styles.paragraphs}>
            {content.essence.paragraphs.map((text) => <p key={text}>{text}</p>)}
          </div>
          <a className={styles.action} href="#ambientes">{content.essence.action}</a>
        </div>
        <div className={styles.image} data-essence-image>
          <ResponsiveImage image="garden" sizes="(max-width: 767px) 100vw, 48vw" />
        </div>
      </div>
    </section>
  );
}
