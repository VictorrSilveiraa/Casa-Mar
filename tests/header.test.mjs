import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("desktop reservation CTA uses the shared reservation link without a decorative arrow", async () => {
  const header = await readFile(new URL("../components/Header.tsx", import.meta.url), "utf8");

  assert.ok(header.includes('<ReserveLink className={styles.reserve} source="header">Reservar</ReserveLink>'));
});

test("reservation link opens WhatsApp only when a number is configured", async () => {
  const contact = await readFile(new URL("../lib/contact.ts", import.meta.url), "utf8");

  assert.ok(contact.includes("`https://wa.me/${siteConfig.whatsappNumber}`"));
  assert.match(contact, /href: "#informacoes"/);
});

test("booking bar and mobile sticky CTA are removed from the page", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.doesNotMatch(page, /BookingBar|StickyCTA|#reservas/);
});
