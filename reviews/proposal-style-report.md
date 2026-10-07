# Writing Style Report — Cancer Extension on Cellular Automata

- **Date:** 2026-10-07
- **Source:** proposal.md
- **Scope:** Whole document, 5 sections, 6 paragraphs (one page)
- **Depth:** medium
- **Basis:** The Elements of Style (Strunk, 1918) and ISO 24495-1 / ISO 24495-3 plain language

**Deviation from the skill:** the proposal is graded and must stay in the author's own
words, so the fixes after → say *what* to change rather than supplying replacement
sentences. Issues already in `reviews/proofreading-report.md` (CI5 before introduction,
the 70-word Q1 sentence, "the variable p", "over 85 years", missing check conditions) are
only cross-referenced here.

---

# Summary

Reader: course TAs and the instructor, grading the proposal against the three required
questions. Purpose: convince them that the question is scientific, the build is a model
someone can explore, and the checks are concrete. Both were given by the author, not
inferred. The writing already does a lot right: it is in the active first person
throughout, so it is always clear who does what, each section answers exactly one
required question, and the checks use specific numbers (r − 1, 5,000×, a flat rate).

**Issues to address**

1. The main experimental variable is named three different ways: "how early carcinogens
   are introduced into the environment" (¶2, ¶3) and "a hit-#1 burst at age 5" (¶4). A
   grader cannot tell whether exposure starts at an age and continues, or is a short burst
   (3 occurrences).
2. "Simulation" means two different things: the whole model ("my simulation", ¶2 ×2) and
   one run ("users can run simulations", ¶3) (3 occurrences).
3. Vague or informal wording where a specific word exists: "playing with" (¶2),
   "interesting results" and "my resulting proposal or paper" (¶3), "a to-be-decided /
   TBD number" (¶3) (4 occurrences).

---

## Marking scheme

| Tag | Meaning | How the span is marked |
|-----|---------|------------------------|
| ‹struct› | sentence structure — order, splitting, parallelism, emphasis | **bold** |
| ‹voice› | voice and attribution — who is doing what | **bold** |
| ‹cut› | needless words | ~~struck through~~ |
| ‹term› | ill-defined or inconsistent term | `monospace` |
| ‹word› | word used incorrectly | **bold** |

---

## Paragraph 1 — `proposal.md:1-3`

> Cancer Extension on Cellular Automata
>
> Cameron Kani · 02-120 Programming for Scientists · 10/7/26

### General paragraph comments

The title names the method (cellular automata) but not the phenomenon or the question.
A grader reading only the title would not guess that the project is about how cancer
rates rise with age. Consider a title that names what is studied, for example the age
curve or the multi-stage hits; the choice of words is yours.

---

## Paragraph 2 — `proposal.md:7`

> My simulation will report the log-log slope of cancer rate against age. By playing with variable p (the chance per year of getting a “hit”), which hit the carcinogen speeds up (for example, hit #1 or hit #6), and how early carcinogens are introduced into the environment, I hope my simulation can show the same curvature as the lung cancer curve for men in Fig. 3 and in the CI5 England data, especially its downward bend and flattening at old ages.

### General paragraph comments

One topic (what the simulation measures and what it should reproduce), and the topic
sentence comes first. Sentence 2 carries three variables, two data sources and the goal
at once; see the proofreading report for the length.

### Per-sentence comments

By **playing with** ‹word› variable p (the chance per year of getting a “hit”), which hit the carcinogen speeds up (for example, hit #1 or hit #6), and `how early carcinogens are introduced into the environment` ‹term›, I hope ~~my simulation~~ ‹cut› can show the same curvature as the lung cancer curve for men in Fig. 3 and in the CI5 England data, especially its downward bend and flattening at old ages.

- ‹word› "Playing with" is informal and does not say what you do to the variables. → Use a verb that says you set or vary them.
- ‹term› This phrase names the third variable, but "introduced into the environment" describes the world, not the simulated person, and it does not say whether exposure stops. ¶4 then calls it a "burst". → Name it once, precisely (the age exposure starts, and how long it lasts), and use that same name in ¶3 and ¶4.
- ‹cut› "my simulation" already opens the paragraph; the second one can become "it" (2 → 1 words).

---

## Paragraph 3 — `proposal.md:11`

> Each simulated person will be a cellular automaton with a to-be-decided number of cells, starting with regular cells that collect hits. I will simulate a TBD number of people over 85 years and store each person’s results in a table. Using that table, I will make a graph of the cancer rate against age (new cases in each five-year age group divided by the people still cancer-free in that group, on log-log axes), following the same method used in the paper so I can compare the curves. The user can change three variables with sliders: p, which hit the carcinogen speeds up, and how early carcinogens are introduced into the environment. This will run on a web page where users can run simulations, try presets that produce interesting results, and read my resulting proposal or paper.

### General paragraph comments

At 136 words, this paragraph covers two topics: the model (sentences 1–3) and the app
around it (sentences 4–5). A split before "The user can change" would let each start with
its own topic sentence. The sentences develop in a clear order: person, population,
table, graph.

### Per-sentence comments

Each simulated person will be a cellular automaton with a **to-be-decided** ‹word› number of cells, starting with regular cells that collect hits.

- ‹word› "to-be-decided" here and "TBD" in the next sentence are two forms of one idea (also in the proofreading report). → If you have even a rough starting number, a number is more concrete than "to be decided". Otherwise use one form.

Using that table, I will make a graph of the cancer rate against age (new cases in each five-year age group divided by the people still cancer-free in that group, on log-log axes), ~~following the same method used in~~ ‹cut› the paper so I can compare the curves.

- ‹cut› The parenthesis already states the method, so "following the same method used in the paper" can shrink to a short reference to the paper's method (8 → about 3 words).

The user can change three variables with sliders: p, which hit the carcinogen speeds up, and `how early carcinogens are introduced into the environment` ‹term›.

- ‹term› Same variable as in ¶2 and ¶4, named inconsistently. → Use the one name you choose for ¶2.

This will run on a web page where users can run `simulations` ‹term›, try presets that produce **interesting results** ‹word›, and read **my resulting proposal or paper** ‹word›.

- ‹term› "Simulation" means the whole model in ¶2 and one run here. → Pick a word for one run (a run, one population) and keep "simulation" for the model.
- ‹word› "Interesting results" is vague scale (Strunk 12). → Say what a preset shows, for example a straight line versus a bend.
- ‹word› "my resulting proposal or paper" leaves unclear what the reader will actually find. → Name it (for example, an explanation of the model and its checks).

---

## Paragraph 4 — `proposal.md:15-17`

> - The slope of the graph should equal r − 1 (r = number of hits).
> - A hit-#1 burst at age 5 vs. 50 should differ by about 5,000×.
> - A case solved by hand: with 1 hit, the rate is flat.

### Per-sentence comments

A `hit-#1 burst` ‹term› at age 5 vs. 50 should **differ** ‹word› by about 5,000×.

- ‹term› "Burst" is a short exposure, but ¶2 and ¶3 describe when exposure *starts*. A reader cannot tell whether the slider and this check use the same kind of exposure. → Use the name from ¶2, or say that this check uses a short burst.
- ‹word› "Differ" does not say what differs (the proofreading report gives the missing conditions). → Name the quantity.

---

## Paragraph 5 — `proposal.md:21-25`

> - Paper: Armitage, P. and Doll, R. (1954). "The age distribution of cancer and a
>   multi-stage theory of carcinogenesis." *British Journal of Cancer* 8(1):1–12.
>   In the repo: `papers/brjcancer 00386.pdf`.
> - Data: Cancer Incidence in Five Continents, Vol. XII (IARC), summary database,
>   in `data/` (source and terms in `data/README.md`).

*No issues found.*

---

## Paragraph 6 — `proposal.md:27-29`

> - Where I want to take it: add cancer and immune cells, with different rules for each type,
>   and cells that divide and pass their hits on to their copies (Luebeck & Moolgavkar 2002,
>   PNAS 99:15095, who fit colon cancer with 4 hits plus dividing cells instead of 6–7 hits).

*No issues found.*

---

## Not assessed

This review covers running prose only. A clean report does not imply the following are in
order:

- Ethical presentation of content (ISO 24495-3 §5.1.6)
- Figures, images, data displays and table design (§5.3.4–5.3.7)
- Abbreviation introduction, math notation, citation consistency: see
  `reviews/proofreading-report.md`
- Checks outside the seven priority rules. This was a medium review; run it at full depth
  for the complete set.
- Terminology against published ISO standards: not run at medium depth.
- **Usability testing with real readers (ISO 24495-1 §5.4.3).** ISO treats an author's own
  review as the §5.4.2 step only. The standard is explicit that the sole way to learn how
  readers react is to involve them. This report does not replace that.
