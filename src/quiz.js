// Game rules: builds questions, checks answers, keeps score. No page (DOM) code here.

import { SCHOOLS, STATE_NAMES } from "./schools.js";

export const Mode = Object.freeze({
  TOWN: "town", // shown a school, name its town
  SCHOOL: "school", // shown a town, name the school (reverse mode)
  MASCOT: "mascot", // shown a school, name its mascot
  MASCOT_SCHOOL: "mascot-school", // shown a mascot, name the school
});

// Modes whose answer is a school name. Several schools can share a prompt (a town or a mascot).
export function answersAreSchools(mode) {
  return mode === Mode.SCHOOL || mode === Mode.MASCOT_SCHOOL;
}

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

// What a town looks like on screen. States are hidden by default because they give the answer away.
export function townText(school, showStates = false) {
  return showStates ? townLabel(school) : school.town;
}

function promptText(mode, school, showStates) {
  if (mode === Mode.SCHOOL) return townText(school, showStates);
  if (mode === Mode.MASCOT_SCHOOL) return school.mascot;
  return school.school;
}

// Modes that ask for a town or mascot: one question per school. Modes that ask for a school: one
// question per prompt, because some schools share one (UCLA and USC in Los Angeles; Missouri and
// South Carolina in Columbia when states are hidden; four Tigers) and any of them is a right answer.
export function buildQuestions({
  mode = Mode.TOWN,
  schools = SCHOOLS,
  conferences = [],
  count = null,
  showStates = false,
  rng = Math.random,
} = {}) {
  const selected = filterSchools(schools, conferences);
  let questions;
  if (answersAreSchools(mode)) {
    const byPrompt = new Map();
    for (const s of selected) {
      const label = promptText(mode, s, showStates);
      const key = normalize(label); // "Wolf Pack" (Nevada) and "Wolfpack" (NC State) are the same answer
      if (!byPrompt.has(key)) byPrompt.set(key, { label, group: [] });
      byPrompt.get(key).group.push(s);
    }
    questions = Array.from(byPrompt.values(), ({ label, group }) => ({
      mode,
      prompt: label,
      schools: group,
      correct: group.map((s) => s.school),
    }));
  } else {
    questions = selected.map((s) => ({
      mode,
      prompt: promptText(mode, s, showStates),
      schools: [s],
      correct: [answerLabel(mode, s, showStates)],
    }));
  }
  questions = shuffle(questions, rng);
  return count ? questions.slice(0, count) : questions;
}

function answerLabel(mode, school, showStates) {
  if (answersAreSchools(mode)) return school.school;
  if (mode === Mode.MASCOT) return school.mascot;
  return townText(school, showStates);
}

function answerForms(mode, school, { withStates = true } = {}) {
  if (answersAreSchools(mode)) return [school.school].concat(school.schoolAliases || []);
  if (mode === Mode.MASCOT) {
    return [school.mascot, `${school.school} ${school.mascot}`].concat(school.mascotAliases || []);
  }
  const forms = [];
  for (const town of [school.town].concat(school.townAliases || [])) {
    forms.push(town);
    if (withStates) forms.push(`${town} ${school.state}`, `${town} ${STATE_NAMES[school.state]}`);
  }
  return forms;
}

const STATE_WORDS = new Map();
for (const [code, name] of Object.entries(STATE_NAMES)) {
  STATE_WORDS.set(code.toLowerCase(), code);
  STATE_WORDS.set(name.toLowerCase(), code);
}

// Splits a typed town answer like "Winston Salem, NC" into its town ("winstonsalem") and state ("NC").
export function splitState(answer) {
  const words = String(answer)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ");
  for (const size of [2, 1]) {
    if (words.length <= size) continue;
    const state = STATE_WORDS.get(words.slice(-size).join(" "));
    if (state) return { town: normalize(words.slice(0, -size).join(" ")), state };
  }
  return { town: normalize(answer), state: null };
}

export function acceptedAnswers(question) {
  const forms = [];
  for (const s of question.schools) forms.push(...answerForms(question.mode, s));
  return forms.map(normalize);
}

// Number of single-letter edits (add, remove, swap in another letter, or flip two neighbors)
// needed to turn one word into the other: "cincinatti" -> "cincinnati" is 2.
export function editDistance(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) d.push([i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// Short names must be exact ("TCU"); longer names allow one or two slips.
export function typoAllowance(length) {
  if (length < 5) return 0;
  if (length < 8) return 1;
  return 2;
}

function closestDistance(given, forms) {
  let best = Infinity;
  for (const form of forms) {
    const dist = editDistance(given, form);
    if (dist <= typoAllowance(form.length) && dist < best) best = dist;
  }
  return best;
}

// "Wildcats" -> "Wildcat", "Huskies" -> "Husky", "Buffaloes" -> "Buffalo"; null when there's no plural ending.
export function singularOf(name) {
  if (/ies$/i.test(name)) return name.slice(0, -3) + "y";
  if (/oes$/i.test(name)) return name.slice(0, -2);
  if (/[^s]s$/i.test(name)) return name.slice(0, -1);
  return null;
}

// A mascot question's right answers with only the plural ending added or dropped ("Wildcat", "Kentucky Wildcat").
// Built from the real nicknames, not from the player's guess, so a misspelling like "Hoky" never sneaks in.
export function pluralVariants(question) {
  const out = [];
  for (const s of question.schools) {
    for (const name of [s.mascot].concat(s.mascotAliases || [])) {
      const one = name === s.mascot && s.mascotSingular ? s.mascotSingular : singularOf(name);
      for (const form of [one, `${name}s`]) {
        if (form) out.push(normalize(form), normalize(`${s.school} ${form}`));
      }
    }
  }
  return out;
}

// "exact" for a right answer (or a mascot with only its plural ending added or dropped), "close" for a small misspelling of a right answer, otherwise null.
// A typo only counts when it is closer to a right answer than to any other school's answer,
// and typing another school's real answer is always wrong.
export function matchAnswer(question, answer, { forgiveTypos = true, pool = SCHOOLS } = {}) {
  const given = normalize(answer);
  if (given === "") return null;
  const accepted = acceptedAnswers(question);
  if (accepted.indexOf(given) !== -1) return "exact";

  const otherSchools = pool.filter((s) => question.schools.indexOf(s) === -1);
  const othersFor = (options) => {
    const out = [];
    for (const s of otherSchools) {
      for (const form of answerForms(question.mode, s, options)) {
        const n = normalize(form);
        if (accepted.indexOf(n) === -1) out.push(n);
      }
    }
    return out;
  };
  if (othersFor().indexOf(given) !== -1) return null;
  if (question.mode === Mode.MASCOT && pluralVariants(question).indexOf(given) !== -1) return "exact";
  if (!forgiveTypos) return null;

  // Town typos are judged on the town alone; a state, if typed, must be right.
  let guess = given;
  let rightForms = accepted;
  let otherForms = othersFor();
  if (question.mode === Mode.TOWN) {
    const { town, state } = splitState(answer);
    if (state && !question.schools.some((s) => s.state === state)) return null;
    guess = town;
    rightForms = [];
    for (const s of question.schools) rightForms.push(...answerForms(Mode.TOWN, s, { withStates: false }).map(normalize));
    otherForms = othersFor({ withStates: false });
  }
  const right = closestDistance(guess, rightForms);
  return right !== Infinity && right < closestDistance(guess, otherForms) ? "close" : null;
}

// The right answer the player's typo was closest to, e.g. "Clemson" for "Clemsen" when Tigers is asked.
export function closestAnswerText(question, answer) {
  const given = normalize(answer);
  let best = question.schools[0];
  let bestForm = null;
  let bestDist = Infinity;
  for (const s of question.schools) {
    for (const form of answerForms(question.mode, s)) {
      const dist = editDistance(given, normalize(form));
      if (dist < bestDist) {
        best = s;
        bestForm = form;
        bestDist = dist;
      }
    }
  }
  if (question.mode === Mode.TOWN) return townLabel(best);
  if (question.mode === Mode.MASCOT) return bestForm; // e.g. "Tennessee Volunteers" or "Vols", as typed
  return answerLabel(question.mode, best);
}

export function isCorrect(question, answer, options) {
  return matchAnswer(question, answer, options) !== null;
}

// Badge shown while the player is on a run of right answers.
export function streakLevel(streak) {
  if (streak >= 10) return { level: 3, label: "Unstoppable!" };
  if (streak >= 5) return { level: 2, label: "On fire!" };
  if (streak >= 3) return { level: 1, label: "Heating up!" };
  return null;
}

// Streaks worth a celebration: 3, 5, 10, then every 5 after that.
export function isStreakMilestone(streak) {
  return streak === 3 || streak === 5 || (streak >= 10 && streak % 5 === 0);
}

// The full answer shown after each question, always with the state so the player learns it.
export function correctAnswerText(question) {
  const labels = question.schools.map((s) => (question.mode === Mode.TOWN ? townLabel(s) : answerLabel(question.mode, s)));
  return labels.join(" or ");
}

export class Quiz {
  constructor({
    mode = Mode.TOWN,
    conferences = [],
    count = null,
    forgiveTypos = true,
    showStates = false,
    schools = SCHOOLS,
    rng = Math.random,
  } = {}) {
    this.mode = mode;
    this.forgiveTypos = forgiveTypos;
    this.pool = schools;
    this.questions = buildQuestions({ mode, schools, conferences, count, showStates, rng });
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
    const match = matchAnswer(question, input, { forgiveTypos: this.forgiveTypos, pool: this.pool });
    const correct = match !== null;
    this.answered = true;
    if (correct) {
      this.score++;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    } else {
      this.streak = 0;
      this.missed.push({ question, given: String(input) });
    }
    return {
      correct,
      close: match === "close",
      spelling: match === "close" ? closestAnswerText(question, input) : null,
      correctAnswer: correctAnswerText(question),
      milestone: correct && isStreakMilestone(this.streak),
    };
  }

  next() {
    if (!this.answered) throw new Error("Answer the question first.");
    this.index++;
    this.answered = false;
  }
}
