// Game rules: builds questions, checks answers, keeps score. No page (DOM) code here.

import { SCHOOLS, STATE_NAMES } from "./schools.js";

export const Mode = Object.freeze({
  TOWN: "town", // shown a school, name its town
  SCHOOL: "school", // shown a town, name the school (reverse mode)
});

export const AnswerStyle = Object.freeze({
  CHOICE: "choice",
  TYPED: "typed",
});

export const CHOICE_COUNT = 4;

export function shuffle(items, rng = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// Lowercase and drop accents, punctuation, spaces and a leading "the" / "university of",
// so "winston salem" matches "Winston-Salem" and "The Ohio State" matches "Ohio State".
export function normalize(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^\s*(the\s+)?(university\s+of\s+)?/, "")
    .replace(/\s+/g, "");
}

export function townLabel(school) {
  return `${school.town}, ${school.state}`;
}

export function filterSchools(schools, conferences) {
  if (!conferences || conferences.length === 0) return schools.slice();
  return schools.filter((s) => conferences.indexOf(s.conference) !== -1);
}

// Town mode: one question per school. Reverse mode: one question per town, because two
// schools (UCLA and USC) share Los Angeles and either is a right answer.
export function buildQuestions({ mode = Mode.TOWN, schools = SCHOOLS, conferences = [], count = null, rng = Math.random } = {}) {
  const selected = filterSchools(schools, conferences);
  let questions;
  if (mode === Mode.SCHOOL) {
    const byTown = new Map();
    for (const s of selected) {
      const key = townLabel(s);
      if (!byTown.has(key)) byTown.set(key, []);
      byTown.get(key).push(s);
    }
    questions = Array.from(byTown, ([label, group]) => ({
      mode,
      prompt: label,
      schools: group,
      correct: group.map((s) => s.school),
    }));
  } else {
    questions = selected.map((s) => ({ mode, prompt: s.school, schools: [s], correct: [townLabel(s)] }));
  }
  questions = shuffle(questions, rng);
  return count ? questions.slice(0, count) : questions;
}

function answerLabel(mode, school) {
  return mode === Mode.SCHOOL ? school.school : townLabel(school);
}

// Wrong options come from the same conference first, then from the rest of `pool`.
export function makeChoices(question, { pool = SCHOOLS, rng = Math.random, count = CHOICE_COUNT } = {}) {
  const conferences = question.schools.map((s) => s.conference);
  const isRight = (s) => question.correct.indexOf(answerLabel(question.mode, s)) !== -1 || question.schools.indexOf(s) !== -1;
  const others = pool.filter((s) => !isRight(s));
  const near = shuffle(others.filter((s) => conferences.indexOf(s.conference) !== -1), rng);
  const far = shuffle(others.filter((s) => conferences.indexOf(s.conference) === -1), rng);

  const wrong = [];
  for (const s of near.concat(far)) {
    const label = answerLabel(question.mode, s);
    if (wrong.indexOf(label) === -1) wrong.push(label);
    if (wrong.length === count - 1) break;
  }
  const right = question.correct[Math.floor(rng() * question.correct.length)];
  return shuffle([right].concat(wrong), rng);
}

export function acceptedAnswers(question) {
  const forms = [];
  for (const s of question.schools) {
    if (question.mode === Mode.SCHOOL) {
      forms.push(s.school, ...(s.schoolAliases || []));
    } else {
      for (const town of [s.town].concat(s.townAliases || [])) {
        forms.push(town, `${town} ${s.state}`, `${town} ${STATE_NAMES[s.state]}`);
      }
    }
  }
  return forms.map(normalize);
}

export function isCorrect(question, answer) {
  const given = normalize(answer);
  return given !== "" && acceptedAnswers(question).indexOf(given) !== -1;
}

export function correctAnswerText(question) {
  return question.correct.join(" or ");
}

export class Quiz {
  constructor({ mode = Mode.TOWN, style = AnswerStyle.CHOICE, conferences = [], count = null, schools = SCHOOLS, rng = Math.random } = {}) {
    this.mode = mode;
    this.style = style;
    this.questions = buildQuestions({ mode, schools, conferences, count, rng });
    if (style === AnswerStyle.CHOICE) {
      for (const q of this.questions) q.choices = makeChoices(q, { pool: schools, rng });
    }
    this.index = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.missed = [];
    this.answered = false;
  }

  get total() {
    return this.questions.length;
  }

  get current() {
    return this.questions[this.index] || null;
  }

  get finished() {
    return this.index >= this.questions.length;
  }

  answer(input) {
    if (this.finished) throw new Error("The quiz is over.");
    if (this.answered) throw new Error("This question was already answered.");
    const question = this.current;
    const correct = isCorrect(question, input);
    this.answered = true;
    if (correct) {
      this.score++;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    } else {
      this.streak = 0;
      this.missed.push({ question, given: String(input) });
    }
    return { correct, correctAnswer: correctAnswerText(question) };
  }

  next() {
    if (!this.answered) throw new Error("Answer the question first.");
    this.index++;
    this.answered = false;
  }
}
