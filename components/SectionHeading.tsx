import styles from "./SectionHeading.module.css";

export function SectionHeading({ eyebrow, title, description, className = "", id }: { eyebrow: string; title: string; description?: string; className?: string; id?: string }) {
  return <div className={`${styles.heading} ${className}`}><p className={styles.eyebrow}>{eyebrow}</p><h2 id={id}>{title}</h2>{description && <p className={styles.description}>{description}</p>}</div>;
}
