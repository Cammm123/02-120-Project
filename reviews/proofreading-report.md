# Proofreading Report — Cancer Extension on Cellular Automata

**Date:** 2026-10-07  
**Source:** proposal.md

The checklist was written for LaTeX research papers. It was adapted for a
one-page markdown course proposal: checks that need an abstract, a contribution
list, LaTeX math or figures were skipped, and first-person "I" is accepted
because this is a single-author proposal. Findings only; the text is not
rewritten.

---

## Scorecard

| # | Check                   | Errors | Warnings | Info | Total |
|---|-------------------------|--------|----------|------|-------|
| 1 | Abbreviations           | 1      | 1        | 1    | 3     |
| 2 | Math Symbols & Notation | 0      | 2        | 2    | 4     |
| 3 | Introduction Structure  | 0      | 2        | 1    | 3     |
| 4 | Grammar & Style         | 0      | 3        | 4    | 7     |
| 5 | Figures & Tables        | 0      | 0        | 0    | 0     |
| 6 | Statistical Relevance   | 0      | 1        | 0    | 1     |
|   | **Total**               | **1**  | **9**    | **8**| **18**|

---

## Overall Assessment

The proposal answers all three required questions, names its paper and data,
and its checks are concrete and hand-checkable, which is its strongest part.
The main weaknesses are ordering and precision: the reader meets "Fig. 3",
"CI5" and "the paper" before learning what they are, and two of the three
checks leave out the conditions under which their numbers hold. Question 1 is
one long sentence and is not phrased as a question.

### Top Issues to Address

1. **[ERROR] Check 1.3** — "CI5" is used in Q1 before it is introduced.
2. **[WARN] Check 3** — "Fig. 3" and "the paper" are referenced before the paper is named (it only appears at the end).
3. **[WARN] Check 2** — The 5,000× check omits the conditions it depends on (7 hits, cancer observed at age 60).
4. **[WARN] Check 2** — The slope = r − 1 check holds only without a carcinogen and with rare hits; as written, the Q1 experiments would "fail" it.
5. **[WARN] Check 3** — Q1 is a statement of intent, not a question; the assignment asks "What is your scientific question?"
6. **[WARN] Check 4** — Q1 is a single 70-word sentence.

---

## 1. Abbreviations

**Summary:** One abbreviation is used before it is introduced, and one is used alongside its spelled-out form.

### Findings

- [ERROR] proposal.md:7 — "CI5" used before introduction; the full name appears only on line 24, and without "(CI5)".
  > in Fig. 3 and in the CI5 England data
  Suggestion: introduce the full name with "(CI5)" at first use, or move the data line before Q1.
- [WARN] proposal.md:11 — "to-be-decided" and "TBD" both appear in the same paragraph.
  > a to-be-decided number of cells … a TBD number of people
  Suggestion: pick one form.
- [INFO] proposal.md:24 — "IARC" is never spelled out (International Agency for Research on Cancer).
  > Vol. XII (IARC), summary database

---

## 2. Math Symbols & Notation

**Summary:** p and r are both defined at first use. Two checks state numbers without the conditions that make them true.

### Findings

- [WARN] proposal.md:15 — The slope check needs its condition: slope = r − 1 holds only with constant p (no carcinogen) and rare hits (Armitage & Doll, p. 10).
  > The slope of the graph should equal r − 1 (r = number of hits).
  Suggestion: state the condition in the same line.
- [WARN] proposal.md:16 — 5,000× depends on r = 7 and on cancer being observed at age 60 ((60−5)⁵ / (60−50)⁵); "differ" does not say what quantity differs.
  > A hit-#1 burst at age 5 vs. 50 should differ by about 5,000×.
  Suggestion: name the quantity (the cancer rate at age 60) and the number of hits.
- [INFO] proposal.md:7 — "variable p" is singular, but the model has one p per hit (p₁ … p_r). Say whether all hits share one p or the slider changes only the targeted hit.
- [INFO] proposal.md:17 — The 1-hit case could be paired with the 2-hit case (rate grows in proportion to age), which is just as easy to check by hand.

---

## 3. Introduction Structure

**Summary:** Abstract, contribution and roadmap checks do not apply to a proposal. Two ordering problems remain, plus the question form.

### Findings

- [WARN] proposal.md:7, 11 — "Fig. 3" (line 7) and "the paper" (line 11) are referenced before the paper is named on line 21.
  > the lung cancer curve for men in Fig. 3
  Suggestion: name Armitage & Doll (1954) at first mention, or put the paper/data section first.
- [WARN] proposal.md:7 — Q1 is a statement of what the simulation will do and what I hope it shows, not a question; there is no question mark.
  > I hope my simulation can show the same curvature
  Suggestion: phrase it as a question that the simulation answers.
- [INFO] proposal.md:7 — No sentence says why the bend matters (for example, what it would tell us about lung cancer). Optional for a one-page proposal.

---

## 4. Grammar & Style

**Summary:** American English throughout and the Oxford comma is used correctly. The main issues are one very long sentence and two ambiguous phrases.

### Findings

- [WARN] proposal.md:7 — One 70-word sentence carries three variables, two data sources and the goal.
  Suggestion: split it into two or three sentences.
- [WARN] proposal.md:7 — Missing article.
  > By playing with variable p
  Suggestion: "the variable p".
- [WARN] proposal.md:11 — "over 85 years" can be read as "older than 85".
  > I will simulate a TBD number of people over 85 years
  Suggestion: "from birth to age 85".
- [INFO] proposal.md:7 — "lung cancer curve" is a compound adjective before a noun ("lung-cancer curve"); optional in plain usage.
- [INFO] proposal.md:11 — "presets that produce interesting results" and "my resulting proposal or paper" are vague; name what the presets show and what the reader will read.
- [INFO] proposal.md:7, 21 — Curly quotes (“hit”) and straight quotes ("The age …") are mixed; harmless once pasted into Google Docs.
- [INFO] proposal.md:7, 11 — First person "I" would be an error in a research paper; it is appropriate for a single-author course proposal.

---

## 5. Figures & Tables

**Summary:** The proposal has no figures or tables of its own. The reference to the external Fig. 3 is covered under Check 3.

### Findings

No issues found.

---

## 6. Statistical Relevance

**Summary:** The simulation is random, so its slopes and ratios will vary from run to run, but the proposal does not say how that variation will be handled.

### Findings

- [WARN] proposal.md:11, 16 — "a TBD number of people" with no mention of repeated runs or spread. Rare cancers need many simulated people; the 5,000× and slope checks will only match within some tolerance.
  Suggestion: say that the checks are compared on averages over repeated runs, with a stated tolerance.
