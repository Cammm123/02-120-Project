# Project concept (working draft)

Status: **draft, expected to change.** Nothing here is final. Every science claim
is unverified until it is checked against the paper and marked with its page.

Source: Hanahan, D. "Hallmarks of cancer—Then and now, and beyond."
*Cell* 189, 2254–2277 (2026).

Mission: convey the hallmarks paper clearly to the player. Every mechanic must
come from the paper. If a mechanic doesn't teach the science, it's cut or changed.

## Core model (decided 2026-10-06)

Reproduce Armitage & Doll (1954), *Br J Cancer* 8:1 (`papers/brjcancer 00386.pdf`,
notes in `papers/armitage-doll-1954-notes.md`). If a cell needs r rare changes in
order, cancer incidence at age t grows like t^(r−1), so log(rate) against log(age)
is a straight line with slope r − 1 (pp. 2, 10). Their Table I slopes are
4.97–6.48 (p. 4), which means about 6–7 changes.

The model is a simulated population whose cells pick up hits over a lifetime,
with sliders, not just the formula. Real data to compare against: CI5-XII
incidence, England 2013–2017 (`data/`).

Decided 2026-10-07:
- One simulation = one person, a grid of cells, year by year from birth to 85
  (the last CI5 age group).
- Store every simulated person in a table (e.g. age at cancer, or none), then
  group into five-year age groups and compute new cases ÷ people still
  cancer-free, the same kind of number as the paper and CI5.
- v1 is the simplest grid: independent cells collecting hits, checked against
  slope r − 1. Then build up: cells that divide (Luebeck & Moolgavkar 2002),
  colon layout (Nicholson et al. 2018), maybe immune cells later. See
  `research/cell-rules-candidates.md`.

The scientific question is still to be worded by Cameron.

## Where I want to take it: the game interface

The game below is only a way to explore the model, never the project itself.

## The idea

A single-player game. The player is an oncologist fighting a "cancer boss"
across stages of one person's life. As the person ages, the boss gains more
hallmarks and the body's own defenses weaken.

## Decisions so far (2026-10-06, all open to change)

- **Player:** the oncologist. The body is an ally whose own defenses act on
  their own and weaken with age.
- **Boss:** pure evolution, with no scripted AI. Its "intelligence" comes only from
  mutation plus selection in a cell population. The game shows the player that
  nobody planned it.
- **Winning a level:** a cure (tumor gone) or control (tumor kept stable and small
  for long enough). This matches adaptive therapy.
- **Stages:** the person's age. Mutations pile up and immune defenses weaken
  with age.
- **Language:** not chosen yet; we'll pick whatever fits the game.

## Candidate mechanics (all unverified)

1. Hallmarks unlock as the boss evolves; the number grows with each age stage.
2. A hallmark codex: each new hallmark gets a plain-language card tied to the
   paper, and that knowledge is needed to beat the level.
3. Each hallmark is paired with a real treatment type. Check against Hanahan's
   figure matching hallmarks to drug types.
4. Biopsy and DNA investigation: tumors are many different groups of cells, and a
   biopsy sees only part of the tumor (incomplete information).
5. Metastasis drives travel: the invasion hallmark seeds other organs.
6. Resilience counter: pre-cancers the body stopped on its own.
7. Treatment resistance: maximum dose selects resistant cells (adaptive therapy).
8. One scientific engine; each level changes its settings. v1 has one organ and
   2 to 3 hallmarks.

## Candidate model checks

- No mutations: no cancer ever appears.
- One hit (r = 1) gives a flat rate; two hits (r = 2) give a rate that grows in a straight line with age.
- The simulated log-log slope equals r − 1.
- CI5 England slopes compared with Table I (4.97–6.48).
- Circumcision check (pp. 8, 12): risks 0.30, 0.77, 0.98, 1.00 from 1 − ((53 − T)/53)^6.
- Maximum constant dose leads to resistant takeover. Adaptive dosing delays it.
- Growth with all defenses off matches logistic growth worked out by hand.

## Course guideline check

Checked against `course/guidelines.md` (2026-10-06, updated after choosing Armitage & Doll).

| Requirement | Status |
|---|---|
| Own GitHub repo | Done |
| All work in Claude Code inside the repo | Starting now (start sessions from the repo folder) |
| Language | No rule stated; the app must run on the web with nothing to install |
| **"No video game" rule** | **Risk:** must be a model answering a question, with the game only as a way to explore it |
| Q1: a scientific question | **Gap:** core is Armitage & Doll; Cameron to word the question |
| Q2: a working model someone can explore, not one figure | Fits if the model comes first |
| Q3: at least one concrete check | Candidates listed above |
| Reproduce a published result (suggested) | Armitage & Doll 1954, Table I slopes (numbers checked against the PDF) |
| Paper and sources in the repo | Done: Armitage & Doll and Hanahan PDFs in `papers/` |
| Data in the repo before proposing | Done: CI5-XII in `data/`, source and terms in `data/README.md` |
| Smallest version first | v1 = one organ, 2 to 3 hallmarks |
| Proposal due Oct 7 | **Tomorrow** |
