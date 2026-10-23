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
  const essenceLayout = await page.locator("#a-casa").evaluate((section) => {
    const image = section.querySelector("[data-essence-image]");
    const copy = section.querySelector("[data-essence-copy]");
    if (!image || !copy) throw new Error("Essence layout elements were not found.");
    const imageRect = image.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    return {
      imageLeftOfCopy: imageRect.right <= copyRect.left,
      copyAboveImage: copyRect.bottom <= imageRect.top,
      centerDelta: Math.abs((imageRect.top + imageRect.height / 2) - (copyRect.top + copyRect.height / 2)),
    };
  });
  if (width > 767) {
    assert.equal(essenceLayout.imageLeftOfCopy, true, `${width}px essence image must sit left of its copy`);
    assert.ok(essenceLayout.centerDelta <= 40, `${width}px essence image and copy must remain vertically centered`);
  } else {
    assert.equal(essenceLayout.copyAboveImage, true, `${width}px essence copy must remain above its image on mobile`);
  }
  const firstSuiteLeft = await page.locator("#suites article").first().evaluate((element) => element.getBoundingClientRect().left);
  if (width > 900) assert.ok(Math.abs(firstSuiteLeft) <= 1, `${width}px first suite starts at x=${firstSuiteLeft}, expected x=0`);
  else assert.ok(firstSuiteLeft > 0, `${width}px first suite must retain its mobile gutter`);
  assert.equal(await page.locator("#diferenciais").count(), 1);
  assert.equal(await page.getByText("UM CONVITE PARA DESACELERAR", { exact: true }).count(), 0);
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
    const bookingBar = await page.locator("#reservas form").evaluate((form) => {
      const rect = form.getBoundingClientRect();
      const children = Array.from(form.children).map((element) => element.getBoundingClientRect());
      const dateInputs = Array.from(form.querySelectorAll('input[type="date"]')).map((element) => element.getBoundingClientRect());
      const dateRows = Array.from(form.querySelectorAll('input[type="date"]')).map((input) => {
        const row = input.parentElement;
        if (!row) throw new Error("Date input row was not found.");
        const controls = Array.from(row.children).map((element) => element.getBoundingClientRect());
        return { height: row.getBoundingClientRect().height, controls };
      });
      return {
        width: rect.width,
        height: rect.height,
        contentContained: children.every((child) => child.top >= rect.top && child.bottom <= rect.bottom),
        dateInputsWide: dateInputs.every((input) => input.width >= 200),
        dateRowsSingleLine: dateRows.every(({ height, controls }) => {
          const centers = controls.map(({ top, height: controlHeight }) => top + controlHeight / 2);
          return height <= 32 && Math.max(...centers) - Math.min(...centers) <= 1;
        }),
      };
    });
    assert.ok(Math.abs(bookingBar.width - 1400) <= 1, `Booking bar width is ${bookingBar.width}px, expected 1400px`);
    assert.ok(Math.abs(bookingBar.height - 85) <= 1, `Booking bar height is ${bookingBar.height}px, expected 85px`);
    assert.equal(bookingBar.contentContained, true, "Booking fields and submit button must remain inside the 85px bar");
    assert.equal(bookingBar.dateInputsWide, true, "Date inputs must occupy the available text column");
    assert.equal(bookingBar.dateRowsSingleLine, true, "Date icon, input, prompt and chevron must share one row");
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
  assert.equal(await page.getByText("SUA ESTADIA, COM TRANQUILIDADE", { exact: true }).count(), 0);
  assert.equal(await page.locator('#informacoes [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("O mar, o conforto e as pessoas que fazem tudo valer a pena.", { exact: true }).count(), 0);
  assert.equal(await page.getByText("Sua próxima boa lembrança pode começar aqui.", { exact: true }).count(), 1);
  assert.equal(await page.locator("#experiencias").count(), 1);
  assert.equal(await page.locator("#experiencias img").count(), 1);
  assert.equal(await page.locator("#experiencias h2").textContent(), "Experiências para viver sem pressa.");
  assert.equal(await page.locator('#experiencias a[href="/experiencias"]').textContent(), "Conheça nossas experiências");
  assert.equal(await page.getByText("A ARTE DE VIVER SEM PRESSA", { exact: true }).count(), 0);
  assert.equal(await page.locator('#localizacao [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("ARPOEIRAS, CEARÁ", { exact: true }).count(), 0);
  const locationMeta = await page.locator("#localizacao [data-location-meta]").evaluate((element) => {
    const style = getComputedStyle(element);
    const place = element.querySelector("p")?.getBoundingClientRect();
    const action = element.querySelector("a")?.getBoundingClientRect();
    if (!place || !action) throw new Error("Location metadata content was not found.");
    return {
      borderTopWidth: style.borderTopWidth,
      borderBottomWidth: style.borderBottomWidth,
      placeCenter: place.top + place.height / 2,
      actionCenter: action.top + action.height / 2,
    };
  });
  assert.equal(locationMeta.borderTopWidth, "1px");
  assert.equal(locationMeta.borderBottomWidth, "0px");
  if (width > 767) assert.ok(Math.abs(locationMeta.placeCenter - locationMeta.actionCenter) <= 1, "Location and action must share one editorial row");
  else assert.ok(locationMeta.actionCenter > locationMeta.placeCenter, "Location action must stack below the place on mobile");
  const finalSection = page.locator("main section:last-of-type");
  const finalImage = finalSection.locator("img");
  assert.match(await finalImage.getAttribute("src"), /final-jardim-espreguicadeiras-/);
  const finalTransition = await finalSection.evaluate((section) => {
    const footer = document.querySelector("#rodape");
    const scrim = section.querySelector("[aria-hidden='true']");
    if (!footer || !scrim) throw new Error("Final section transition elements were not found.");
    const sectionRect = section.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    return {
      joinsFooter: Math.abs(sectionRect.bottom - footerRect.top) <= 1,
      gradient: getComputedStyle(scrim).backgroundImage,
    };
  });
  assert.equal(finalTransition.joinsFooter, true, "Final image and footer must meet without a layout gap");
  assert.match(finalTransition.gradient, /linear-gradient/i);
  const footerWordmark = page.locator("#rodape [data-footer-wordmark]");
  assert.equal(await footerWordmark.textContent(), "PRAIAMAR");
  assert.equal(await footerWordmark.getAttribute("href"), "#topo");
  const footerLayout = await page.locator("#rodape").evaluate((footer) => {
    const wordmark = footer.querySelector("[data-footer-wordmark]");
    const wordmarkFrame = wordmark?.parentElement;
    const info = footer.querySelector("[data-footer-info]");
    if (!wordmark || !wordmarkFrame || !info) throw new Error("Footer layout elements were not found.");
    const wordmarkRect = wordmark.getBoundingClientRect();
    const wordmarkFrameRect = wordmarkFrame.getBoundingClientRect();
    const infoRect = info.getBoundingClientRect();
    const wordmarkStyle = getComputedStyle(wordmark);
    const wordmarkFrameStyle = getComputedStyle(wordmarkFrame);
    const footerStyle = getComputedStyle(footer);
    return {
      hasCopyright: footer.textContent?.includes("©") ?? false,
      wordmarkContained: wordmarkRect.left >= -1 && wordmarkRect.right <= window.innerWidth + 1,
      wordmarkFrameGap: wordmarkFrameRect.top - infoRect.bottom,
      wordmarkFamily: wordmarkStyle.fontFamily,
      wordmarkWeight: wordmarkStyle.fontWeight,
      wordmarkGradient: wordmarkStyle.backgroundImage,
      wordmarkLineHeightRatio: Number.parseFloat(wordmarkStyle.lineHeight) / Number.parseFloat(wordmarkStyle.fontSize),
      wordmarkFramePaddingTop: Number.parseFloat(wordmarkFrameStyle.paddingTop),
      footerPaddingTop: Number.parseFloat(footerStyle.paddingTop),
      infoColumns: getComputedStyle(info).gridTemplateColumns.split(" ").length,
    };
  });
  assert.equal(footerLayout.hasCopyright, false, "Footer must not show the copyright line above its wordmark");
  assert.equal(footerLayout.wordmarkContained, true, "Footer wordmark must remain inside the viewport");
  assert.ok(footerLayout.wordmarkFrameGap <= 48, "Footer wordmark must stay visually connected to the information above it");
  assert.ok(footerLayout.footerPaddingTop <= 76, "Footer information must stay visually connected to the image transition");
  assert.match(footerLayout.wordmarkFamily, /^newsreader300/i);
  assert.equal(footerLayout.wordmarkWeight, "300");
  assert.match(footerLayout.wordmarkGradient, /linear-gradient/i);
  assert.ok(footerLayout.wordmarkLineHeightRatio >= .85, "Footer wordmark needs enough line height to show the full letter tops");
  assert.ok(footerLayout.wordmarkFramePaddingTop >= 8, "Footer wordmark needs top breathing room inside its clipped frame");
  assert.equal(footerLayout.infoColumns, width > 900 ? 3 : 1);
  if (width === 1440) {
    await page.waitForFunction(() => document.querySelector("#rodape")?.getAttribute("data-motion") === "ready");
    assert.equal(await page.locator("#rodape").getAttribute("data-visible"), null);
    await page.locator("#rodape").scrollIntoViewIfNeeded();
    await page.locator("#rodape").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("#rodape")?.getAttribute("data-visible") === "true");
  }
  if (width === 1440) {
    const experienceLayout = await page.evaluate(() => {
      const section = document.querySelector("#experiencias");
      const image = section?.querySelector("img");
      const copy = section?.querySelector("h2")?.parentElement;
      if (!section || !image || !copy) throw new Error("Experience layout elements were not found.");
      const sectionRect = section.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const copyRect = copy.getBoundingClientRect();
      return {
        sectionHeight: sectionRect.height,
        imageCoversSection: imageRect.top <= sectionRect.top + 1 && imageRect.bottom >= sectionRect.bottom - 1,
        copyOverImage: copyRect.left >= imageRect.left && copyRect.right <= imageRect.right && copyRect.top >= imageRect.top && copyRect.bottom <= imageRect.bottom,
      };
    });
    assert.ok(experienceLayout.sectionHeight >= 650, `Experience section height is ${experienceLayout.sectionHeight}px, expected at least 650px`);
    assert.equal(experienceLayout.imageCoversSection, true);
    assert.equal(experienceLayout.copyOverImage, true);
  }
  if (width === 390 || width === 1440) {
    const typography = await page.evaluate(() => {
      const read = (element) => {
        const style = getComputedStyle(element);
        return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing };
      };
      const h1 = document.querySelector("h1");
      const h2 = document.querySelector("#a-casa h2");
      const overline = document.querySelector('#topo [class*="eyebrow"]');
      const paragraph = document.querySelector('#a-casa [class*="paragraphs"] p');
      const bookingDatePrompt = document.querySelector('#checkin + span');
      const bookingGuests = document.querySelector('#guests');
      const bookingLabel = document.querySelector('label[for="checkin"]');
      if (!h1 || !h2 || !overline || !paragraph || !bookingDatePrompt || !bookingGuests || !bookingLabel) {
        throw new Error("Typography sample elements were not found.");
      }
      return {
        h1: read(h1),
        h2: read(h2),
        overline: read(overline),
        paragraph: read(paragraph),
        bookingDatePrompt: read(bookingDatePrompt),
        bookingGuests: read(bookingGuests),
        bookingLabel: read(bookingLabel),
      };
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
    assert.match(typography.bookingDatePrompt.family, /^jost300/i);
    assert.equal(typography.bookingDatePrompt.weight, "300");
    assert.match(typography.bookingGuests.family, /^jost300/i);
    assert.equal(typography.bookingGuests.weight, "300");
    assert.match(typography.bookingLabel.family, /^jost400/i);
    assert.equal(typography.bookingLabel.weight, "400");

    const boxedActions = await page.evaluate(() => {
      const selectors = [
        '#topo a[href="#a-casa"]',
        'header a[data-focus-booking]',
        '#reservas button[type="submit"]',
        '#a-casa a[href="#ambientes"]',
        '#suites a[href="/suites"]',
        '#ambientes button',
        '#experiencias a[href="/experiencias"]',
        '#localizacao a',
        '#informacoes a[data-focus-booking]',
        'main section:last-of-type a[data-focus-booking]',
        '#rodape a[data-focus-booking]',
      ];
      return selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Boxed action was not found: ${selector}`);
        const style = getComputedStyle(element);
        return {
          selector,
          weight: style.fontWeight,
          transform: style.textTransform,
          align: style.textAlign,
          justify: style.justifyContent,
          hasArrow: element.textContent?.includes("↗") ?? false,
        };
      });
    });
    for (const action of boxedActions) {
      assert.equal(action.weight, "300", `${action.selector} must use font weight 300`);
      assert.equal(action.transform, "uppercase", `${action.selector} must render in uppercase`);
      assert.equal(action.align, "center", `${action.selector} must center its text`);
      assert.equal(action.justify, "center", `${action.selector} must center its contents`);
      assert.equal(action.hasArrow, false, `${action.selector} must not include a decorative arrow`);
    }
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
assert.equal(await page.getByText("Selecione as datas", { exact: true }).count(), 2);
const guestSelect = page.getByRole("combobox", { name: "Hóspedes" });
assert.equal(await guestSelect.inputValue(), "2");
assert.equal(await guestSelect.locator("option").count(), 24);
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
assert.equal(await page.getByText("Selecione as datas", { exact: true }).count(), 0);
assert.equal(await inquirySubmit.isEnabled(), true);
await guestSelect.selectOption("24");
assert.equal(await guestSelect.inputValue(), "24");
await page.getByRole("button", { name: "Consultar disponibilidade" }).click();
assert.equal(await page.getByRole("button", { name: "Copiar mensagem" }).isVisible(), true);
assert.match(new URL(page.url()).search, /hospedes=24/);
await page.getByRole("button", { name: "Copiar mensagem" }).click();
await page.getByRole("button", { name: "Mensagem copiada" }).waitFor({ state: "visible" });
await page.reload({ waitUntil: "networkidle" });
assert.equal(await page.locator("#checkin").inputValue(), today);
assert.equal(await page.locator("#checkout").inputValue(), checkout.toISOString().slice(0, 10));
assert.equal(await page.getByRole("combobox", { name: "Hóspedes" }).inputValue(), "24");
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
assert.equal(await page.locator(":focus").textContent(), "Conheça todos os ambientes");
assert.deepEqual(interactiveProblems.filter((problem) => problem !== "warning: integração de contato pendente"), []);
console.log("Inquiry, menu, FAQ and gallery interactions: PASS");
await context.close();

const desktopSuites = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopSuitesPage = await desktopSuites.newPage();
await desktopSuitesPage.goto(baseUrl, { waitUntil: "networkidle" });
const desktopSuitesRegion = desktopSuitesPage.getByRole("region", { name: "Suítes da Casa Praiamar" });
const suitesNext = desktopSuitesRegion.getByRole("button", { name: "Próxima suíte" });
const suitesPrevious = desktopSuitesRegion.getByRole("button", { name: "Suíte anterior" });
const assertSuiteStage = async (stage) => {
  await desktopSuitesPage.waitForTimeout(700);
  assert.equal((await desktopSuitesRegion.locator('[class*="counter"]').textContent())?.trim(), `${String(stage).padStart(2, "0")} / 05`);
  const progress = await desktopSuitesRegion.locator('[class*="progress"] > span').evaluate((bar) => {
    const track = bar.parentElement;
    if (!track) throw new Error("Suite progress track was not found.");
    return bar.getBoundingClientRect().width / track.getBoundingClientRect().width;
  });
  assert.ok(Math.abs(progress - stage / 5) <= .01, `Suite progress is ${progress}, expected ${stage / 5}`);
};
for (let stage = 2; stage <= 5; stage += 1) {
  await suitesNext.click();
  await assertSuiteStage(stage);
}
assert.equal(await suitesNext.isDisabled(), true);
for (let stage = 4; stage >= 1; stage -= 1) {
  await suitesPrevious.click();
  await assertSuiteStage(stage);
}
await desktopSuitesPage.waitForFunction(() => {
  const firstSuite = document.querySelector("#suites article");
  return firstSuite ? Math.abs(firstSuite.getBoundingClientRect().left) <= 1 : false;
});
assert.equal(await suitesPrevious.isDisabled(), true);
console.log("Desktop suites controls, count, progress and edge alignment: PASS");
await desktopSuites.close();

const reduced = await browser.newContext({ viewport: { width: 390, height: 800 }, reducedMotion: "reduce" });
const reducedPage = await reduced.newPage();
await reducedPage.goto(baseUrl);
assert.equal(await reducedPage.locator("h1").isVisible(), true);
assert.equal(await reducedPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
assert.equal(await reducedPage.locator("#rodape").getAttribute("data-motion"), null);
assert.equal(await reducedPage.getByText("PRAIAMAR", { exact: true }).isVisible(), true);
await reduced.close();
const noJs = await browser.newContext({ viewport: { width: 390, height: 800 }, javaScriptEnabled: false });
const noJsPage = await noJs.newPage();
await noJsPage.goto(baseUrl);
assert.equal(await noJsPage.getByText("Há lugares que nos fazem esquecer das horas.").isVisible(), true);
assert.equal(await noJsPage.locator("details summary").first().isVisible(), true);
assert.equal(await noJsPage.getByText("PRAIAMAR", { exact: true }).isVisible(), true);
await noJs.close();
console.log("Reduced motion and no-JavaScript content: PASS");

await browser.close();
if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }
