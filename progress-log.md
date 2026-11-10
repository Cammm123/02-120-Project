# Progress log

One entry per working session: what was done, what was decided and why, and
what comes next. A new Claude session reads the latest entry first.

---

## 2026-10-06: setup, choosing the topic, choosing the paper

This session ran from the home folder (`~`), not the repo, so its Claude Code log
lives under `~/.claude/projects/-Users-cameronkani/` (session
`62d0a729-5a2b-4339-bd25-1c40a5689f1c`). Resume it from `~` with
`claude --resume 62d0a729-5a2b-4339-bd25-1c40a5689f1c`.

### What we did
1. **Moved the project to this school account.** Read the handoff from the
   personal account (`cancer-project-handoff/`, local only): the old spatial
   games project, `CLAUDE.md`, the two skills.
2. **Set up the repo.** `CLAUDE.md` and `.claude/skills/` are at the top level, and
   the handoff folder is gitignored. Private GitHub repo:
   https://github.com/Cammm123/02-120-Project
3. **Brainstormed a game concept** (`concept.md`, a working draft that will keep
   changing). The player is an oncologist. The body is an ally whose defenses
   weaken with age. The cancer "boss" gains hallmarks level by level, with no
   scripted AI: its apparent intelligence comes only from mutation plus
   selection. A level is won by cure or by control. Stages are ages.
4. **Read the official project description** (`course/`). Key findings:
   - "A project with no scientific question, such as a video game" is not
     accepted. So the project is a **model that answers a question**, and the
     game is only the way to explore it.
   - The suggested direction is to reproduce a published result, then extend it.
   - Any data must be in the repo when proposing. Commit messages must be in
     Cameron's words.
5. **Read the six Ring of Honor essays** (`course/ring-of-honor.md`). They all
   follow the same pattern: a classic model, a check against a known answer, an
   extension, an interface, and a discussion of limitations. None is a game, and
   none reproduces an exact published number. Doing so would put us ahead.
6. **Settled the structure:** build a simulation whose result matches a real
   published scientific result, as spatial games matched Nowak & May's 29.9%
   cooperators.
7. **Checked whether cancer is too uncertain to reproduce.** It isn't:
   reproducing a model is math. Shifting conclusions about cancer go into the
   limitations section. The real risk is a paper that doesn't publish its
   equations and parameters.
8. **Researched reproducible cancer models** (`research/model-candidates.md`).
   Easy ones: Strobl 2021 (adaptive therapy), Armitage & Doll 1954 (age),
   Kuznetsov 1994 (immune system), Hahnfeldt 1999 (blood vessels), Viossat &
   Noble 2021. Avoid as the core: the hallmarks agent-based simulations
   (rules have gaps, code is dead).
9. **Chose Armitage & Doll (1954)** as the result to reproduce. Needing k rare
   hits in a row gives a cancer rate ∝ age^(k−1). On a log-log plot that's a
   straight line, and the paper's slopes are about 5–6.5, meaning about 6–7
   hits. Real age-by-age cancer data (CI5-XII, IARC) downloads with no account.

### Decisions (and why)
- **Armitage & Doll as the core.** It's famous, its model is fully published, it
  matches real data, and it is the backbone of the "age stages" idea.
- **The game is the interface, not the project.** Required by the course rules.
- **Hallmarks, immune decline with age, adaptive therapy** go under "where I
  want to take it."
- **Random variation between runs is fine.** Match on average.

### Next steps (proposal due Wed Oct 7, 11:59 pm Eastern)
1. Commit the staged files (Cameron's message). Work from inside the repo from now on.
2. Put the Armitage & Doll 1954 PDF (PMC2007940) and the Hanahan 2026 PDF in
   `papers/`. Check the paper's numbers (Table I slopes, the 4.97–6.48 range,
   ages 25–74, 1950–51 mortality) against the PDF, since the research read a
   garbled scan.
3. Download CI5-XII (cases.csv, pop.csv) to `data/`, after checking its terms of
   use. Record the source in `data/README.md`. Compute one rate by hand.
4. Tutor session on the paper (`learn-with-ai-tutor`).
5. Cameron writes the one-page proposal in their own words. Claude reviews it
   against `course/guidelines.md`.
   - Candidate checks: k = 1 gives a flat rate and k = 2 a linear one; the
     simulation's slope equals k − 1; the CI5 data slopes compared with the
     paper's.
   - The model must be bigger than a formula: a simulated population whose
     cells pick up hits over a lifetime, with sliders.
6. Update `concept.md` to match. After the feedback on Oct 9: write `spec.txt`,
   then build.

---

## 2026-10-06 (evening): checking the paper, getting the data

Run from inside the repo from now on.

### What we did
1. **Committed the first session's files** (Cameron asked Claude to write the
   message this time).
2. **Checked Armitage & Doll against the PDF** (`papers/brjcancer 00386.pdf`,
   notes in `papers/armitage-doll-1954-notes.md`). All the earlier numbers hold:
   the Table I slopes are 4.97–6.48 (nine sites), ages 25–74, deaths in England
   and Wales 1950–51, and only sites with more than 1000 deaths a year. Nothing
   was misread. Found a second result we can check by hand: the circumcision
   risks 0.30, 0.77, 0.98, 1.00 = 1 − ((53 − T)/53)^6.
3. **Downloaded CI5-XII** (summary database) to `data/`. Free for
   non-commercial use, with the source credited. Source, terms and file layout
   are in `data/README.md`. `pop.csv` is person-years over the whole period.
   Hand-checked rate: colon cancer, men, England, ages 60–64 = 6,082 /
   7,188,268 = 846 per million per year.
4. **Updated `concept.md`**: core model section, new candidate checks, and the
   guideline table (paper and data gaps closed).

### Still open
- A&D used deaths (1950–51) and CI5 counts new cases (2013–17), so we compare
  slopes, not exact rates.
- The scientific question is still to be worded by Cameron.

### Tutor session (2026-10-07, done)
Covered: one hit gives a flat rate, rate ∝ t^(r−1), log-log slopes, broken
assumptions (lung), flattening when hits aren't rare, timing of exposure, the
circumcision result. Quiz 4.5/5. Cameron's notes: `notes/armitage-doll-my-notes.md`.
Study item: what "fixed order" means.

### Next steps (proposal due Wed Oct 7, 11:59 pm Eastern)
1. Cameron writes the one-page proposal in their own words. Claude reviews it
   against `course/guidelines.md`.
2. After the feedback on Oct 9: `spec.txt`, then build.

### Proposal brainstorming (2026-10-07)
- Searched for papers with per-cell rules and numbers:
  `research/cell-rules-candidates.md`. The best fits are Luebeck & Moolgavkar
  2002 (4 hits plus dividing cells, fit to US colon data) and Nicholson et al.
  2018 (colon crypts, about 7 stem cells each).
- Design decisions (in `concept.md`): one person is a grid of cells, simulated to
  age 85; each person goes in a table; rates are computed the paper's way. v1 is
  the simplest grid, with independent cells.
- Cameron drafted Q1–Q3 of the proposal in `proposal.md`. The question: can the
  carcinogen's strength (p), which hit it speeds up, and its timing reproduce the
  downward bend in lung cancer in men (Fig. 3 and CI5 England)?
- Checked: CI5 England lung cancer in men does bend down. The slope between
  neighboring age groups is about 8 up to age 64, then 1.9 between 75–79 and 80–84.
- Next: turn `proposal.md` into the one-page submission (due tonight, 11:59 pm
  Eastern). After the feedback on Oct 9: `spec.txt`, then build v1.

### Proposal reviews and revision (2026-10-07, evening)
- Ran proofreading, writing-simple-style and a four-reviewer editor-review on
  `proposal.md` (all in `reviews/`). Ratings: 2 weak reject, 2 weak accept.
  Main points: Q1 was a goal, not a question, and a carcinogen that only *starts*
  steepens the curve instead of bending it down.
- Claude made the easy fixes: paper and data moved first, hit/r/CI5 defined,
  conditions added to the checks, p scaled up, a bend check with a control.
  Cameron rewrote Q1 as a question: can p, which hit is sped up, and when
  exposure starts **and stops** produce the downward bend in lung cancer in
  men (Fig. 3, CI5 England)?
- Learned: stopping exposure is what bends the line down (quitting smoking;
  the paper says the same about the cervix, p. 7). Saturation alone flattens it
  only slowly (slope 4.0 → 2.6 at r = 7, p = 0.05).

### Next steps
1. Paste the proposal into Google Docs and submit (due Oct 7, 11:59 pm Eastern).
   Optional: fix "interesting results" and "resulting proposal or paper" in Q2.
2. After the feedback on Oct 9: `spec.txt`, then build v1 (independent cells,
   slope = r − 1 check).

## 2026-10-09: build journal, language, v1 spec

- Build journal set up from the course page: `.claude/hooks/save_journal.py`
  and `.claude/settings.json` copy every session into `journal/` (commit
  318ee8f, pushed). Scanned for keys and passwords: none.
- Staff feedback on the proposal: no changes asked for.
- Language: Cameron dropped the Python rule (use what fits the goals). The app
  must run on the web, so the model is JavaScript (`web/model.js`, tests with
  node), like the spatial-games project. `CLAUDE.md` updated.
- Drafted `spec.txt` for v1: independent cells, no carcinogen, a seeded random
  generator, rates per five-year group, log-log slope, and an exact formula
  (Binomial) to compare the simulation against. Hand-check numbers verified
  separately (e.g. N = 1, r = 2, p = 0.5 gives 0.1625 and 181/960).
- Found: with r = 4, p = 0.005 the exact slope is 2.84, not 3 (hits aren't
  perfectly rare); p = 0.002 gives 2.99 but only about 56 cases in 20,000 people.

### Next steps
1. Cameron reads `spec.txt` and answers its five DECISIONS.
2. Then build v1 one function at a time, starting with `makeRng`, each with
   tests (test-every-function).

### Spec decisions (2026-10-09, later)
- Cells per person: 100, as a stand-in. Real colon counts are about 1e8.
  With independent cells, fewer cells with a larger p gives almost the same
  curve. People: 20,000 now, about 100,000 later.
- Rate = cases / exact person-years (like CI5).
- Each run reports slope, R squared and a z-score per age group. R squared
  alone can't catch a wrong slope. Pass lines get measured over 20 seeds.
- Option b: v1 uses a scaled-up p, plus a real-numbers check from the
  formula. With 1e8 cells, p = 1.4e-6/yr and r = 6, lifetime risk is about
  3e-19, so the pure model gives essentially no cancer. That's why dividing
  cells are needed (Luebeck & Moolgavkar), and it goes in the discussion.
- Found an arithmetic trap: 1 - P(fewer than 6) gives 3.3e-15 when the true
  value is 3.29e-27. The spec says to sum directly and use log1p/expm1.

### First code: v1 model functions (2026-10-09, evening)
Built in `web/model.js`, one function at a time, each with tests in
`web/model.test.js` (81 tests, all pass: `cd web && node model.test.js`).
Each function was also run with planted bugs to confirm the tests catch them.
- `makeRng(seed)`: seeded random numbers.
- `stepCell`: one year for one cell (hit if rand() < p, fixed order, stops at r).
- `simulatePerson`: N cells, ages 0-84, returns the first age any cell reaches r.
- `simulatePopulation`: M people from one generator, checks inputs. The default
  run (20,000 x 100 cells) takes about 1.5 s.
- `ageGroupRates`: 17 five-year groups, exact person-years.

**Bug found and fixed: the first generator (mulberry32) was biased.** The
default run gave 1,853 cancers when 1,753 were expected (z = 2.5), and 40 more
seeds were also high (z = 3.3). A separate Python simulation matched the
formula, and so did the model with `Math.random`. Over 30 million cells,
mulberry32 gave too few cells with 0 hits (z = -9.6). Each single number was
fine; the problem only showed up across 85 numbers in a row. Switched to sfc32
(all |z| < 2 on the same check). The check is kept in `web/rng-check.js`
(about 10 s). Lesson: passing simple tests on single numbers doesn't prove the
generator is right for this use.

**First graph:** `output/v1-rates.svg` (made by `web/plot-rates.js`). Simulated
rate vs age on log-log axes, with a dashed slope-3 (= r - 1) guide line. From
age 20 up the points follow the line; groups 0-4 and 5-9 have no cases, and
10-19 have 1 each (noise). Hand check: 60-64 = 160 / 97,187 = 164.6 per 100,000.

### Next steps
1. `fitLine` / `logLogFit` (slope and R squared), then `expectedRates` with
   the log1p/expm1 care from the spec, then `zScores` and `runReport`.
2. Add the exact formula's curve to the graph next to the simulation.

## 2026-10-30: schedule check, report design, fitLine

- Schedule check against course/guidelines.md: checkpoint 2 is today; first
  version live on the web by Nov 20. Not started yet: v1 part 2, v2
  (carcinogen), v3 (page). No sessions between Oct 9 and today.
- Deploy plan (Cameron): Vercel, about Nov 16-17, a few days before the
  Nov 20 deadline to leave time for fixes. Spec order kept (v1 -> v2 -> v3).
- Learned: least squares as projection (Cameron's 21-241 view: the error
  vector y - A x-hat is the shortest possible). The Binomial distribution:
  chances for each number of hits in t yes/no years; cancer = AT LEAST r
  hits (t = 3, p = 0.5, r = 2: 4/8, not 3/8; r = 1: 7/8). R squared = how
  straight, not whether the slope is right. z = miss / sqrt(expected).
- Report design decided (spec.txt items 9-10): all 17 groups in the table,
  marked "under 25" / "0 cases" when left out of the slope; z keeps its sign;
  colors plain / yellow (2-3) / red (> 3), no green; a z-vs-age plot.
- Cameron's rule (spec item 10): every output also gets a "what could fool
  us here" check. Example: small z everywhere can still hide a bend. Possible
  check for that: sum of z squared (17 groups at z = +1.5 -> 38, noise -> ~17).
- Built `fitLine` (26 new tests, 107 total, all pass). Flat y: R squared = 1
  with a note (Cameron's choice (a)); the note must show on report and graph.
  6 planted bugs, each caught. The 4 "throws" tests passed before fitLine
  existed (missing function throws too); the planted bugs check them properly.
- Found: rates flat "in principle" but off in the 17th digit
  (0.1, 0.10000000000000002, 0.1) give R squared 0, not 1. Decide a
  tolerance when building logLogFit.

### Next steps
1. `logLogFit`, deciding the flat-rate tolerance.
2. `expectedRates` (sum the top of the Binomial; log1p/expm1), `zScores`,
   `runReport`, then the exact curve on the graph.

## 2026-11-02: build journal update, logLogFit

- Build journal updated to the course's current setup (course page
  project/journal/): new save_journal.py (adds journal/readable/ and Codex
  logs), git pre-commit hook. settings.json already matched. Committed and
  pushed by Cameron ("Set up build journal").
- Learned: a power law (rate = c x age^k) is straight on log-log axes, slope
  k; an exponential is straight on log(rate) vs age. A&D is a power law: per
  10 years, age^3 grows 3.4x at 20 -> 30 but only 1.5x at 70 -> 80.
  Slope 5 -> doubling age multiplies the rate by 2^5 = 32.
- Spec v3: added a second graph, plain rate vs age (Cameron's idea).
- logLogFit decisions (Cameron): the caller picks the age groups; returns
  used / skipped counts; throws for age <= 0 or a negative rate; skips rates
  of 0 or null. Natural log.
- Built logLogFit: 25 new checks, 132 total, all pass.

### Next steps
1. REMINDER (Cameron asked): look at the logLogFit checks again before
   moving on. The 6 throws checks passed even before logLogFit existed, so
   plant bugs (e.g. remove the age <= 0 check, drop the rate but not its
   age) and make sure each one is caught.
2. Flat-rate tolerance still open: rates like 0.1, 0.10000000000000002, 0.1
   give R squared 0, not 1. Decide when building expectedRates (where such
   rates first come up).
3. `expectedRates`, `zScores`, `runReport`, then the exact curve on the graph.

## 2026-11-04: planted bugs in logLogFit, checkThrows, expectedRates plan

- Reminder from 11-02 done: planted 10 bugs in copies of logLogFit (no
  length / age / negative-rate check, age < 0 instead of <= 0, null not
  skipped, rate dropped but age kept, log10, x and y swapped, no log on age,
  skipped always 0). All 10 caught. No bugs found in logLogFit itself.
- Weakness found in the test helper: checkThrows passed on ANY error, so a
  typo in a test ("logLogfit is not defined") or an input that trips a
  different check first passed for the wrong reason.
- Fixed (Cameron chose option A): checkThrows(name, fn, words) now requires
  the error message to contain `words`; missing or empty words is a FAIL.
  7 new checks test the helper itself (it must reject wrong words, a typo
  crash, no throw, empty words). With only the helper changed, all 24 old
  throws tests failed ("no expected words given"); with words added, all 24
  pass, so none had been passing on the wrong error. 139 tests, all pass.
- Learned for expectedRates: S(t) for one cell (r = 2, p = 0.5: S(2) = 3/4);
  N independent cells multiply (N = 2: S(2) = 9/16, S(3) = 1/4); the rate
  divides by the people still at risk ((S(2) - S(3)) / S(2) = 1/3, checked a
  second way by listing histories); the 16-digit trap (1 - 0.999...9 with 17
  nines gives 0, not 1e-17).
- Spec: a third arithmetic rule (found today, checked by running it):
  S(g) - S(g+5) rounds to 0 for realistic numbers (gave 0 instead of 2e-19),
  so the top of the rate uses F(t) = 1 - S(t) = -expm1(N log1p(-q)).
- Decisions (Cameron): build cellDoneChance(t, r, p) first as its own tested
  helper; expectedRates returns the same shape as ageGroupRates.
- Realistic settings matter, not just the defaults: the research question
  compares with real CI5 data, and v3 sliders reach tiny chances.

### Next steps
1. Open check question: C(5, 3) by the product rule, then by counting.
2. cellDoneChance: tests, function, planted bugs.
3. expectedRates: tests (13/57, 181/424, p = 0, p = 1, r = 1, tiny case),
   flat-rate tolerance decision at the r = 1 test, function, planted bugs.
4. zScores, runReport. Checkpoint Nov 10; first version on the web by Nov 20.

## 2026-11-07: cellDoneChance, expectedRates, flat-rate threshold

- Pace: Cameron asked to move at double speed (whole function per step:
  tests, code, planted bugs), with the schedule in mind (deploy ~Nov 16-17,
  web deadline Nov 20; v2 and v3 not started).
- Built cellDoneChance(t, r, p) = P(Binomial(t, p) >= r), summed from the top,
  C(t, j) built step by step. 19 checks: coin cases 4/8, 7/8, 1/4, 1/8;
  t=4 r=2 p=0.1 -> 0.0523 (exact 523/10000); t=85 r=43 p=0.5 -> 1/2 by
  symmetry; the trap case 3.2928e-27 (hand, and exact Python fractions).
  New helper checkRelClose: checkClose's 1e-9 would accept 0 for 3.3e-27.
  Planted bugs: 8 of 9 caught; the 9th (removing the r > t shortcut) changes
  nothing, since C(t, t+1) comes out as 0. The trap bug is caught ONLY by the
  tiny-number test. My first run wrongly planted 2 bugs in simulatePopulation
  (same text earlier in the file); caught by reading which tests failed.
- Built expectedRates(N, r, p): S and F for ages 0-85, top from F, same shape
  as ageGroupRates. Checks: 13/57, 181/424 (spec), N=2 -> 247/745, r=1 -> 0.1
  everywhere, p=0, p=1 edges, the 1e-19 trap case (Python, 80-digit decimals).
- Bug found by the p = 1 test: the mirror image of the trap. q came out as
  0.9999999999999999 (or 1.0000000000000002), so S = 1 - q became noise; group
  10-14 got rate -2 (or NaN). Happens even at p = 0.5 at old ages.
  DECIDED (Cameron, option B, "simpler, minimal losses"): cap q at 1; S below
  1e-12 -> 0 and F -> 1. Measured noise 8.9e-16, so 1e-12 is ~1,000x above it.
  Tests: no negative cases/rates in 6 settings; a real S of 3.7e-11 is kept.
  11 planted bugs, all caught.
- Flat-rate tolerance DECIDED (Cameron): fitLine treats y values within 1e-9
  as flat (R squared 1 with note). r = 1 rates through logLogFit gave R squared
  0.61 before; log noise ~8e-12. Tests pin it from both sides (spread 2e-9 is
  still a real fit, R squared 0.25). 3 planted bugs, all caught.
- 202 tests, all pass.

### Next steps
1. zScores, runReport (v1 done after these).
2. Decide what the Nov 20 web version must include (check course/guidelines.md).
3. v2: the carcinogen (answers the research question). v3: the page.

## 2026-11-09: zScores, runReport, report.js (v1 code complete)

- Schedule notes: TA check-in window (5%) closes Nov 13; the course journal
  page lists a checkpoint Nov 10, course/guidelines.md says Nov 20.
- zScores(simulated, expected, M): z = (sim - M x casesPerPerson) / sqrt(...),
  sign kept. DECIDED (Cameron): expected 0 -> z null, "expected 0" (red
  "impossible" if cases appeared anyway); "few cases" below 10 expected.
  10 was MEASURED, not the usual rule of thumb 5: small counts are lopsided
  (expected 0.5: yellow 4x, red 11x the bell-curve rate) and can't go below
  z = -3 (expected 2: lowest -1.41); from 10 up yellow is 1.2x and z reaches
  -3.16. 20 checks, 10 planted bugs caught ("M ignored" caught only by the
  one M = 4,000 test: the hardcoded-answer trap).
- Cameron asked: "if z is null, can't a young kid slip through?" No: z only
  compares counts after the simulation; with r = 6, cancer before age 5 is
  impossible in the simulation itself, and a case there would show red.
  Real children DO get cancer: new LIMITATIONS section in spec.txt (no
  childhood cancer; Knudson's two-hit retinoblastoma, 1971), plus the
  real-numbers limitation from HAND CHECK 8.
- summarizeZ: largest |z| with sign and group, sum of z^2 (Cameron: include
  it). By hand: z 1, -2.5, 0.5 -> 7.5; 12 groups at +1.5 -> 27.
- runReport: simulate, compare, fit both lines; each group says why it is
  left out of the slope; a fit is null with a reason instead of crashing.
- Mistake found by the spec's 2.84 test: I had used middle age 27 for group
  25-29 (exact slope 2.811). The Oct 9 script (found in journal/) used 27.5.
  DECIDED (Cameron): start + 2.5, since group 25-29 covers ages 25.0-30.0,
  like CI5. Exact slope now 2.841. Spec item 6 updated. 9 planted bugs caught.
- report.js: `node report.js [M N r p seed]` prints the table with colors,
  z bars, notes, slopes and the summary. Default run: simulated slope 2.762
  vs exact 2.841; sum z^2 20.9 (looked high). 10 seeds: sum z^2 averages
  13.0 (noise ~12), so seed 1 was unlucky. Simulated slopes 2.48-3.06,
  average 2.764: 0.08 below exact, about 1.4 standard errors. WATCH in the
  20-seed check.
- 244 tests, all pass.

### Next steps
1. HAND CHECK 6 and 7: 20 seeds, measure the spread of the slope and z's,
   set the pass line, check whether the simulated slope leans below 2.841.
2. Decide what the Nov 20 web version must include; then v2 (carcinogen).
