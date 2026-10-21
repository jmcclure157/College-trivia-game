// Page code: shows the screens and turns clicks/typing into Quiz calls.

import { CONFERENCES, SCHOOLS } from "./schools.js";
import { AnswerStyle, Mode, Quiz, correctAnswerText, streakLevel } from "./quiz.js";

const $ = (id) => document.getElementById(id);
const screens = { setup: $("setup"), game: $("game"), results: $("results") };

let quiz = null;
let settings = null;

function show(name) {
  for (const key of Object.keys(screens)) screens[key].hidden = key !== name;
}

function buildConferenceBoxes() {
  for (const conf of CONFERENCES) {
    const count = SCHOOLS.filter((s) => s.conference === conf).length;
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.name = "conference";
    box.value = conf;
    box.checked = true;
    label.append(box, ` ${conf} (${count})`);
    $("conferences").append(label);
  }
}

function readSettings(form) {
  const data = new FormData(form);
  const count = data.get("count");
  return {
    mode: data.get("mode"),
    style: data.get("style"),
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
  $("score").textContent = `Score: ${quiz.score}`;
  $("streak").textContent = `Streak: ${quiz.streak} (best ${quiz.bestStreak})`;
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

function renderQuestion() {
  if (quiz.finished) {
    renderResults();
    return;
  }
  const q = quiz.current;
  renderStats();

  $("conference").textContent = q.schools[0].conference;
  const strong = document.createElement("strong");
  strong.textContent = q.prompt;
  const prompt = $("prompt");
  prompt.textContent = "";
  if (q.mode === Mode.SCHOOL) prompt.append("Which school is in ", strong, "?");
  else prompt.append("What town is ", strong, " in?");

  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("next").hidden = true;

  const choices = $("choices");
  choices.textContent = "";
  const typed = $("typed");
  const input = $("typed-input");

  if (quiz.style === AnswerStyle.CHOICE) {
    typed.hidden = true;
    choices.hidden = false;
    for (const option of q.choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => submit(option, button));
      choices.append(button);
    }
    choices.querySelector("button").focus();
  } else {
    choices.hidden = true;
    typed.hidden = false;
    input.value = "";
    input.disabled = false;
    input.className = "";
    input.placeholder = q.mode === Mode.SCHOOL ? "School name" : "Town name";
    typed.querySelector("button").disabled = false;
    input.focus();
  }
}

function submit(answer, button) {
  if (quiz.answered) return;
  const result = quiz.answer(answer);
  const q = quiz.current;

  const feedback = $("feedback");
  feedback.className = `feedback ${result.correct ? "right" : "wrong"}`;
  if (result.close) feedback.textContent = `Close enough! It's spelled ${result.correctAnswer}.`;
  else if (result.correct) feedback.textContent = `Correct! ${result.correctAnswer}.`;
  else feedback.textContent = `Not quite. The answer is ${result.correctAnswer}.`;

  if (quiz.style === AnswerStyle.CHOICE) {
    for (const b of $("choices").querySelectorAll("button")) {
      b.disabled = true;
      if (q.correct.indexOf(b.textContent) !== -1) b.classList.add("right");
    }
    if (!result.correct && button) button.classList.add("wrong");
  } else {
    const input = $("typed-input");
    input.disabled = true;
    input.className = result.correct ? "right" : "wrong";
    $("typed").querySelector("button").disabled = true;
  }

  renderStats();
  if (result.milestone) celebrate();
  const next = $("next");
  next.textContent = quiz.index + 1 >= quiz.total ? "See results" : "Next";
  next.hidden = false;
  next.focus();
}

function renderResults() {
  show("results");
  const pct = quiz.total ? Math.round((quiz.score / quiz.total) * 100) : 0;
  $("final-score").textContent = `You got ${quiz.score} of ${quiz.total} right (${pct}%).`;
  const best = streakLevel(quiz.bestStreak);
  $("final-streak").textContent = `Best streak: ${quiz.bestStreak}${best ? ` (${best.label})` : ""}`;

  const list = $("missed");
  list.textContent = "";
  $("missed-title").textContent = quiz.missed.length ? `Missed (${quiz.missed.length})` : "Perfect game: no misses!";
  for (const { question, given } of quiz.missed) {
    const item = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = question.prompt;
    const yours = document.createElement("span");
    yours.className = "given";
    yours.textContent = ` (you said: ${given})`;
    item.append(strong, ` → ${correctAnswerText(question)}`, yours);
    list.append(item);
  }
  $("again").focus();
}

buildConferenceBoxes();

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

$("next").addEventListener("click", () => {
  quiz.next();
  renderQuestion();
});

$("again").addEventListener("click", start);
$("settings").addEventListener("click", () => show("setup"));
