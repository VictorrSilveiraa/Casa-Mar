"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { content } from "@/lib/content";
import { siteConfig } from "@/lib/site.config";
import { trackEvent } from "@/lib/analytics";
import { addDays, readInquiryQuery, submitInquiry, todayInFortaleza, validateInquiry, type Inquiry, type InquiryErrors } from "@/lib/inquiry";
import styles from "./BookingBar.module.css";

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false"><path d="M4 5.5h12v10H4zM6.5 3.5v4M13.5 3.5v4M4 8h12" /></svg>;
}

function ChevronDown() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false"><path d="m6.5 8 3.5 3.5L13.5 8" /></svg>;
}

export function BookingBar() {
  const [today] = useState(() => todayInFortaleza());
  const [inquiry, setInquiry] = useState<Inquiry>({ checkin: "", checkout: "", guests: siteConfig.booking.initialGuests });
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const checkinRef = useRef<HTMLInputElement>(null);
  const checkoutRef = useRef<HTMLInputElement>(null);
  const guestsRef = useRef<HTMLSelectElement>(null);

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

  const inquiryIsComplete = Object.keys(validateInquiry(inquiry, today)).length === 0;

  return (
    <section id="reservas" className={styles.section} aria-label="Consulta de estadia">
      <div className={styles.inner}>
        <form className={styles.form} noValidate onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="checkin">{content.booking.checkin}</label>
            <div className={styles.inputRow}>
              <CalendarIcon />
              <input ref={checkinRef} id="checkin" type="date" min={today} value={inquiry.checkin} onChange={(event) => update("checkin", event.target.value)} aria-invalid={!!errors.checkin} aria-describedby={errors.checkin ? "checkin-error" : undefined} />
              {!inquiry.checkin && <span className={styles.datePrompt} aria-hidden="true">Selecione as datas</span>}
              <ChevronDown />
            </div>
            {errors.checkin && <span id="checkin-error" className={styles.error}>{errors.checkin}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="checkout">{content.booking.checkout}</label>
            <div className={styles.inputRow}>
              <CalendarIcon />
              <input ref={checkoutRef} id="checkout" type="date" min={inquiry.checkin ? addDays(inquiry.checkin, 1) : addDays(today, 1)} value={inquiry.checkout} onChange={(event) => update("checkout", event.target.value)} aria-invalid={!!errors.checkout} aria-describedby={errors.checkout ? "checkout-error" : undefined} />
              {!inquiry.checkout && <span className={styles.datePrompt} aria-hidden="true">Selecione as datas</span>}
              <ChevronDown />
            </div>
            {errors.checkout && <span id="checkout-error" className={styles.error}>{errors.checkout}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="guests">{content.booking.guests}</label>
            <div className={`${styles.inputRow} ${styles.selectRow}`}>
              <select ref={guestsRef} id="guests" value={inquiry.guests} onChange={(event) => update("guests", Number(event.target.value))} aria-invalid={!!errors.guests} aria-describedby={errors.guests ? "guests-error" : undefined}>
                {Array.from({ length: siteConfig.booking.maxGuests }, (_, index) => index + 1).map((guests) => <option key={guests} value={guests}>{guests} {guests === 1 ? "hóspede" : "hóspedes"}</option>)}
              </select>
              <ChevronDown />
            </div>
            {errors.guests && <span id="guests-error" className={styles.error}>{errors.guests}</span>}
          </div>
          <button className={styles.submit} type="submit" disabled={!inquiryIsComplete}>{content.booking.action}</button>
        </form>
        {message && <div className={styles.result} role="status"><p>{message}</p><button type="button" onClick={copy}>{copied ? "Mensagem copiada" : "Copiar mensagem"}</button></div>}
      </div>
    </section>
  );
}
