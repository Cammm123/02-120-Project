# Game concept (working draft)

Status: **draft, expected to change.** Nothing here is final. Every science claim
is unverified until it is checked against the paper and marked with its page.

Source: Hanahan, D. "Hallmarks of cancer—Then and now, and beyond."
*Cell* 189, 2254–2277 (2026).

Mission: convey the hallmarks paper clearly to the player. Every mechanic must
come from the paper. If a mechanic doesn't teach the science, it's cut or changed.

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
- Cancer rate against age has the multiple-hits (Armitage & Doll) slope.
- Maximum constant dose leads to resistant takeover. Adaptive dosing delays it.
- Growth with all defenses off matches logistic growth worked out by hand.

## Course guideline check

Checked against `course/guidelines.md` (2026-10-06).

| Requirement | Status |
|---|---|
| Own GitHub repo | Done |
| All work in Claude Code inside the repo | Starting now (start sessions from the repo folder) |
| Language | No rule stated; the app must run on the web with nothing to install |
| **"No video game" rule** | **Risk:** must be a model answering a question, with the game only as a way to explore it |
| Q1: a scientific question | **Gap:** a game isn't a question yet |
| Q2: a working model someone can explore, not one figure | Fits if the model comes first |
| Q3: at least one concrete check | Candidates listed above |
| Reproduce a published result (suggested) | **Gap:** Hanahan is a review with no single result to reproduce; pair it with a model paper |
| Paper and sources in the repo | Add the Hanahan PDF |
| Smallest version first | v1 = one organ, 2 to 3 hallmarks |
| Proposal due Oct 7 | **Tomorrow** |
