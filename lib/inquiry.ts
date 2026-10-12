export type Inquiry = { checkin: string; checkout: string; guests: number };
export type InquiryErrors = Partial<Record<keyof Inquiry, string>>;

export function todayInFortaleza(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function validIso(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return addDays(iso, 0) === iso;
}

export function validateInquiry(inquiry: Inquiry, today = todayInFortaleza()): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!inquiry.checkin) errors.checkin = "Escolha a data de check-in.";
  else if (!validIso(inquiry.checkin) || inquiry.checkin < today) errors.checkin = "O check-in não pode ser anterior a hoje.";
  if (!inquiry.checkout) errors.checkout = "Escolha a data de check-out.";
  else if (!validIso(inquiry.checkout) || (inquiry.checkin && inquiry.checkout <= inquiry.checkin)) errors.checkout = "O check-out deve ser depois do check-in.";
  if (!Number.isInteger(inquiry.guests) || inquiry.guests < 1 || inquiry.guests > 24) errors.guests = "Informe de 1 a 24 hóspedes.";
  return errors;
}

function brDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function buildInquiryMessage(inquiry: Inquiry): string {
  return `Olá! Gostaria de consultar a disponibilidade da Casa Praiamar para check-in em ${brDate(inquiry.checkin)}, check-out em ${brDate(inquiry.checkout)}, para ${inquiry.guests} hóspedes.`;
}

export function submitInquiry(inquiry: Inquiry, whatsappNumber: string): { kind: "whatsapp"; url: string } | { kind: "copy"; message: string } {
  const message = buildInquiryMessage(inquiry);
  if (whatsappNumber) return { kind: "whatsapp", url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}` };
  return { kind: "copy", message };
}

export function readInquiryQuery(search: string, initialGuests: number): Inquiry {
  const params = new URLSearchParams(search);
  const guests = Number(params.get("hospedes"));
  return {
    checkin: params.get("checkin") ?? "",
    checkout: params.get("checkout") ?? "",
    guests: Number.isInteger(guests) && guests >= 1 && guests <= 24 ? guests : initialGuests,
  };
}
