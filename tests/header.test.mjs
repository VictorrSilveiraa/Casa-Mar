import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("desktop reservation CTA has no decorative arrow", async () => {
  const header = await readFile(new URL("../components/Header.tsx", import.meta.url), "utf8");

  assert.match(
    header,
    /<a className=\{styles\.reserve\} href="#reservas" data-focus-booking>Reservar<\/a>/
  );
});
