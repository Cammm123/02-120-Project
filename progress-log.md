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
