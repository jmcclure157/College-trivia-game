import { test } from "node:test";
import assert from "node:assert/strict";

import { CONFERENCES, SCHOOLS, STATE_NAMES } from "../src/schools.js";
import { normalize, townLabel } from "../src/quiz.js";

test("has all 67 Power 4 football schools for 2025-26", () => {
  assert.equal(SCHOOLS.length, 67);
});

test("each conference has its 2025-26 football member count", () => {
  const counts = {};
  for (const s of SCHOOLS) counts[s.conference] = (counts[s.conference] || 0) + 1;
  assert.deepEqual(counts, { SEC: 16, "Big Ten": 18, "Big 12": 16, ACC: 17 });
});

test("every entry has the required fields", () => {
  for (const s of SCHOOLS) {
    for (const field of ["school", "town", "state", "conference"]) {
      assert.equal(typeof s[field], "string", `${s.school}: ${field}`);
      assert.notEqual(s[field].trim(), "", `${s.school}: ${field}`);
    }
    assert.ok(CONFERENCES.includes(s.conference), `${s.school}: unknown conference ${s.conference}`);
    assert.ok(STATE_NAMES[s.state], `${s.school}: unknown state ${s.state}`);
  }
});

test("school names are unique, even after lenient matching", () => {
  const names = SCHOOLS.map((s) => normalize(s.school));
  assert.equal(new Set(names).size, names.length);
});

test("only UCLA and USC share a town", () => {
  const byTown = {};
  for (const s of SCHOOLS) (byTown[townLabel(s)] ||= []).push(s.school);
  const shared = Object.entries(byTown).filter(([, list]) => list.length > 1);
  assert.deepEqual(shared, [["Los Angeles, CA", ["UCLA", "USC"]]]);
});

test("spot-check realignment and well-known towns", () => {
  const find = (name) => SCHOOLS.find((s) => s.school === name);
  assert.equal(find("Texas").conference, "SEC");
  assert.equal(find("Oklahoma").conference, "SEC");
  for (const name of ["Oregon", "Washington", "USC", "UCLA"]) assert.equal(find(name).conference, "Big Ten");
  for (const name of ["Stanford", "Cal", "SMU"]) assert.equal(find(name).conference, "ACC");
  for (const name of ["Arizona", "Arizona State", "Colorado", "Utah"]) assert.equal(find(name).conference, "Big 12");
  assert.equal(find("Notre Dame"), undefined);
  assert.equal(find("Alabama").town, "Tuscaloosa");
  assert.equal(find("Ohio State").town, "Columbus");
  assert.equal(find("USC").town, "Los Angeles");
});
