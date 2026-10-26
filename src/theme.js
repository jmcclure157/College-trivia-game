// Team colors: picks which school's colors fit a question and works out readable text colors.
// No page (DOM) code here, so it can be tested in Node.

import { answersAreSchools } from "./quiz.js";

export const WHITE = "#FFFFFF";
export const DARK_INK = "#111111";

export function hexToRgb(hex) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Not a #rrggbb color: ${hex}`);
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(rgb) {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

// WCAG relative luminance: 0 for black, 1 for white.
export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG contrast ratio, from 1 (same color) to 21 (black on white).
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// White or near-black text, whichever is easier to read on `background`.
export function readableInk(background) {
  return contrast(background, WHITE) >= contrast(background, DARK_INK) ? WHITE : DARK_INK;
}

export function darken(hex, amount) {
  return rgbToHex(hexToRgb(hex).map((c) => c * (1 - amount)));
}

// The darker of the two colors, darkened further until it stands out on a white card by `minRatio`.
function visibleOnWhite(colors, minRatio) {
  let best = colors.reduce((a, b) => (contrast(b, WHITE) > contrast(a, WHITE) ? b : a));
  for (let step = 0.1; contrast(best, WHITE) < minRatio; step += 0.1) best = darken(colors[0], step);
  return best;
}

// Thin elements on the white card (like the progress bar) need a color that doesn't fade into it.
const BAR_MIN_CONTRAST = 1.4;
// Focus rings and input borders follow the WCAG 3:1 rule for outlines.
const RING_MIN_CONTRAST = 3;
// Header title in the secondary color only when it reads clearly on the primary.
const TITLE_MIN_CONTRAST = 3;
// The header's gradient darkens the primary by up to this much (keep in sync with `.hero` in style.css).
export const HEADER_SHADE = 0.18;

// Lowest contrast of `color` anywhere on the header, from the plain primary to its darkest shade.
function headerContrast(color, primary) {
  return Math.min(contrast(color, primary), contrast(color, darken(primary, HEADER_SHADE)));
}

// White or near-black, whichever stays easiest to read across the whole header (for the big title).
function headerInk(primary) {
  return headerContrast(WHITE, primary) >= headerContrast(DARK_INK, primary) ? WHITE : DARK_INK;
}

// CSS custom property values for a school's [primary, secondary] colors.
export function themeFor([primary, secondary]) {
  return {
    "--team": primary,
    "--team-ink": readableInk(primary),
    "--team-2": secondary,
    "--team-title": headerContrast(secondary, primary) >= TITLE_MIN_CONTRAST ? secondary : headerInk(primary),
    "--team-accent":
      contrast(secondary, WHITE) >= BAR_MIN_CONTRAST ? secondary : visibleOnWhite([primary, secondary], BAR_MIN_CONTRAST),
    "--team-ring": visibleOnWhite([primary, secondary], RING_MIN_CONTRAST),
  };
}

// The school whose colors may theme the screen while `question` is open, or null for the neutral
// theme. Modes whose answer is a school stay neutral: the colors would give the answer away. A
// prompt shared by several schools (Los Angeles, Tigers) has no single school to color it.
export function themeSchool(question) {
  if (!question || answersAreSchools(question.mode)) return null;
  return answeredSchool(question);
}

// After a question is answered its school is no secret, in any mode.
export function answeredSchool(question) {
  if (!question || question.schools.length !== 1) return null;
  return question.schools[0];
}
