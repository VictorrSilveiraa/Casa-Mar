"use client";

import { content } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";
import styles from "./FaqList.module.css";

export function FaqList() {
  return <div className={styles.list}>{content.faq.items.map((item, index) => <details key={item.question} onToggle={(event) => { if (event.currentTarget.open) trackEvent("faq_open", { index: index + 1 }); }}><summary>{item.question}<span aria-hidden="true" className={styles.icon} /></summary><p>{item.answer}</p></details>)}</div>;
}
