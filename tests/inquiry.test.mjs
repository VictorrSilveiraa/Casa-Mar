import test from "node:test";
import assert from "node:assert/strict";
import { addDays, buildInquiryMessage, readInquiryQuery, submitInquiry, todayInFortaleza, validateInquiry } from "../lib/inquiry.ts";

test("Fortaleza date uses its local calendar day", () => {
  assert.equal(todayInFortaleza(new Date("2026-10-13T01:00:00.000Z")), "2026-10-12");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("empty dates produce both inline errors", () => {
  assert.deepEqual(validateInquiry({ checkin: "", checkout: "", guests: 2 }, "2026-10-12"), {
    checkin: "Escolha a data de check-in.", checkout: "Escolha a data de check-out."
  });
});

test("past check-in and equal check-out are rejected", () => {
  assert.deepEqual(validateInquiry({ checkin: "2026-10-11", checkout: "2026-10-11", guests: 2 }, "2026-10-12"), {
    checkin: "O check-in não pode ser anterior a hoje.", checkout: "O check-out deve ser depois do check-in."
  });
});

test("guest bounds reject zero and 25", () => {
  for (const guests of [0, 25]) {
    assert.equal(validateInquiry({ checkin: "2026-10-12", checkout: "2026-10-13", guests }, "2026-10-12").guests, "Informe de 1 a 24 hóspedes.");
  }
});

test("valid message follows official copy with Brazilian dates", () => {
  assert.equal(buildInquiryMessage({ checkin: "2026-11-20", checkout: "2026-11-24", guests: 2 }), "Olá! Gostaria de consultar a disponibilidade da Casa Praiamar para check-in em 20/11/2026, check-out em 24/11/2026, para 2 hóspedes.");
});

test("submission chooses encoded WhatsApp URL or copy text", () => {
  const inquiry = { checkin: "2026-11-20", checkout: "2026-11-24", guests: 2 };
  const withNumber = submitInquiry(inquiry, "5585999999999");
  assert.equal(withNumber.kind, "whatsapp");
  assert.equal(withNumber.url, `https://wa.me/5585999999999?text=${encodeURIComponent(buildInquiryMessage(inquiry))}`);
  const withoutNumber = submitInquiry(inquiry, "");
  assert.deepEqual(withoutNumber, { kind: "copy", message: buildInquiryMessage(inquiry) });
});

test("query state restores dates and valid guest count", () => {
  assert.deepEqual(readInquiryQuery("?checkin=2026-11-20&checkout=2026-11-24&hospedes=4", 2), { checkin: "2026-11-20", checkout: "2026-11-24", guests: 4 });
  assert.equal(readInquiryQuery("?hospedes=25", 2).guests, 2);
});
