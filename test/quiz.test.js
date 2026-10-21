import { test } from "node:test";
import assert from "node:assert/strict";

import { SCHOOLS } from "../src/schools.js";
import {
  AnswerStyle,
  CHOICE_COUNT,
  Mode,
  Quiz,
  buildQuestions,
  editDistance,
  isCorrect,
  isStreakMilestone,
  makeChoices,
  matchAnswer,
  normalize,
  shuffle,
  streakLevel,
  townLabel,
  townText,
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
const townQuestion = (name) => ({ mode: Mode.TOWN, prompt: name, schools: [byName(name)], correct: [townText(byName(name))] });

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
  for (const bad of ["", "   ", "Winston", "Raleigh", "Winston-Salem, SC", "Winston-Salem South Carolina"]) {
    assert.ok(!isCorrect(q, bad), bad);
  }
});

test("a town typo with the right state counts, but never with a wrong state", () => {
  const q = townQuestion("Wake Forest");
  assert.equal(matchAnswer(q, "Winston-Salme, NC"), "close");
  assert.equal(matchAnswer(q, "winston salme north carolina"), "close");
  assert.equal(matchAnswer(q, "Winston-Salme, SC"), null);
  assert.equal(matchAnswer(q, "Winston-Salem, NV"), null);
  assert.equal(matchAnswer(townQuestion("Missouri"), "Columbai, SC"), null);
  assert.equal(matchAnswer(townQuestion("Oregon"), "Eugene"), "exact");
  assert.equal(matchAnswer(townQuestion("Oregon"), "Eugen"), "close");
});

test("town aliases are accepted", () => {
  assert.ok(isCorrect(townQuestion("Illinois"), "Urbana"));
  assert.ok(isCorrect(townQuestion("Penn State"), "University Park, PA"));
  assert.ok(isCorrect(townQuestion("Stanford"), "palo alto"));
});

test("reverse mode accepts school names and aliases", () => {
  const [q] = buildQuestions({ mode: Mode.SCHOOL, schools: [byName("Ole Miss")] });
  assert.equal(q.prompt, "Oxford");
  assert.ok(isCorrect(q, "ole miss"));
  assert.ok(isCorrect(q, "University of Mississippi"));
  assert.ok(!isCorrect(q, "Mississippi State"));
});

test("reverse mode asks about Los Angeles once and accepts UCLA or USC", () => {
  const questions = buildQuestions({ mode: Mode.SCHOOL, rng: seeded(5) });
  assert.equal(questions.length, SCHOOLS.length - 2);
  const la = questions.filter((q) => q.prompt === "Los Angeles");
  assert.equal(la.length, 1);
  assert.ok(isCorrect(la[0], "UCLA"));
  assert.ok(isCorrect(la[0], "Southern California"));
});

test("states are hidden by default and shown when asked for", () => {
  const [town] = buildQuestions({ schools: [byName("Alabama")] });
  assert.deepEqual(town.correct, ["Tuscaloosa"]);
  assert.ok(makeChoices(town, { rng: seeded(1) }).every((c) => !c.includes(",")));
  const [shown] = buildQuestions({ schools: [byName("Alabama")], showStates: true });
  assert.deepEqual(shown.correct, ["Tuscaloosa, AL"]);
  assert.ok(makeChoices(shown, { rng: seeded(1), showStates: true }).every((c) => c.includes(", ")));
  const [reverse] = buildQuestions({ mode: Mode.SCHOOL, schools: [byName("Alabama")], showStates: true });
  assert.equal(reverse.prompt, "Tuscaloosa, AL");
});

test("without states, reverse mode asks about Columbia once and accepts Missouri or South Carolina", () => {
  const columbia = buildQuestions({ mode: Mode.SCHOOL }).filter((q) => q.prompt === "Columbia");
  assert.equal(columbia.length, 1);
  assert.ok(isCorrect(columbia[0], "Missouri"));
  assert.ok(isCorrect(columbia[0], "South Carolina"));
  for (let seed = 1; seed <= 30; seed++) {
    const choices = makeChoices(columbia[0], { rng: seeded(seed) });
    assert.equal(choices.filter((c) => c === "Missouri" || c === "South Carolina").length, 1);
  }
  const withStates = buildQuestions({ mode: Mode.SCHOOL, showStates: true });
  assert.equal(withStates.filter((q) => q.prompt.startsWith("Columbia,")).length, 2);
});

test("in town mode, the Missouri question never offers South Carolina's Columbia as a wrong answer", () => {
  const [q] = buildQuestions({ schools: [byName("Missouri")] });
  for (let seed = 1; seed <= 30; seed++) {
    const choices = makeChoices(q, { rng: seeded(seed) });
    assert.equal(choices.length, CHOICE_COUNT);
    assert.equal(choices.filter((c) => c === "Columbia").length, 1);
  }
});

test("editDistance counts single-letter edits, with swapped neighbors as one", () => {
  assert.equal(editDistance("cincinnati", "cincinnati"), 0);
  assert.equal(editDistance("cincinatti", "cincinnati"), 2);
  assert.equal(editDistance("cincinati", "cincinnati"), 1);
  assert.equal(editDistance("tusclaoosa", "tuscaloosa"), 1);
  assert.equal(editDistance("", "abc"), 3);
});

test("small misspellings count as right and are reported as close", () => {
  const school = (name) => buildQuestions({ mode: Mode.SCHOOL, schools: [byName(name)] })[0];
  const cincy = buildQuestions({ mode: Mode.SCHOOL }).find((q) => q.correct.includes("Cincinnati"));
  for (const typo of ["Cincinatti", "cincinati", "Cincinnatti"]) assert.equal(matchAnswer(cincy, typo), "close", typo);
  assert.equal(matchAnswer(cincy, "Cincinnati"), "exact");
  assert.equal(matchAnswer(cincy, "Cincy"), null);
  assert.equal(matchAnswer(townQuestion("Alabama"), "Tuscalosa"), "close");
  assert.equal(matchAnswer(townQuestion("Ohio State"), "Colombus"), "close");
  assert.equal(matchAnswer(school("Michigan State"), "Michigan Stat"), "close");
});

test("typo forgiveness never accepts another school's answer or a near-miss of a short name", () => {
  const school = (name) => buildQuestions({ mode: Mode.SCHOOL, schools: [byName(name)] })[0];
  assert.equal(matchAnswer(school("TCU"), "TCV"), null);
  assert.equal(matchAnswer(school("TCU"), "SMU"), null);
  assert.equal(matchAnswer(school("Kansas"), "Arkansas"), null);
  assert.equal(matchAnswer(school("Texas A&M"), "Texas"), null);
  assert.equal(matchAnswer(school("North Carolina"), "South Carolina"), null);
  assert.equal(matchAnswer(townQuestion("Ohio State"), "Columbia"), null);
  assert.equal(matchAnswer(townQuestion("Missouri"), "Columbus"), null);
});

test("typo forgiveness can be turned off", () => {
  assert.equal(matchAnswer(townQuestion("Alabama"), "Tuscalosa", { forgiveTypos: false }), null);
  assert.equal(matchAnswer(townQuestion("Alabama"), "tuscaloosa", { forgiveTypos: false }), "exact");
});

test("streak badges heat up at 3, 5 and 10 in a row", () => {
  assert.equal(streakLevel(2), null);
  assert.equal(streakLevel(3).level, 1);
  assert.equal(streakLevel(5).level, 2);
  assert.equal(streakLevel(12).level, 3);
  const milestones = [];
  for (let n = 0; n <= 25; n++) if (isStreakMilestone(n)) milestones.push(n);
  assert.deepEqual(milestones, [3, 5, 10, 15, 20, 25]);
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
        assert.ok(SCHOOLS.some((s) => townText(s) === c && s.conference === conf), `${c} not in ${conf}`);
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

test("choices honor smaller option counts, including a single option", () => {
  const q = townQuestion("Alabama");
  assert.deepEqual(makeChoices(q, { count: 1, rng: seeded(1) }), ["Tuscaloosa"]);
  assert.equal(makeChoices(q, { count: 2, rng: seeded(1) }).length, 2);
});

test("choices fall back to other conferences when the pool is small", () => {
  const pool = [byName("Alabama"), byName("Auburn"), byName("Ohio State"), byName("Utah"), byName("Duke")];
  const choices = makeChoices(townQuestion("Alabama"), { pool, rng: seeded(4) });
  assert.equal(choices.length, 4);
  assert.ok(choices.includes("Tuscaloosa"));
  assert.ok(choices.includes("Auburn"));
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

test("Quiz reports close answers and streak milestones", () => {
  const quiz = new Quiz({ style: AnswerStyle.TYPED, schools: [byName("Cincinnati"), byName("Alabama"), byName("Auburn")], rng: seeded(3) });
  const typo = { Cincinnati: "Cincinatti", Alabama: "Tuscalosa", Auburn: "Auburn" };
  const results = [];
  while (!quiz.finished) {
    results.push(quiz.answer(typo[quiz.current.prompt]));
    quiz.next();
  }
  assert.equal(quiz.score, 3);
  assert.deepEqual(results.map((r) => r.milestone), [false, false, true]);
  assert.equal(results.filter((r) => r.close).length, 2);

  const strict = new Quiz({ style: AnswerStyle.TYPED, schools: [byName("Cincinnati")], forgiveTypos: false });
  assert.equal(strict.answer("Cincinatti").correct, false);
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
