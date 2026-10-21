# College Town Trivia

A browser trivia game: do you know the home town of every Power 4 college football school?
Plain HTML, CSS and JavaScript. No build step, no dependencies, nothing is saved.

## How to play

1. Pick a **question type**:
   - **Name the town**: you're shown a school (e.g. *Alabama*) and name its town (*Tuscaloosa*).
   - **Name the school** (reverse mode): you're shown a town (e.g. *Tuscaloosa, AL*) and name the school.
2. Pick **how to answer**: **multiple choice** (4 options; the wrong ones are mostly from the same
   conference, so they're plausible) or **type the answer**. Typed answers ignore capital letters,
   punctuation and spacing, so `winston salem`, `Winston-Salem` and `Winston-Salem, NC` all count.
   A few well-known alternatives are accepted too (e.g. *Urbana* for Illinois, *Ole Miss* or *Mississippi*).
3. Choose which **conferences** to include and how many **questions** (10, 25 or all).
4. After each answer you see right/wrong and the correct answer, plus your score and streak.
   The results screen lists every school you missed. **Play again** starts a new shuffled round.

## Which schools are included

All 67 Power 4 football schools for the 2025-26 season:
SEC (16), Big Ten (18), Big 12 (16) and ACC (17). The ACC has 18 members overall, but Notre Dame
plays football as an independent, so it is left out. The town is the city the main campus is in
(e.g. Ohio State → Columbus, USC → Los Angeles).

## Project layout

```
index.html          the page: setup screen, question screen, results screen
style.css           look and layout
src/schools.js      the data: { school, town, state, conference } for every school
src/quiz.js         the game rules (no page code): questions, choices, answer matching, scoring
src/ui.js           page code: draws each screen and passes clicks/typing to quiz.js
test/               tests for the data and the rules
.github/workflows/  ci.yml runs the tests; pages.yml publishes the game to GitHub Pages
```

## Running the tests

Needs Node.js 20 or newer:

```
npm test
```

This uses Node's built-in test runner (`node --test`), so there is nothing to install.

## Playing it locally

The page uses JavaScript modules, which browsers won't load from a `file://` address, so serve the
folder with any static server, e.g. `python3 -m http.server 8000`, then open http://localhost:8000.

## Hosting on GitHub Pages

`.github/workflows/pages.yml` publishes the game on every push to `main`. **Pages must be enabled
once in the repo settings first:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.
After that, the game is at `https://jmcclure157.github.io/College-trivia-game/`. If the first deploy
ran before Pages was switched on, re-run it from Actions → "Deploy to GitHub Pages" → Run workflow.
