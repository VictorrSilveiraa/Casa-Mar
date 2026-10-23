"use client";

import { useEffect, useState } from "react";
import styles from "./StickyCTA.module.css";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector("#topo");
    const booking = document.querySelector("#reservas");
    const footer = document.querySelector("#rodape");
    if (!hero || !booking || !footer) return;
    let heroVisible = true, bookingVisible = false, footerVisible = false;
    const update = () => setVisible(!heroVisible && !bookingVisible && !footerVisible);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === booking) bookingVisible = entry.isIntersecting;
        if (entry.target === footer) footerVisible = entry.isIntersecting;
      }
      update();
    });
    [hero, booking, footer].forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return visible ? <a className={styles.button} href="#reservas" data-focus-booking>Consultar</a> : null;
}
