import { test } from "node:test";
import assert from "node:assert/strict";

import { SCHOOLS } from "../src/schools.js";
import {
  Mode,
  Quiz,
  buildQuestions,
  closestAnswerText,
  correctAnswerText,
  editDistance,
  isCorrect,
  isStreakMilestone,
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
  const [shown] = buildQuestions({ schools: [byName("Alabama")], showStates: true });
  assert.deepEqual(shown.correct, ["Tuscaloosa, AL"]);
  const [reverse] = buildQuestions({ mode: Mode.SCHOOL, schools: [byName("Alabama")], showStates: true });
  assert.equal(reverse.prompt, "Tuscaloosa, AL");
});

test("without states, reverse mode asks about Columbia once and accepts Missouri or South Carolina", () => {
  const columbia = buildQuestions({ mode: Mode.SCHOOL }).filter((q) => q.prompt === "Columbia");
  assert.equal(columbia.length, 1);
  assert.ok(isCorrect(columbia[0], "Missouri"));
  assert.ok(isCorrect(columbia[0], "South Carolina"));
  const withStates = buildQuestions({ mode: Mode.SCHOOL, showStates: true });
  assert.equal(withStates.filter((q) => q.prompt.startsWith("Columbia,")).length, 2);
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

test("mascot mode: shown a school, name its mascot, with short forms and typos", () => {
  const [q] = buildQuestions({ mode: Mode.MASCOT, schools: [byName("Tennessee")] });
  assert.equal(q.prompt, "Tennessee");
  assert.deepEqual(q.correct, ["Volunteers"]);
  for (const ok of ["volunteers", "Vols", "Tennessee Volunteers", "Volunters"]) assert.ok(isCorrect(q, ok), ok);
  assert.ok(!isCorrect(q, "Commodores"));
});

test("mascot mode never accepts a different school's similar nickname", () => {
  const mascot = (name) => buildQuestions({ mode: Mode.MASCOT, schools: [byName(name)] })[0];
  assert.equal(matchAnswer(mascot("Stanford"), "Cardinals"), null);
  assert.equal(matchAnswer(mascot("Louisville"), "Cardinal"), null);
  assert.equal(matchAnswer(mascot("Washington"), "Huskers"), null);
});

test("reverse mascot mode asks about shared nicknames once and accepts any of their schools", () => {
  const questions = buildQuestions({ mode: Mode.MASCOT_SCHOOL });
  assert.equal(questions.length, SCHOOLS.length - 3 - 1 - 3 - 1);
  const tigers = questions.find((q) => q.prompt === "Tigers");
  for (const name of ["Auburn", "LSU", "Missouri", "Clemson", "Mizzou"]) assert.ok(isCorrect(tigers, name), name);
  assert.ok(!isCorrect(tigers, "Alabama"));
  assert.equal(correctAnswerText(tigers), "Auburn or LSU or Missouri or Clemson");
  assert.equal(closestAnswerText(tigers, "Clemsen"), "Clemson");
  const [vols] = buildQuestions({ mode: Mode.MASCOT, schools: [byName("Tennessee")] });
  assert.equal(closestAnswerText(vols, "Tennesee Volunteers"), "Tennessee Volunteers");
  assert.equal(closestAnswerText(vols, "Volunters"), "Volunteers");
  assert.equal(closestAnswerText(townQuestion("Iowa"), "Iowa Ciyt"), "Iowa City, IA");
  const [tide] = buildQuestions({ mode: Mode.MASCOT_SCHOOL, schools: [byName("Alabama")] });
  assert.equal(tide.prompt, "Crimson Tide");
  assert.ok(isCorrect(tide, "alabama"));
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
  const quiz = new Quiz({ schools: [byName("Cincinnati"), byName("Alabama"), byName("Auburn")], rng: seeded(3) });
  const typo = { Cincinnati: "Cincinatti", Alabama: "Tuscalosa", Auburn: "Auburn" };
  const results = [];
  while (!quiz.finished) {
    results.push(quiz.answer(typo[quiz.current.prompt]));
    quiz.next();
  }
  assert.equal(quiz.score, 3);
  assert.deepEqual(results.map((r) => r.milestone), [false, false, true]);
  assert.equal(results.filter((r) => r.close).length, 2);

  const strict = new Quiz({ schools: [byName("Cincinnati")], forgiveTypos: false });
  assert.equal(strict.answer("Cincinatti").correct, false);
});

test("Quiz refuses double answers and skipping ahead", () => {
  const quiz = new Quiz({ count: 1, rng: seeded(1) });
  assert.throws(() => quiz.next());
  quiz.answer("x");
  assert.throws(() => quiz.answer("y"));
  quiz.next();
  assert.throws(() => quiz.answer("z"));
});

test("a mascot with only its plural ending added or dropped counts as exact, not a typo", () => {
  const mascot = (name) => buildQuestions({ mode: Mode.MASCOT, schools: [byName(name)] })[0];
  assert.equal(matchAnswer(mascot("Kentucky"), "Wildcat"), "exact");
  assert.equal(matchAnswer(mascot("Texas"), "Longhorn"), "exact");
  assert.equal(matchAnswer(mascot("Washington"), "Husky"), "exact");
  assert.equal(matchAnswer(mascot("Tennessee"), "Tennessee Volunteer"), "exact");
  assert.equal(matchAnswer(mascot("Kentucky"), "Wildcat", { forgiveTypos: false }), "exact");
  assert.equal(matchAnswer(mascot("Auburn"), "Tiger"), "exact");
  assert.equal(new Quiz({ mode: Mode.MASCOT, schools: [byName("Kentucky")] }).answer("Wildcat").close, false);

  assert.equal(matchAnswer(mascot("Virginia Tech"), "Hokie", { forgiveTypos: false }), "exact");
  assert.equal(matchAnswer(mascot("Texas A&M"), "Aggie", { forgiveTypos: false }), "exact");
  assert.equal(matchAnswer(mascot("Colorado"), "Buffalo", { forgiveTypos: false }), "exact");
  assert.equal(matchAnswer(mascot("Utah"), "Ute", { forgiveTypos: false }), "exact");
  // Misspelled singulars are typos, not plurals: wrong when typo forgiveness is off.
  for (const [name, typo] of [["Virginia Tech", "Hoky"], ["Texas A&M", "Aggy"], ["Colorado", "Buffaloe"], ["Kentucky", "Wildcatt"]]) {
    assert.equal(matchAnswer(mascot(name), typo, { forgiveTypos: false }), null, typo);
  }

  // Another school's real nickname is still wrong, even one letter apart.
  assert.equal(matchAnswer(mascot("Stanford"), "Cardinals"), null);
  assert.equal(matchAnswer(mascot("Louisville"), "Cardinal"), null);
  assert.equal(matchAnswer(mascot("Washington"), "Huskers"), null);
});
