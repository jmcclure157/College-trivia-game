import { test } from "node:test";
import assert from "node:assert/strict";

import { SCHOOLS } from "../src/schools.js";
import { Mode, buildQuestions } from "../src/quiz.js";
import {
  DARK_INK,
  WHITE,
  answeredSchool,
  contrast,
  HEADER_SHADE,
  darken,
  hexToRgb,
  luminance,
  readableInk,
  themeFor,
  themeSchool,
} from "../src/theme.js";

const byName = (name) => SCHOOLS.find((s) => s.school === name);

test("hexToRgb reads #rrggbb and rejects anything else", () => {
  assert.deepEqual(hexToRgb("#FFCD00"), [255, 205, 0]);
  assert.deepEqual(hexToRgb("#000000"), [0, 0, 0]);
  assert.throws(() => hexToRgb("#FFF"));
  assert.throws(() => hexToRgb("gold"));
});

test("luminance and contrast follow WCAG", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#FFFFFF"), 1);
  assert.equal(contrast("#000000", "#FFFFFF"), 21);
  assert.equal(contrast("#FFFFFF", "#000000"), 21);
  assert.equal(contrast("#9E1B32", "#9E1B32"), 1);
});

test("readableInk picks white on dark colors and dark ink on light ones", () => {
  assert.equal(readableInk("#000000"), WHITE); // Iowa black
  assert.equal(readableInk("#00274C"), WHITE); // Michigan blue
  assert.equal(readableInk("#9E1B32"), WHITE); // Alabama crimson
  assert.equal(readableInk("#FFCD00"), DARK_INK); // Iowa gold
  assert.equal(readableInk("#F1B82D"), DARK_INK); // Missouri gold
  assert.equal(readableInk("#FFFFFF"), DARK_INK);
});

test("every school's main color has readable text on it", () => {
  for (const s of SCHOOLS) {
    const t = themeFor(s.colors);
    assert.ok(contrast(t["--team"], t["--team-ink"]) >= 4.5, `${s.school}: text on ${t["--team"]}`);
  }
});

test("every school's header title stays readable across the whole darkening gradient", () => {
  for (const s of SCHOOLS) {
    const t = themeFor(s.colors);
    for (const bg of [t["--team"], darken(t["--team"], HEADER_SHADE)]) {
      assert.ok(contrast(bg, t["--team-title"]) >= 3, `${s.school}: title on ${bg}`);
    }
  }
});

test("Georgia's black and Clemson's purple titles fall back to plain ink: they fade on the shaded header", () => {
  assert.equal(themeFor(byName("Georgia").colors)["--team-title"], WHITE);
  assert.equal(themeFor(byName("Clemson").colors)["--team-title"], DARK_INK);
});

test("thin accents never fade into the white card, and focus rings meet 3:1", () => {
  for (const s of SCHOOLS) {
    const t = themeFor(s.colors);
    assert.ok(contrast(t["--team-accent"], WHITE) >= 1.4, `${s.school}: bar ${t["--team-accent"]}`);
    assert.ok(contrast(t["--team-ring"], WHITE) >= 3, `${s.school}: ring ${t["--team-ring"]}`);
  }
});

test("Iowa is black and gold: gold title and gold progress bar on black", () => {
  assert.deepEqual(themeFor(byName("Iowa").colors), {
    "--team": "#000000",
    "--team-ink": WHITE,
    "--team-2": "#FFCD00",
    "--team-title": "#FFCD00",
    "--team-accent": "#FFCD00",
    "--team-ring": "#000000",
  });
});

test("a white secondary falls back to the primary for thin elements", () => {
  const t = themeFor(byName("Alabama").colors); // crimson and white
  assert.equal(t["--team-title"], "#FFFFFF");
  assert.equal(t["--team-accent"], "#9E1B32");
  assert.equal(t["--team-ring"], "#9E1B32");
});

test("light colors get a darker shade for the focus ring", () => {
  const t = themeFor(byName("Tennessee").colors); // orange and white
  assert.equal(t["--team-ink"], DARK_INK);
  assert.equal(t["--team-accent"], "#FF8200");
  assert.ok(contrast(t["--team-ring"], WHITE) >= 3);
  assert.equal(t["--team-ring"], darken("#FF8200", 0.1));
});

test("forward modes theme the screen with the school being asked about", () => {
  for (const mode of [Mode.TOWN, Mode.MASCOT]) {
    for (const q of buildQuestions({ mode })) {
      assert.equal(themeSchool(q), q.schools[0], `${mode}: ${q.prompt}`);
    }
  }
});

test("modes whose answer is a school stay neutral so colors don't give it away", () => {
  for (const mode of [Mode.SCHOOL, Mode.MASCOT_SCHOOL]) {
    for (const showStates of [false, true]) {
      for (const q of buildQuestions({ mode, showStates })) {
        assert.equal(themeSchool(q), null, `${mode}: ${q.prompt}`);
      }
    }
  }
  assert.equal(themeSchool(null), null);
});

test("after answering, a one-school question shows that school; shared prompts show none", () => {
  const questions = buildQuestions({ mode: Mode.MASCOT_SCHOOL });
  const tigers = questions.find((q) => q.prompt === "Tigers");
  const ducks = questions.find((q) => q.prompt === "Ducks");
  assert.equal(answeredSchool(tigers), null);
  assert.equal(answeredSchool(ducks), byName("Oregon"));
  const la = buildQuestions({ mode: Mode.SCHOOL }).find((q) => q.prompt === "Los Angeles");
  assert.equal(answeredSchool(la), null);
  assert.equal(answeredSchool(null), null);
});
