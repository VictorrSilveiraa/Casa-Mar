"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { content } from "@/lib/content";
import { siteConfig } from "@/lib/site.config";
import { trackEvent } from "@/lib/analytics";
import { addDays, readInquiryQuery, submitInquiry, todayInFortaleza, validateInquiry, type Inquiry, type InquiryErrors } from "@/lib/inquiry";
import styles from "./BookingBar.module.css";

export function BookingBar() {
  const [today] = useState(() => todayInFortaleza());
  const [inquiry, setInquiry] = useState<Inquiry>({ checkin: "", checkout: "", guests: siteConfig.booking.initialGuests });
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const checkinRef = useRef<HTMLInputElement>(null);
  const checkoutRef = useRef<HTMLInputElement>(null);
  const guestsRef = useRef<HTMLOutputElement>(null);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      setInquiry(readInquiryQuery(window.location.search, siteConfig.booking.initialGuests));
      setReady(true);
    }, 0);
    const focusFromLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a[data-focus-booking]");
      if (link) window.setTimeout(() => checkinRef.current?.focus(), 350);
    };
    document.addEventListener("click", focusFromLink);
    if (window.location.hash === "#reservas") window.setTimeout(() => checkinRef.current?.focus(), 350);
    return () => { window.clearTimeout(restore); document.removeEventListener("click", focusFromLink); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    for (const [key, value] of [["checkin", inquiry.checkin], ["checkout", inquiry.checkout], ["hospedes", String(inquiry.guests)]]) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [inquiry, ready]);

  const update = <K extends keyof Inquiry>(key: K, value: Inquiry[K]) => {
    setInquiry((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setMessage("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateInquiry(inquiry, todayInFortaleza());
    setErrors(nextErrors);
    for (const key of ["checkin", "checkout", "guests"] as const) {
      if (nextErrors[key]) {
        ({ checkin: checkinRef, checkout: checkoutRef, guests: guestsRef }[key]).current?.focus();
        return;
      }
    }
    trackEvent("inquiry_submit", { guests: inquiry.guests });
    const result = submitInquiry(inquiry, siteConfig.whatsappNumber);
    if (result.kind === "whatsapp") {
      trackEvent("whatsapp_click", { source: "booking" });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } else {
      setMessage(result.message);
      setCopied(false);
      if (process.env.NODE_ENV === "development") console.warn("integração de contato pendente");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  };

  return (
    <section id="reservas" className={styles.section} aria-label="Consulta de estadia">
      <div className={styles.inner}>
        <form className={styles.form} noValidate onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="checkin">{content.booking.checkin}</label>
            <input ref={checkinRef} id="checkin" type="date" min={today} value={inquiry.checkin} onChange={(event) => update("checkin", event.target.value)} aria-invalid={!!errors.checkin} aria-describedby={errors.checkin ? "checkin-error" : undefined} />
            {errors.checkin && <span id="checkin-error" className={styles.error}>{errors.checkin}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="checkout">{content.booking.checkout}</label>
            <input ref={checkoutRef} id="checkout" type="date" min={inquiry.checkin ? addDays(inquiry.checkin, 1) : addDays(today, 1)} value={inquiry.checkout} onChange={(event) => update("checkout", event.target.value)} aria-invalid={!!errors.checkout} aria-describedby={errors.checkout ? "checkout-error" : undefined} />
            {errors.checkout && <span id="checkout-error" className={styles.error}>{errors.checkout}</span>}
          </div>
          <div className={styles.field}>
            <span id="guests-label" className={styles.label}>{content.booking.guests}</span>
            <div className={styles.stepper} role="group" aria-labelledby="guests-label">
              <button type="button" aria-label="Diminuir hóspedes" disabled={inquiry.guests <= 1} onClick={() => update("guests", inquiry.guests - 1)}>−</button>
              <output ref={guestsRef} role="spinbutton" tabIndex={0} aria-labelledby="guests-label" aria-valuemin={1} aria-valuemax={siteConfig.booking.maxGuests} aria-valuenow={inquiry.guests} aria-invalid={!!errors.guests} aria-describedby={errors.guests ? "guests-error" : undefined} aria-live="polite" aria-atomic="true" onKeyDown={(event) => {
                if (["ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight", "Home", "End"].includes(event.key)) event.preventDefault();
                if (["ArrowDown", "ArrowLeft"].includes(event.key)) update("guests", Math.max(1, inquiry.guests - 1));
                if (["ArrowUp", "ArrowRight"].includes(event.key)) update("guests", Math.min(siteConfig.booking.maxGuests, inquiry.guests + 1));
                if (event.key === "Home") update("guests", 1);
                if (event.key === "End") update("guests", siteConfig.booking.maxGuests);
              }}>{inquiry.guests}</output>
              <button type="button" aria-label="Aumentar hóspedes" disabled={inquiry.guests >= siteConfig.booking.maxGuests} onClick={() => update("guests", inquiry.guests + 1)}>+</button>
            </div>
            {errors.guests && <span id="guests-error" className={styles.error}>{errors.guests}</span>}
          </div>
          <button className={styles.submit} type="submit">{content.booking.action}<span aria-hidden>↗</span></button>
        </form>
        {message && <div className={styles.result} role="status"><p>{message}</p><button type="button" onClick={copy}>{copied ? "Mensagem copiada" : "Copiar mensagem"}</button></div>}
      </div>
    </section>
  );
}
