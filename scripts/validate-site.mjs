import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(import.meta.dirname, "../docs/screenshots");
const baseUrl = process.env.BASE_URL ?? process.argv[2] ?? "http://127.0.0.1:3000";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const widths = [360, 375, 390, 430, 768, 1024, 1440, 1920];
const problems = [];

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 800 : 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleProblems = [];
  page.on("console", (msg) => { if (["error", "warning"].includes(msg.type())) consoleProblems.push(`${msg.type()}: ${msg.text()}`); });
  page.on("pageerror", (error) => consoleProblems.push(`pageerror: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    imgs.forEach((img) => { img.loading = "eager"; });
    await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
  });
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  if (size.scroll > size.inner) problems.push(`${width}px overflow ${size.scroll - size.inner}px`);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator("#topo #reservas").count(), 0);
  assert.equal(await page.locator("#suites").count(), 1);
  assert.equal(await page.locator("#suites img").count(), 5);
  assert.equal(await page.locator("#suites h2").textContent(), "Nossas suítes");
  assert.equal(await page.locator('#suites [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("O prazer de descansar", { exact: false }).count(), 0);
  assert.equal(await page.getByText("O conforto de estar longe", { exact: false }).count(), 0);
  assert.equal(await page.locator('#suites a[href="/suites"]').count(), 1);
  const firstSuiteLeft = await page.locator("#suites article").first().evaluate((element) => element.getBoundingClientRect().left);
  if (width > 900) assert.ok(Math.abs(firstSuiteLeft) <= 1, `${width}px first suite starts at x=${firstSuiteLeft}, expected x=0`);
  else assert.ok(firstSuiteLeft > 0, `${width}px first suite must retain its mobile gutter`);
  assert.equal(await page.locator("#diferenciais").count(), 1);
  assert.equal(await page.locator("#diferenciais img").count(), 1);
  assert.equal(await page.locator("#diferenciais [data-feature-item]").count(), 4);
  assert.equal(await page.locator('#diferenciais [class*="eyebrow"]').count(), 0);
  assert.equal(await page.locator("#ambientes").count(), 1);
  assert.equal(await page.locator('#ambientes [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("ESPAÇOS QUE INSPIRAM", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Dos dias ensolarados às noites de conversas prolongadas, a Praiamar reúne espaços que convidam a estar junto e aproveitar cada instante.", { exact: true }).count(), 0);
  assert.equal(await page.locator("#ambientes [data-environment-item]").count(), 3);
  assert.deepEqual(await page.locator("#ambientes [data-environment-item] h3").allTextContents(), ["Piscina", "Cozinha gourmet", "Terraço"]);
  assert.equal(await page.getByRole("button", { name: "Conheça todos os ambientes" }).count(), 1);
  if (width === 1440) {
    const environmentLayout = await page.evaluate(() => {
      const section = document.querySelector("#ambientes");
      const title = section?.querySelector("h2");
      const images = Array.from(section?.querySelectorAll("[data-environment-item] > div:first-child") ?? []);
      if (!title || images.length !== 3) throw new Error("Environment layout elements were not found.");
      const titleRect = title.getBoundingClientRect();
      return {
        titleCenter: titleRect.left + titleRect.width / 2,
        viewportCenter: window.innerWidth / 2,
        images: images.map((image) => {
          const rect = image.getBoundingClientRect();
          return { top: rect.top, width: rect.width, height: rect.height };
        }),
      };
    });
    assert.ok(Math.abs(environmentLayout.titleCenter - environmentLayout.viewportCenter) <= 1, "Environment title must be centered");
    assert.ok(Math.max(...environmentLayout.images.map(({ top }) => top)) - Math.min(...environmentLayout.images.map(({ top }) => top)) <= 1, "Environment images must share the same top edge");
    assert.ok(Math.max(...environmentLayout.images.map(({ width }) => width)) - Math.min(...environmentLayout.images.map(({ width }) => width)) <= 1, "Environment images must have equal widths");
    for (const image of environmentLayout.images) assert.ok(Math.abs(image.width / image.height - 0.75) <= 0.01, "Environment images must use a 3:4 ratio");
  }
  if (width === 1920) {
    const environmentSpacing = await page.evaluate(() => {
      const section = document.querySelector("#ambientes");
      const title = section?.querySelector("h2");
      const grid = section?.querySelector("[data-environment-item]")?.parentElement;
      const firstImage = section?.querySelector("[data-environment-item] > div:first-child");
      if (!title || !grid || !firstImage) throw new Error("Environment spacing elements were not found.");
      const titleRect = title.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      const imageRect = firstImage.getBoundingClientRect();
      return { gridWidth: gridRect.width, titleToImage: imageRect.top - titleRect.bottom };
    });
    assert.ok(environmentSpacing.gridWidth >= 1600, `Environment content width is ${environmentSpacing.gridWidth}px, expected at least 1600px`);
    assert.ok(environmentSpacing.titleToImage <= 80, `Environment title-to-image gap is ${environmentSpacing.titleToImage}px, expected at most 80px`);
  }
  assert.equal(await page.locator("#hospitalidade").count(), 1);
  assert.equal(await page.locator('#hospitalidade [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("Mais tempo para estar presente.", { exact: false }).count(), 0);
  assert.equal(await page.locator("#hospitalidade").getByText(/Cozinheira|Camareira|Segurança noturna/).count(), 0);
  if (width === 390 || width === 1440) {
    const typography = await page.evaluate(() => {
      const read = (element) => {
        const style = getComputedStyle(element);
        return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing };
      };
      const h1 = document.querySelector("h1");
      const h2 = document.querySelector("#a-casa h2");
      const overline = h2?.previousElementSibling;
      const paragraph = document.querySelector('#a-casa [class*="paragraphs"] p');
      if (!h1 || !h2 || !overline || !paragraph) throw new Error("Typography sample elements were not found.");
      return { h1: read(h1), h2: read(h2), overline: read(overline), paragraph: read(paragraph) };
    });
    const mobile = width === 390;
    assert.match(typography.h1.family, /^newsreader300/i);
    assert.equal(typography.h1.size, mobile ? "48px" : "88px");
    assert.equal(typography.h1.weight, "300");
    assert.match(typography.h2.family, /^newsreader300/i);
    assert.equal(typography.h2.size, mobile ? "40px" : "56px");
    assert.equal(typography.h2.weight, "300");
    assert.match(typography.paragraph.family, /^jost300/i);
    assert.equal(typography.paragraph.size, mobile ? "17px" : "18px");
    assert.equal(typography.paragraph.weight, "300");
    assert.match(typography.overline.family, /^jost400/i);
    assert.equal(typography.overline.size, mobile ? "12px" : "13px");
    assert.equal(typography.overline.weight, "400");
  }
  await page.screenshot({ path: resolve(output, `${width}.png`), fullPage: true, animations: "disabled" });
  if (width === 390 || width === 1440) await page.screenshot({ path: resolve(output, `${width}-hero.png`), animations: "disabled" });
  if (consoleProblems.length) problems.push(`${width}px console: ${consoleProblems.join(" | ")}`);
  console.log(`${width}px: screenshot, overflow=${size.scroll - size.inner}, console=${consoleProblems.length}${consoleProblems.length ? ` (${consoleProblems.join(" | ")})` : ""}`);
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 390, height: 800 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const interactiveProblems = [];
page.on("console", (msg) => { if (["error", "warning"].includes(msg.type())) interactiveProblems.push(`${msg.type()}: ${msg.text()}`); });
page.on("pageerror", (error) => interactiveProblems.push(`pageerror: ${error.message}`));
await page.goto(baseUrl, { waitUntil: "networkidle" });
const inquirySubmit = page.getByRole("button", { name: "Consultar disponibilidade" });
assert.equal(await inquirySubmit.isDisabled(), true);
await page.locator("#reservas form").evaluate((form) => form.requestSubmit());
assert.equal(await page.locator(":focus").getAttribute("id"), "checkin");
assert.equal(await page.locator("#checkin-error").textContent(), "Escolha a data de check-in.");
assert.equal(await page.locator("#checkout-error").textContent(), "Escolha a data de check-out.");
const today = await page.locator("#checkin").getAttribute("min");
const past = new Date(`${today}T12:00:00Z`); past.setUTCDate(past.getUTCDate() - 1);
const pastIso = past.toISOString().slice(0, 10);
await page.locator("#checkin").fill(pastIso);
await page.locator("#checkout").fill(pastIso);
await page.locator("#reservas form").evaluate((form) => form.requestSubmit());
assert.equal(await page.locator("#checkin-error").textContent(), "O check-in não pode ser anterior a hoje.");
assert.equal(await page.locator("#checkout-error").textContent(), "O check-out deve ser depois do check-in.");
await page.locator("#checkin").fill(today);
const checkout = new Date(`${today}T12:00:00Z`); checkout.setUTCDate(checkout.getUTCDate() + 1);
await page.locator("#checkout").fill(checkout.toISOString().slice(0, 10));
assert.equal(await inquirySubmit.isEnabled(), true);
await page.getByRole("button", { name: "Diminuir hóspedes" }).click();
assert.equal(await page.getByRole("button", { name: "Diminuir hóspedes" }).isDisabled(), true);
for (let i = 0; i < 23; i++) await page.getByRole("button", { name: "Aumentar hóspedes" }).click();
assert.equal(await page.getByRole("button", { name: "Aumentar hóspedes" }).isDisabled(), true);
await page.getByRole("spinbutton", { name: "Hóspedes" }).focus();
await page.keyboard.press("Home");
assert.equal(await page.getByRole("spinbutton", { name: "Hóspedes" }).textContent(), "1 hóspedes");
await page.keyboard.press("End");
assert.equal(await page.getByRole("spinbutton", { name: "Hóspedes" }).textContent(), "24 hóspedes");
await page.getByRole("button", { name: "Consultar disponibilidade" }).click();
assert.equal(await page.getByRole("button", { name: "Copiar mensagem" }).isVisible(), true);
assert.match(new URL(page.url()).search, /hospedes=24/);
await page.getByRole("button", { name: "Copiar mensagem" }).click();
await page.getByRole("button", { name: "Mensagem copiada" }).waitFor({ state: "visible" });
await page.reload({ waitUntil: "networkidle" });
assert.equal(await page.locator("#checkin").inputValue(), today);
assert.equal(await page.locator("#checkout").inputValue(), checkout.toISOString().slice(0, 10));
assert.equal(await page.getByRole("spinbutton", { name: "Hóspedes" }).textContent(), "24 hóspedes");
await page.getByRole("button", { name: "Abrir menu" }).click();
assert.equal(await page.getByRole("button", { name: "Fechar menu" }).getAttribute("aria-expanded"), "true");
assert.equal(await page.locator("main").getAttribute("inert"), "");
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("button", { name: "Abrir menu" }).getAttribute("aria-expanded"), "false");
assert.equal(await page.locator("main").getAttribute("inert"), null);
assert.equal(await page.locator(":focus").getAttribute("aria-label"), "Abrir menu");
const suites = page.getByRole("region", { name: "Suítes da Casa Praiamar" });
await suites.getByRole("button", { name: "Próxima suíte" }).click();
await suites.getByText("02 / 05").waitFor({ state: "visible" });
await suites.getByRole("button", { name: "Suíte anterior" }).click();
await suites.getByText("01 / 05").waitFor({ state: "visible" });
await page.locator("details summary").first().focus();
await page.keyboard.press("Enter");
assert.equal(await page.locator("details").first().getAttribute("open"), "");
await page.getByRole("button", { name: "Conheça todos os ambientes" }).click();
assert.equal(await page.getByRole("dialog", { name: "Galeria de ambientes" }).isVisible(), true);
await page.keyboard.press("ArrowRight");
assert.match(await page.locator("dialog").textContent(), /2 \/ 6/);
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog", { name: "Galeria de ambientes" }).isVisible(), false);
assert.equal(await page.locator(":focus").textContent(), "Conheça todos os ambientes↗");
assert.deepEqual(interactiveProblems.filter((problem) => problem !== "warning: integração de contato pendente"), []);
console.log("Inquiry, menu, FAQ and gallery interactions: PASS");
await context.close();

const desktopSuites = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopSuitesPage = await desktopSuites.newPage();
await desktopSuitesPage.goto(baseUrl, { waitUntil: "networkidle" });
const desktopSuitesRegion = desktopSuitesPage.getByRole("region", { name: "Suítes da Casa Praiamar" });
await desktopSuitesRegion.getByRole("button", { name: "Próxima suíte" }).click();
await desktopSuitesRegion.getByText("02 / 05").waitFor({ state: "visible" });
await desktopSuitesRegion.getByRole("button", { name: "Suíte anterior" }).click();
await desktopSuitesPage.waitForFunction(() => {
  const firstSuite = document.querySelector("#suites article");
  return firstSuite ? Math.abs(firstSuite.getBoundingClientRect().left) <= 1 : false;
});
console.log("Desktop suites first stage edge alignment: PASS");
await desktopSuites.close();

const reduced = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: "reduce" });
const reducedPage = await reduced.newPage();
await reducedPage.goto(baseUrl);
assert.equal(await reducedPage.locator("h1").isVisible(), true);
assert.equal(await reducedPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
await reduced.close();
const noJs = await browser.newContext({ viewport: { width: 390, height: 800 }, javaScriptEnabled: false });
const noJsPage = await noJs.newPage();
await noJsPage.goto(baseUrl);
assert.equal(await noJsPage.getByText("Há lugares que nos fazem esquecer das horas.").isVisible(), true);
assert.equal(await noJsPage.locator("details summary").first().isVisible(), true);
await noJs.close();
console.log("Reduced motion and no-JavaScript content: PASS");

await browser.close();
if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }
