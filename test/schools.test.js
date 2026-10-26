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

test("every school has a mascot, and only the expected nicknames are shared", () => {
  const byMascot = {};
  for (const s of SCHOOLS) {
    assert.ok(typeof s.mascot === "string" && s.mascot.trim() !== "", `${s.school} has no mascot`);
    (byMascot[s.mascot] ||= []).push(s.school);
  }
  const shared = Object.fromEntries(Object.entries(byMascot).filter(([, names]) => names.length > 1));
  assert.deepEqual(shared, {
    Tigers: ["Auburn", "LSU", "Missouri", "Clemson"],
    Bulldogs: ["Georgia", "Mississippi State"],
    Wildcats: ["Kentucky", "Northwestern", "Arizona", "Kansas State"],
    Cougars: ["BYU", "Houston"],
  });
});

test("mascot spot checks", () => {
  const mascot = (name) => SCHOOLS.find((s) => s.school === name).mascot;
  assert.equal(mascot("Alabama"), "Crimson Tide");
  assert.equal(mascot("Ohio State"), "Buckeyes");
  assert.equal(mascot("Stanford"), "Cardinal");
  assert.equal(mascot("Louisville"), "Cardinals");
  assert.equal(mascot("Syracuse"), "Orange");
});

test("every school has exactly two #rrggbb colors (primary, secondary)", () => {
  for (const s of SCHOOLS) {
    assert.ok(Array.isArray(s.colors), `${s.school}: colors`);
    assert.equal(s.colors.length, 2, `${s.school}: colors`);
    for (const c of s.colors) assert.match(c, /^#[0-9A-Fa-f]{6}$/, `${s.school}: ${c}`);
    assert.notEqual(s.colors[0].toUpperCase(), s.colors[1].toUpperCase(), `${s.school}: two different colors`);
  }
});
