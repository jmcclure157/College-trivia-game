import { test } from "node:test";
import assert from "node:assert/strict";

import { CONFERENCES, POWER_4, SCHOOLS, STATE_NAMES } from "../src/schools.js";
import { normalize, townLabel } from "../src/quiz.js";

test("has all 138 FBS football schools for 2026, 67 of them Power 4", () => {
  assert.equal(SCHOOLS.length, 138);
  assert.equal(SCHOOLS.filter((s) => POWER_4.includes(s.conference)).length, 67);
});

test("each conference has its 2026 football member count", () => {
  const counts = {};
  for (const s of SCHOOLS) counts[s.conference] = (counts[s.conference] || 0) + 1;
  assert.deepEqual(counts, {
    SEC: 16, "Big Ten": 18, "Big 12": 16, ACC: 17,
    American: 14, "Sun Belt": 14, "Mountain West": 10, MAC: 13, "Conference USA": 10, "Pac-12": 8, Independent: 2,
  });
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

test("only Los Angeles, Houston and Atlanta are shared towns", () => {
  const byTown = {};
  for (const s of SCHOOLS) (byTown[townLabel(s)] ||= []).push(s.school);
  const shared = Object.entries(byTown).filter(([, list]) => list.length > 1);
  assert.deepEqual(shared, [
    ["Los Angeles, CA", ["UCLA", "USC"]],
    ["Houston, TX", ["Houston", "Rice"]],
    ["Atlanta, GA", ["Georgia Tech", "Georgia State"]],
  ]);
});

test("spot-check realignment and well-known towns", () => {
  const find = (name) => SCHOOLS.find((s) => s.school === name);
  assert.equal(find("Texas").conference, "SEC");
  assert.equal(find("Oklahoma").conference, "SEC");
  for (const name of ["Oregon", "Washington", "USC", "UCLA"]) assert.equal(find(name).conference, "Big Ten");
  for (const name of ["Stanford", "Cal", "SMU"]) assert.equal(find(name).conference, "ACC");
  for (const name of ["Arizona", "Arizona State", "Colorado", "Utah"]) assert.equal(find(name).conference, "Big 12");
  assert.equal(find("Notre Dame").conference, "Independent");
  assert.equal(find("UConn").conference, "Independent");
  for (const name of ["Boise State", "Oregon State", "Washington State", "Texas State"]) assert.equal(find(name).conference, "Pac-12");
  for (const name of ["North Dakota State", "Northern Illinois", "UTEP"]) assert.equal(find(name).conference, "Mountain West");
  assert.equal(find("Sacramento State").conference, "MAC");
  assert.equal(find("Louisiana Tech").conference, "Sun Belt");
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
    Tigers: ["Auburn", "LSU", "Missouri", "Clemson", "Memphis"],
    Bulldogs: ["Georgia", "Mississippi State", "Louisiana Tech", "Fresno State"],
    Wildcats: ["Kentucky", "Northwestern", "Arizona", "Kansas State"],
    Rebels: ["Ole Miss", "UNLV"],
    Gamecocks: ["South Carolina", "Jacksonville State"],
    Aggies: ["Texas A&M", "New Mexico State", "Utah State"],
    Spartans: ["Michigan State", "San Jose State"],
    Trojans: ["USC", "Troy"],
    Huskies: ["Washington", "Northern Illinois", "UConn"],
    Bears: ["Baylor", "Missouri State"],
    Cougars: ["BYU", "Houston", "Washington State"],
    Cowboys: ["Oklahoma State", "Wyoming"],
    Mountaineers: ["West Virginia", "Appalachian State"],
    Eagles: ["Boston College", "Georgia Southern", "Eastern Michigan"],
    Cardinals: ["Louisville", "Ball State"],
    Panthers: ["Pitt", "Georgia State", "FIU"],
    Owls: ["Florida Atlantic", "Rice", "Temple", "Kennesaw State"],
    Bulls: ["South Florida", "Buffalo"],
    Falcons: ["Air Force", "Bowling Green"],
    Bobcats: ["Ohio", "Texas State"],
    Broncos: ["Western Michigan", "Boise State"],
  });
  const p4 = SCHOOLS.filter((s) => POWER_4.includes(s.conference));
  const p4Count = {};
  for (const s of p4) p4Count[s.mascot] = (p4Count[s.mascot] || 0) + 1;
  const p4Shared = Object.keys(p4Count).filter((name) => p4Count[name] > 1);
  assert.deepEqual(p4Shared, ["Tigers", "Bulldogs", "Wildcats", "Cougars"]);
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
