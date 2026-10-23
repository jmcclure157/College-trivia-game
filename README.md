# College Town Trivia

A browser trivia game: do you know the home town of every Power 4 college football school?
Plain HTML, CSS and JavaScript. No build step, no dependencies, nothing is saved.

## How to play

1. Pick a **question type**:
   - **Name the town**: you're shown a school (e.g. *Alabama*) and name its town (*Tuscaloosa*).
   - **Name the school** (reverse mode): you're shown a town (e.g. *Tuscaloosa*) and name the school.
     When towns are shown without states, Columbia accepts Missouri or South Carolina, and Los Angeles
     accepts UCLA or USC.
   - **Name the mascot**: you're shown a school (e.g. *Alabama*) and name its team nickname (*Crimson Tide*).
   - **Name the school from its mascot**: you're shown a nickname (e.g. *Crimson Tide*) and name the school.
     Shared nicknames are asked once and accept any of their schools: *Tigers* (Auburn, LSU, Missouri,
     Clemson), *Wildcats* (Kentucky, Northwestern, Arizona, Kansas State), *Bulldogs* (Georgia,
     Mississippi State) and *Cougars* (BYU, Houston). Common short forms count too (*Vols*, *Terps*, *Huskers*).
2. **Type your answer.** Answers ignore capital letters, punctuation and spacing, so `winston salem`,
   `Winston-Salem` and `Winston-Salem, NC` all count. A few well-known alternatives are accepted too
   (e.g. *Urbana* for Illinois, *Ole Miss* or *Mississippi*).
3. **Options**:
   - **Forgive small typos** (on by default): a typed answer that is a letter or two off still counts,
     e.g. `Cincinatti`, and the game shows the right spelling. Names under 5 letters (like *TCU*) must
     be exact, and typing another school's real answer (e.g. *Kansas* for *Arkansas*) is always wrong.
   - **Show states** (off by default): shows *Tuscaloosa, AL* instead of *Tuscaloosa*. That's easier,
     because the state usually gives the school away. The state is always shown after you answer.
4. Tap the **conferences** to include and pick a **round length** (10, 25 or all questions).
5. After each answer you see right/wrong and the correct answer, plus your score and streak.
   Get 3 in a row and a flame badge appears; it heats up at 5 and 10 with a burst of sparks.
   The results screen shows your score as a percentage ring and lists every question you missed. **Play again** starts a new shuffled round.

## Which schools are included

All 67 Power 4 football schools for the 2025-26 season:
SEC (16), Big Ten (18), Big 12 (16) and ACC (17). The ACC has 18 members overall, but Notre Dame
plays football as an independent, so it is left out. The town is the city the main campus is in
(e.g. Ohio State → Columbus, USC → Los Angeles).

## Project layout

```
index.html          the page: setup screen, question screen, results screen
style.css           look and layout
src/schools.js      the data: { school, town, state, conference, mascot } for every school
src/quiz.js         the game rules (no page code): questions, answer matching, scoring
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
