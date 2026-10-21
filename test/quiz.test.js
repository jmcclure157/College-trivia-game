import { test } from "node:test";
import assert from "node:assert/strict";

import { SCHOOLS } from "../src/schools.js";
import {
  AnswerStyle,
  CHOICE_COUNT,
  Mode,
  Quiz,
  buildQuestions,
  isCorrect,
  makeChoices,
  normalize,
  shuffle,
  townLabel,
} from "../src/quiz.js";

// Small deterministic random number generator so tests repeat exactly.
function seeded(seed = 1) {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

const byName = (name) => SCHOOLS.find((s) => s.school === name);
const townQuestion = (name) => ({ mode: Mode.TOWN, prompt: name, schools: [byName(name)], correct: [townLabel(byName(name))] });

test("shuffle keeps every item and does not change the input", () => {
  const input = [1, 2, 3, 4, 5, 6];
  const out = shuffle(input, seeded(3));
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(out.slice().sort(), input);
});

test("normalize ignores case, punctuation, spacing and accents", () => {
  assert.equal(normalize("Winston-Salem"), normalize("winston salem"));
  assert.equal(normalize("  TUSCALOOSA!! "), normalize("tuscaloosa"));
  assert.equal(normalize("Texas A&M"), normalize("texas am"));
  assert.equal(normalize("The University of Alabama"), normalize("alabama"));
  assert.equal(normalize("Café"), normalize("cafe"));
});

test("typed town answers are matched leniently", () => {
  const q = townQuestion("Wake Forest");
  for (const ok of ["Winston-Salem", "winston salem", "WINSTON SALEM, NC", "Winston-Salem, North Carolina"]) {
    assert.ok(isCorrect(q, ok), ok);
  }
  for (const bad of ["", "   ", "Winston", "Raleigh", "Winston-Salem, SC"]) assert.ok(!isCorrect(q, bad), bad);
});

test("town aliases are accepted", () => {
  assert.ok(isCorrect(townQuestion("Illinois"), "Urbana"));
  assert.ok(isCorrect(townQuestion("Penn State"), "University Park, PA"));
  assert.ok(isCorrect(townQuestion("Stanford"), "palo alto"));
});

test("reverse mode accepts school names and aliases", () => {
  const [q] = buildQuestions({ mode: Mode.SCHOOL, schools: [byName("Ole Miss")] });
  assert.equal(q.prompt, "Oxford, MS");
  assert.ok(isCorrect(q, "ole miss"));
  assert.ok(isCorrect(q, "University of Mississippi"));
  assert.ok(!isCorrect(q, "Mississippi State"));
});

test("reverse mode asks about Los Angeles once and accepts UCLA or USC", () => {
  const questions = buildQuestions({ mode: Mode.SCHOOL, rng: seeded(5) });
  assert.equal(questions.length, SCHOOLS.length - 1);
  const la = questions.filter((q) => q.prompt === "Los Angeles, CA");
  assert.equal(la.length, 1);
  assert.ok(isCorrect(la[0], "UCLA"));
  assert.ok(isCorrect(la[0], "Southern California"));
});

test("conference filter and question count", () => {
  const sec = buildQuestions({ conferences: ["SEC"], rng: seeded(2) });
  assert.equal(sec.length, 16);
  assert.ok(sec.every((q) => q.schools[0].conference === "SEC"));
  assert.equal(buildQuestions({ count: 10, rng: seeded(2) }).length, 10);
  assert.equal(buildQuestions({ conferences: ["ACC", "Big 12"] }).length, 33);
});

test("choices: four distinct options, one right answer, wrong ones from the same conference", () => {
  for (let seed = 1; seed <= 25; seed++) {
    for (const q of buildQuestions({ rng: seeded(seed) })) {
      const choices = makeChoices(q, { rng: seeded(seed) });
      assert.equal(choices.length, CHOICE_COUNT);
      assert.equal(new Set(choices).size, CHOICE_COUNT, choices.join(" | "));
      assert.equal(choices.filter((c) => q.correct.includes(c)).length, 1);
      const conf = q.schools[0].conference;
      for (const c of choices.filter((c) => !q.correct.includes(c))) {
        assert.ok(SCHOOLS.some((s) => townLabel(s) === c && s.conference === conf), `${c} not in ${conf}`);
      }
    }
  }
});

test("choices in reverse mode never offer a second right answer", () => {
  const [la] = buildQuestions({ mode: Mode.SCHOOL, schools: [byName("UCLA"), byName("USC")] });
  for (let seed = 1; seed <= 50; seed++) {
    const choices = makeChoices(la, { rng: seeded(seed) });
    assert.equal(choices.filter((c) => c === "UCLA" || c === "USC").length, 1);
  }
});

test("choices fall back to other conferences when the pool is small", () => {
  const pool = [byName("Alabama"), byName("Auburn"), byName("Ohio State"), byName("Utah"), byName("Duke")];
  const choices = makeChoices(townQuestion("Alabama"), { pool, rng: seeded(4) });
  assert.equal(choices.length, 4);
  assert.ok(choices.includes("Tuscaloosa, AL"));
  assert.ok(choices.includes("Auburn, AL"));
});

test("Quiz tracks score, streak, best streak and misses", () => {
  const quiz = new Quiz({ conferences: ["SEC"], count: 5, rng: seeded(9) });
  assert.equal(quiz.total, 5);
  const plan = [true, true, false, true, true];
  for (const right of plan) {
    const q = quiz.current;
    const result = quiz.answer(right ? q.schools[0].town : "Nowhere");
    assert.equal(result.correct, right);
    assert.equal(result.correctAnswer, townLabel(q.schools[0]));
    quiz.next();
  }
  assert.ok(quiz.finished);
  assert.equal(quiz.score, 4);
  assert.equal(quiz.streak, 2);
  assert.equal(quiz.bestStreak, 2);
  assert.equal(quiz.missed.length, 1);
  assert.equal(quiz.missed[0].given, "Nowhere");
});

test("Quiz in multiple-choice mode gives every question choices that include the answer", () => {
  const quiz = new Quiz({ style: AnswerStyle.CHOICE, rng: seeded(11) });
  assert.equal(quiz.total, SCHOOLS.length);
  for (const q of quiz.questions) assert.ok(q.choices.includes(q.correct[0]));
  const q = quiz.current;
  assert.ok(quiz.answer(q.correct[0]).correct);
});

test("Quiz refuses double answers and skipping ahead", () => {
  const quiz = new Quiz({ count: 1, rng: seeded(1) });
  assert.throws(() => quiz.next());
  quiz.answer("x");
  assert.throws(() => quiz.answer("y"));
  quiz.next();
  assert.throws(() => quiz.answer("z"));
});
