import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(import.meta.dirname, "../docs/screenshots");
const baseUrl = process.env.BASE_URL ?? process.argv[2] ?? "http://localhost:3000";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const widths = [360, 375, 390, 430, 768, 1024, 1440, 1920];
const problems = [];
const introDone = (page) => page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, { timeout: 4500 });
/** Scroll through the whole page like a reader so every one-shot reveal fires. */
const sweep = async (page) => {
  const { total, step } = await page.evaluate(() => ({ total: document.documentElement.scrollHeight, step: Math.round(window.innerHeight * 0.6) }));
  for (let y = 0; y <= total; y += step) { await page.evaluate((top) => window.scrollTo(0, top), y); await page.waitForTimeout(110); }
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
};

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 800 : 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleProblems = [];
  page.on("console", (msg) => { if (["error", "warning"].includes(msg.type())) consoleProblems.push(`${msg.type()}: ${msg.text()}`); });
  page.on("pageerror", (error) => consoleProblems.push(`pageerror: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await introDone(page);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    imgs.forEach((img) => { img.loading = "eager"; });
    await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
  });
  const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
  if (size.scroll > size.inner) problems.push(`${width}px overflow ${size.scroll - size.inner}px`);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator("#reservas").count(), 0, "Booking bar must stay removed");
  assert.equal(await page.locator('input[type="date"]').count(), 0);
  assert.equal(await page.getByText("Consultar", { exact: true }).count(), 0, "Mobile sticky CTA must stay removed");
  assert.equal(await page.locator("header [data-reserve]").first().getAttribute("href"), "#informacoes");
  const headerNavigationStyles = await page.locator('header nav[aria-label="Navegação principal"] a').first().evaluate((link) => {
    const style = getComputedStyle(link);
    return { fontWeight: style.fontWeight, textTransform: style.textTransform };
  });
  assert.deepEqual(headerNavigationStyles, { fontWeight: "300", textTransform: "uppercase" });
  const headerLogo = page.locator('header a[aria-label="Casa Praiamar — voltar ao início"] img');
  assert.equal(await headerLogo.getAttribute("alt"), "");
  assert.match(await headerLogo.getAttribute("src") ?? "", /\/brand\/praiamar-transparent\.webp$/);
  const transparentLogoSize = await headerLogo.evaluate((image) => {
    const rect = image.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  assert.ok(transparentLogoSize.width > 0 && transparentLogoSize.height > 0, "Transparent header logo must render");
  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForFunction(() => document.querySelector('header img')?.getAttribute("src")?.endsWith("/brand/praiamar-solid.webp") ?? false);
  assert.match(await headerLogo.getAttribute("src") ?? "", /\/brand\/praiamar-solid\.webp$/);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector('header img')?.getAttribute("src")?.endsWith("/brand/praiamar-transparent.webp") ?? false);
  if (width <= 1100) {
    const mobileNavigationStyles = await page.locator('header nav[aria-label="Navegação mobile"] a').first().evaluate((link) => {
      const style = getComputedStyle(link);
      return { fontWeight: style.fontWeight, textTransform: style.textTransform };
    });
    assert.deepEqual(mobileNavigationStyles, { fontWeight: "300", textTransform: "uppercase" });
  }
  assert.equal(await page.locator("#suites").count(), 1);
  assert.equal(await page.locator("#suites img:not(dialog img)").count(), 5);
  assert.equal(await page.locator("#suites h2").textContent(), "Nossas suítes");
  assert.equal(await page.locator('#suites [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("O prazer de descansar", { exact: false }).count(), 0);
  assert.equal(await page.getByText("O conforto de estar longe", { exact: false }).count(), 0);
  assert.equal(await page.locator('#suites button[aria-haspopup="dialog"]').count(), 1);
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
  await page.locator("#suites [data-reveal='slide']").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector("#suites [data-reveal='slide']")?.dataset.visible === "true");
  await page.waitForTimeout(1300);
  const firstSuiteLeft = await page.locator("#suites article").first().evaluate((element) => element.getBoundingClientRect().left);
  await page.evaluate(() => window.scrollTo(0, 0));
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
    const environmentLayout = await page.evaluate(() => {
      const section = document.querySelector("#ambientes");
      const title = section?.querySelector("h2");
      const images = Array.from(section?.querySelectorAll("[data-environment-item] > div:first-child") ?? []);
      if (!title || images.length !== 3) throw new Error("Environment layout elements were not found.");
      const titleRect = title.getBoundingClientRect();
      return {
        titleCenter: titleRect.left + titleRect.width / 2,
        viewportCenter: (() => { const r = section.getBoundingClientRect(); return r.left + r.width / 2; })(),
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
  assert.equal(await page.locator("#experiencias img:not(dialog img)").count(), 1);
  assert.equal(await page.locator("#experiencias h2").textContent(), "Experiências para viver sem pressa.");
  assert.equal(await page.locator('#experiencias button[aria-haspopup="dialog"]').textContent(), "Conheça nossas experiências");
  assert.equal(await page.getByText("A ARTE DE VIVER SEM PRESSA", { exact: true }).count(), 0);
  assert.equal(await page.locator('#localizacao [class*="eyebrow"]').count(), 0);
  assert.equal(await page.getByText("ARPOEIRAS, CEARÁ", { exact: true }).count(), 0);
  const locationMeta = await page.locator("#localizacao [data-location-meta]").evaluate((element) => {
    const style = getComputedStyle(element);
    const place = element.querySelector("p")?.getBoundingClientRect();
    const action = element.querySelector("a")?.getBoundingClientRect();
    if (!place || !action) throw new Error("Location metadata content was not found.");
    return {
      borderTopWidth: getComputedStyle(element, "::after").height,
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
  assert.ok(footerLayout.footerPaddingTop <= (width > 900 ? 44 : 56), "Footer information must stay visually connected to the image transition");
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
      if (!h1 || !h2 || !overline || !paragraph) {
        throw new Error("Typography sample elements were not found.");
      }
      return {
        h1: read(h1),
        h2: read(h2),
        overline: read(overline),
        paragraph: read(paragraph),
      };
    });
    const mobile = width === 390;
    assert.match(typography.h1.family, /^newsreader300/i);
    // Fluid scale (docs/REGRAS-TIPOGRAFIA.md §2): reference values at 390px and 1440px.
    const near = (value, expected, label) => assert.ok(Math.abs(parseFloat(value) - expected) <= 0.5, `${label} is ${value}, expected ~${expected}px`);
    near(typography.h1.size, mobile ? 48 : 96, "h1");
    assert.equal(typography.h1.weight, "300");
    assert.match(typography.h2.family, /^newsreader300/i);
    near(typography.h2.size, mobile ? 36 : 50, "h2");
    assert.equal(typography.h2.weight, "300");
    assert.match(typography.paragraph.family, /^urbanist300/i);
    near(typography.paragraph.size, mobile ? 17 : 19, "body");
    assert.equal(typography.paragraph.weight, "300");
    assert.match(typography.overline.family, /^urbanist400/i);
    near(typography.overline.size, mobile ? 12 : 13, "overline");
    assert.equal(typography.overline.weight, "400");

    const boxedActions = await page.evaluate(() => {
      const selectors = [
        '#topo a[href="#a-casa"]',
        'header a[data-reserve]',
        '#a-casa a[href="#ambientes"]',
        '#suites button[aria-haspopup="dialog"]',
        '#ambientes button',
        '#experiencias button[aria-haspopup="dialog"]',
        '#localizacao a',
        '#informacoes a[data-reserve]',
        'main section:last-of-type a[data-reserve]',
        '#rodape a[data-reserve][class]',
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
  await sweep(page);
  assert.equal(await page.locator("[data-reveal]:not([data-visible])").count(), 0, `${width}px every reveal must fire after reading the page`);
  await page.screenshot({ path: resolve(output, `${width}.png`), fullPage: true, animations: "disabled" });
  if (width === 390 || width === 1440) await page.screenshot({ path: resolve(output, `${width}-hero.png`), animations: "disabled" });
  if (consoleProblems.length) problems.push(`${width}px console: ${consoleProblems.join(" | ")}`);
  console.log(`${width}px: screenshot, overflow=${size.scroll - size.inner}, console=${consoleProblems.length}${consoleProblems.length ? ` (${consoleProblems.join(" | ")})` : ""}`);
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 390, height: 800 } });
const page = await context.newPage();
const interactiveProblems = [];
page.on("console", (msg) => { if (["error", "warning"].includes(msg.type())) interactiveProblems.push(`${msg.type()}: ${msg.text()}`); });
page.on("pageerror", (error) => interactiveProblems.push(`pageerror: ${error.message}`));
await page.goto(baseUrl, { waitUntil: "networkidle" });
await introDone(page);
const reserveLinks = await page.locator("[data-reserve]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
assert.ok(reserveLinks.length >= 5, "Header, menu, FAQ, final CTA and footer must share the reservation link");
assert.ok(reserveLinks.every((href) => href === "#informacoes"), "Without a WhatsApp number every reservation link must lead to the FAQ");
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
assert.match(await page.locator("dialog[open]").textContent(), /2 \/ 6/);
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog", { name: "Galeria de ambientes" }).isVisible(), false);
assert.equal(await page.locator(":focus").textContent(), "Conheça todos os ambientes");
for (const [trigger, dialogName, total] of [["Conheça nossas suítes", "Galeria de suítes", 5], ["Conheça nossas experiências", "Galeria de ambientes", 6]]) {
  await page.getByRole("button", { name: trigger }).click();
  const dialog = page.getByRole("dialog", { name: dialogName });
  assert.equal(await dialog.isVisible(), true);
  assert.match(await dialog.textContent(), new RegExp(`1 / ${total}`));
  await page.keyboard.press("ArrowLeft");
  assert.match(await dialog.textContent(), new RegExp(`${total} / ${total}`));
  await page.keyboard.press("Escape");
  assert.equal(await dialog.isVisible(), false);
  assert.equal(await page.locator(":focus").textContent(), trigger);
}
assert.deepEqual(interactiveProblems, []);
console.log("Reservation links, menu, FAQ and gallery interactions: PASS");
await context.close();

const desktopSuites = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopSuitesPage = await desktopSuites.newPage();
await desktopSuitesPage.goto(baseUrl, { waitUntil: "networkidle" });
await introDone(desktopSuitesPage);
const desktopSuitesRegion = desktopSuitesPage.getByRole("region", { name: "Suítes da Casa Praiamar" });
const suitesNext = desktopSuitesRegion.getByRole("button", { name: "Próxima suíte" });
const suitesPrevious = desktopSuitesRegion.getByRole("button", { name: "Suíte anterior" });
// Stops are the distinct positions the arrows can reach (wide screens show the last photos together).
await desktopSuitesRegion.scrollIntoViewIfNeeded();
await desktopSuitesPage.waitForTimeout(1300);
const suiteStops = Number((await desktopSuitesRegion.locator('[class*="counter"]').textContent())?.trim().split("/")[1]);
assert.ok(suiteStops >= 3 && suiteStops <= 5, `Desktop suites expose ${suiteStops} stops`);
const assertSuiteStage = async (stage) => {
  await desktopSuitesPage.waitForTimeout(800);
  assert.equal((await desktopSuitesRegion.locator('[class*="counter"]').textContent())?.trim(), `${String(stage).padStart(2, "0")} / ${String(suiteStops).padStart(2, "0")}`);
  const progress = await desktopSuitesRegion.locator('[class*="progress"] > span').evaluate((bar) => {
    const track = bar.parentElement;
    if (!track) throw new Error("Suite progress track was not found.");
    return bar.getBoundingClientRect().width / track.getBoundingClientRect().width;
  });
  assert.ok(Math.abs(progress - stage / suiteStops) <= .01, `Suite progress is ${progress}, expected ${stage / suiteStops}`);
};
const trackLeft = () => desktopSuitesRegion.locator("[data-reveal='slide']").evaluate((track) => track.scrollLeft);
let previousLeft = await trackLeft();
for (let stage = 2; stage <= suiteStops; stage += 1) {
  await suitesNext.click();
  await assertSuiteStage(stage);
  const left = await trackLeft();
  assert.ok(left - previousLeft > 40, `Stop ${stage} must visibly advance the photos (moved ${left - previousLeft}px)`);
  previousLeft = left;
}
assert.equal(await suitesNext.isDisabled(), true);
for (let stage = suiteStops - 1; stage >= 1; stage -= 1) {
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
const reducedStart = Date.now();
await reducedPage.goto(baseUrl);
await introDone(reducedPage);
assert.ok(Date.now() - reducedStart < 2500, "Reduced motion: the opening must be brief");
await sweep(reducedPage);
assert.equal(await reducedPage.locator("[data-reveal]:not([data-visible])").count(), 0);
assert.equal(await reducedPage.evaluate(() => [...document.querySelectorAll("[data-reveal], [data-reveal] > *")].filter((e) => getComputedStyle(e).transform !== "none").length), 0, "Reduced motion: reveals must not move anything");
assert.equal(await reducedPage.locator("h1").isVisible(), true);
assert.equal(await reducedPage.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
assert.equal(await reducedPage.locator("#rodape").getAttribute("data-motion"), null);
assert.equal(await reducedPage.getByText("PRAIAMAR", { exact: true }).isVisible(), true);
await reduced.close();
const noJs = await browser.newContext({ viewport: { width: 390, height: 800 }, javaScriptEnabled: false });
const noJsPage = await noJs.newPage();
await noJsPage.goto(baseUrl);
assert.equal(await noJsPage.locator("[data-loader]").isVisible(), false, "Without JavaScript the opening must not appear");
assert.equal(await noJsPage.locator("#a-casa h2").isVisible(), true);
assert.equal(await noJsPage.getByText("Há lugares que nos fazem esquecer das horas.").isVisible(), true);
assert.equal(await noJsPage.locator("details summary").first().isVisible(), true);
assert.equal(await noJsPage.getByText("PRAIAMAR", { exact: true }).isVisible(), true);
await noJs.close();
console.log("Reduced motion and no-JavaScript content: PASS");

// Opening (loader), reveals and header behaviour
const motion = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const motionPage = await motion.newPage();
const motionErrors = [];
motionPage.on("pageerror", (error) => motionErrors.push(error.message));
let start = Date.now();
await motionPage.goto(baseUrl);
await motionPage.locator("[data-loader]").waitFor({ state: "visible", timeout: 1500 });
await introDone(motionPage);
const openingMs = Date.now() - start;
assert.ok(openingMs <= 3800, `Opening took ${openingMs}ms, expected at most 3800ms`);
assert.equal(await motionPage.locator("[data-loader]").count(), 0, "Loader must unmount after the opening");
assert.equal(await motionPage.locator("#ambientes [data-reveal='image'][data-visible]").count(), 0, "Below-the-fold reveals wait for the reader");
await motionPage.locator("#ambientes [data-reveal='image']").first().scrollIntoViewIfNeeded();
await motionPage.waitForTimeout(1200);
assert.equal(await motionPage.locator("#ambientes [data-reveal='image']").first().getAttribute("data-visible"), "true");
await motionPage.evaluate(() => window.scrollTo(0, 0)); await motionPage.waitForTimeout(300);
await motionPage.locator("#ambientes").scrollIntoViewIfNeeded(); await motionPage.waitForTimeout(300);
assert.equal(await motionPage.locator("#ambientes [data-reveal='image']").first().getAttribute("data-visible"), "true", "Reveals never replay");
// suite arrows scroll only the track: the page must not move even when the section is partly off screen
await motionPage.evaluate(() => { const section = document.querySelector("#suites"); window.scrollTo({ top: section.getBoundingClientRect().top + scrollY + 330, behavior: "instant" }); }); // photos partly above the fold (where scrollIntoView used to jump)
await motionPage.waitForTimeout(1400);
const beforeArrows = await motionPage.evaluate(() => Math.round(scrollY));
for (let i = 0; i < 3; i++) { await motionPage.evaluate(() => document.querySelector("#suites button[aria-label='Próxima suíte']").click()); await motionPage.waitForTimeout(700); }
assert.equal(await motionPage.evaluate(() => Math.round(scrollY)), beforeArrows, "Suite arrows must not scroll the page vertically");
// FAQ answers open without a late jump (spacing lives inside the animated box)
await motionPage.locator("#informacoes").scrollIntoViewIfNeeded(); await motionPage.waitForTimeout(800);
const faqGrowth = await motionPage.evaluate(async () => {
  const d = document.querySelector("#informacoes details"); const heights = []; d.querySelector("summary").click();
  const t0 = performance.now();
  await new Promise((done) => { const tick = () => { heights.push(d.getBoundingClientRect().height); if (performance.now() - t0 < 700) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
  d.querySelector("summary").click();
  return heights.slice(Math.floor(heights.length * 0.6)).map((h, i, all) => i ? h - all[i - 1] : 0);
});
assert.ok(Math.max(...faqGrowth) <= 2, "FAQ answer must not jump at the end of its opening");
// header hides while reading down, returns on scroll up and on keyboard focus
await motionPage.evaluate(() => window.scrollTo(0, 3000)); await motionPage.waitForTimeout(200);
await motionPage.evaluate(() => window.scrollTo(0, 3400)); await motionPage.waitForTimeout(300);
assert.equal(await motionPage.locator("header").getAttribute("data-hidden"), "true", "Header hides while scrolling down");
await motionPage.evaluate(() => window.scrollTo(0, 3150)); await motionPage.waitForTimeout(300);
assert.equal(await motionPage.locator("header").getAttribute("data-hidden"), null, "Header returns on scroll up");
await motionPage.evaluate(() => window.scrollTo(0, 3600)); await motionPage.waitForTimeout(300);
await motionPage.locator("header a").first().focus(); await motionPage.waitForTimeout(100);
assert.equal(await motionPage.locator("header").getAttribute("data-hidden"), null, "Header returns when focused from the keyboard");
// back/forward navigation skips the opening
await motionPage.goto(`${baseUrl}/pagina-inexistente`);
start = Date.now();
await motionPage.goBack();
await introDone(motionPage);
assert.ok(Date.now() - start < 1500, "Back navigation must not replay the opening");
assert.deepEqual(motionErrors, []);
await motion.close();
// Slow or failed hero image: the opening still leaves at its cap
const blocked = await browser.newContext({ viewport: { width: 390, height: 844 } });
const blockedPage = await blocked.newPage();
await blockedPage.route("**/media/hero-villa-*", (route) => route.abort());
start = Date.now();
await blockedPage.goto(baseUrl);
await introDone(blockedPage);
assert.ok(Date.now() - start <= 3800, "Opening must leave at its cap when the hero photo fails");
await blocked.close();
// Deep link to a section: opening runs, then the visitor lands on that section
const deep = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const deepPage = await deep.newPage();
await deepPage.goto(`${baseUrl}/#informacoes`);
await introDone(deepPage);
await deepPage.waitForTimeout(1500);
const faqTop = await deepPage.locator("#informacoes").evaluate((section) => section.getBoundingClientRect().top);
assert.ok(Math.abs(faqTop) <= 120, `Deep link should land on the FAQ (top=${faqTop})`);
assert.equal(await deepPage.locator("#informacoes h2").getAttribute("data-visible"), "true");
await deep.close();
console.log("Opening, reveals, header and deep links: PASS");

await browser.close();
if (problems.length) { console.error(problems.join("\n")); process.exitCode = 1; }
