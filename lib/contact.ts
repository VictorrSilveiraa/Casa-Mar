import { siteConfig } from "./site.config";

/**
 * Single destination for every "Reservar" action on the site.
 * With `whatsappNumber` set in site.config.ts, all reservation buttons open WhatsApp.
 * While it is empty, they scroll to the FAQ instead of inventing a contact.
 */
export const reservationLink = siteConfig.whatsappNumber
  ? { href: `https://wa.me/${siteConfig.whatsappNumber}`, external: true }
  : { href: "#informacoes", external: false };
