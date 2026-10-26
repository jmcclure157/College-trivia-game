// Page code: shows the screens and turns clicks/typing into Quiz calls.

import { CONFERENCES, POWER_4, SCHOOLS } from "./schools.js";
import { Mode, Quiz, correctAnswerText, streakLevel } from "./quiz.js";
import { answeredSchool, themeFor, themeSchool } from "./theme.js";

const $ = (id) => document.getElementById(id);
const screens = { setup: $("setup"), game: $("game"), results: $("results") };

let quiz = null;
let settings = null;

function show(name) {
  for (const key of Object.keys(screens)) screens[key].hidden = key !== name;
  if (name !== "game") applyTheme(null);
}

// Paints the page in a school's colors, or back to the default navy and gold for null.
function applyTheme(school) {
  const root = document.documentElement.style;
  const vars = school ? themeFor(school.colors) : themeFor(["#000000", "#FFFFFF"]);
  for (const [name, value] of Object.entries(vars)) {
    if (school) root.setProperty(name, value);
    else root.removeProperty(name);
  }
  document.documentElement.toggleAttribute("data-themed", Boolean(school));
}

function buildConferencePills() {
  for (const conf of CONFERENCES) {
    const count = SCHOOLS.filter((s) => s.conference === conf).length;
    const label = document.createElement("label");
    label.className = "pill";
    label.dataset.conf = conf;
    if (!POWER_4.includes(conf)) label.dataset.extra = "";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.name = "conference";
    box.value = conf;
    box.checked = true;
    const text = document.createElement("span");
    const num = document.createElement("small");
    num.textContent = count;
    text.append(conf, " ", num);
    label.append(box, text);
    $("conferences").append(label);
  }
}

// "Power 4" hides the other FBS conferences; disabled boxes are left out of the form data.
function syncDivision() {
  const all = $("setup-form").elements.division.value === "all";
  for (const label of $("conferences").querySelectorAll("[data-extra]")) {
    label.hidden = !all;
    label.querySelector("input").disabled = !all;
  }
}

function readSettings(form) {
  const data = new FormData(form);
  const count = data.get("count");
  return {
    mode: data.get("mode"),
    conferences: data.getAll("conference"),
    count: count === "all" ? null : Number(count),
    forgiveTypos: data.get("forgiveTypos") === "on",
    showStates: data.get("showStates") === "on",
  };
}

function start() {
  quiz = new Quiz(settings);
  show("game");
  renderQuestion();
}

function renderStats() {
  const shown = Math.min(quiz.index + 1, quiz.total);
  $("progress").textContent = `Question ${shown} of ${quiz.total}`;
  const done = quiz.index + (quiz.answered ? 1 : 0);
  $("bar-fill").style.width = `${quiz.total ? (done / quiz.total) * 100 : 0}%`;
  $("score").textContent = quiz.score;
  $("streak").textContent = quiz.streak;
  $("best").textContent = quiz.bestStreak;
  renderHeat();
}

function renderHeat() {
  const heat = $("heat");
  const card = screens.game;
  const level = streakLevel(quiz.streak);
  card.classList.remove("heat-1", "heat-2", "heat-3");
  if (!level) {
    heat.hidden = true;
    return;
  }
  card.classList.add(`heat-${level.level}`);
  heat.hidden = false;
  heat.querySelector(".flames").innerHTML = flames(level.level);
  heat.querySelector(".heat-label").textContent = `${level.label} ${quiz.streak} in a row`;
}

// Drawn as a small picture instead of an emoji so it looks the same on every computer.
const FLAME_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.5c.8 3.6-2.6 5.6-2.6 9.1 0 1.6 1.2 2.9 2.6 2.9s2.6-1.2 2.6-2.8c0-1.3-.6-2.3-.9-3.3 2.9 1.6 5.3 4.6 5.3 8.1A7 7 0 0 1 12 22.5a7 7 0 0 1-7-7c0-6.4 7.5-8.2 7-14z"/></svg>';

function flames(count) {
  return FLAME_SVG.repeat(count);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// A short burst of rising embers, plus a "pop" on the streak badge.
function celebrate() {
  const heat = $("heat");
  heat.classList.remove("pop");
  void heat.offsetWidth; // restart the animation
  heat.classList.add("pop");
  if (reduceMotion.matches) return;
  const embers = $("embers");
  const count = 6 + 3 * streakLevel(quiz.streak).level;
  for (let i = 0; i < count; i++) {
    const ember = document.createElement("span");
    if (i % 3 === 0) ember.innerHTML = FLAME_SVG;
    else ember.className = "spark";
    ember.style.left = `${5 + Math.random() * 90}%`;
    ember.style.animationDelay = `${Math.random() * 0.3}s`;
    ember.style.setProperty("--size", `${0.6 + Math.random() * 1.2}rem`);
    ember.addEventListener("animationend", () => ember.remove());
    embers.append(ember);
  }
}

const ASK = {
  [Mode.TOWN]: "Which town is home to",
  [Mode.SCHOOL]: "Which school calls this town home?",
  [Mode.MASCOT]: "What is the mascot of",
  [Mode.MASCOT_SCHOOL]: "Which school is known as the",
};

const PLACEHOLDER = { [Mode.TOWN]: "Type the town", [Mode.MASCOT]: "Type the mascot" };

const ICONS = {
  right: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6 11-11-1.4-1.4z"/></svg>',
  wrong: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z"/></svg>',
};

function renderQuestion() {
  if (quiz.finished) {
    renderResults();
    return;
  }
  const q = quiz.current;
  applyTheme(themeSchool(q));
  renderStats();

  const confs = [...new Set(q.schools.map((s) => s.conference))];
  const tag = $("conference");
  tag.textContent = confs.join(" / ");
  tag.dataset.conf = confs.length === 1 ? confs[0] : "";
  $("ask").textContent = ASK[q.mode];
  $("prompt").textContent = q.mode === Mode.SCHOOL ? q.prompt : `${q.prompt}?`;

  $("feedback").hidden = true;
  $("announce").textContent = "";

  const input = $("typed-input");
  input.value = "";
  input.placeholder = PLACEHOLDER[q.mode] || "Type the school";
  input.focus();
}

function showFeedback(feedback, q, answer, result) {
  const kind = result.correct ? "right" : "wrong";
  let title;
  let detail;
  if (result.close) {
    const others = q.schools.length > 1 ? ` (${q.schools.map((s) => s.school).join(", ")} all count.)` : "";
    title = "Close enough!";
    detail = `${q.prompt}: it's spelled ${result.spelling}.${others}`;
  } else if (result.correct) {
    title = "Correct!";
    detail = `${q.prompt}: ${result.correctAnswer}.`;
  } else {
    title = "Not quite.";
    detail = `${q.prompt}: ${result.correctAnswer}. You said "${answer}".`;
  }
  feedback.className = "feedback";
  void feedback.offsetWidth; // restart the slide-in animation
  feedback.className = `feedback ${kind}`;
  const school = answeredSchool(q);
  if (school) feedback.style.setProperty("--fb-team", school.colors[0]);
  else feedback.style.removeProperty("--fb-team");
  feedback.querySelector(".fb-icon").innerHTML = ICONS[kind];
  feedback.querySelector(".fb-title").textContent = title;
  feedback.querySelector(".fb-detail").textContent = detail;
  feedback.hidden = false;
  return `${title} ${detail}`;
}

// One Enter both answers and moves on; the result stays on screen above the next question.
function submit(answer) {
  if (quiz.answered) return;
  const q = quiz.current;
  const result = quiz.answer(answer);
  quiz.next();
  renderQuestion();
  if (quiz.finished) {
    const said = showFeedback($("final-feedback"), q, answer, result);
    $("announce").textContent = `${said} Round over. ${$("final-score").textContent}`;
    return;
  }
  const said = showFeedback($("feedback"), q, answer, result);
  $("announce").textContent = `${said} Next: ${$("ask").textContent} ${$("prompt").textContent}`;
  if (result.milestone) celebrate();
}

function rankFor(pct) {
  if (pct === 100) return "Perfect game!";
  if (pct >= 90) return "Hall of Famer";
  if (pct >= 70) return "All-American";
  if (pct >= 50) return "Solid starter";
  return "Back to practice";
}

function renderResults() {
  show("results");
  const pct = quiz.total ? Math.round((quiz.score / quiz.total) * 100) : 0;
  $("ring").style.setProperty("--pct", pct);
  $("pct").textContent = `${pct}%`;
  $("rank").textContent = rankFor(pct);
  $("final-score").textContent = `You got ${quiz.score} of ${quiz.total} right.`;
  const best = streakLevel(quiz.bestStreak);
  $("final-streak").textContent = `Best streak: ${quiz.bestStreak}${best ? ` (${best.label})` : ""}`;

  const list = $("missed");
  list.textContent = "";
  $("missed-title").textContent = quiz.missed.length ? `Missed (${quiz.missed.length})` : "No misses. Nice work!";
  for (const { question, given } of quiz.missed) {
    const item = document.createElement("li");
    const prompt = document.createElement("strong");
    prompt.textContent = question.prompt;
    const answer = document.createElement("span");
    answer.className = "answer";
    answer.textContent = correctAnswerText(question);
    const yours = document.createElement("span");
    yours.className = "given";
    yours.textContent = `You said: ${given}`;
    item.append(prompt, answer, yours);
    list.append(item);
  }
  window.scrollTo(0, 0);
  $("again").focus({ preventScroll: true });
}

buildConferencePills();
$("count-power4").textContent = SCHOOLS.filter((s) => POWER_4.includes(s.conference)).length;
$("count-all").textContent = SCHOOLS.length;
for (const radio of $("setup-form").elements.division) radio.addEventListener("change", syncDivision);
syncDivision();

$("setup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const chosen = readSettings(event.target);
  if (chosen.conferences.length === 0) {
    $("setup-error").textContent = "Pick at least one conference.";
    return;
  }
  $("setup-error").textContent = "";
  settings = chosen;
  start();
});

$("typed").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = $("typed-input").value;
  if (value.trim() === "") return;
  submit(value);
});

$("again").addEventListener("click", start);
$("settings").addEventListener("click", () => show("setup"));
$("quit").addEventListener("click", () => show("setup"));
