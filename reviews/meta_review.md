# Meta review: proposal.md (2026-10-07)

Panel: four independent reviewers (intro, math, experiments, time-pressed TA).
The literature and first-author panel was skipped because the course does not
grade novelty. "Venue" is the 02-120 proposal rubric (`course/guidelines.md`).
Full reviews are in `reviews/review_*.md`.

## Ratings

| Reviewer | Rating |
|---|---|
| intro | Weak reject |
| experiments | Weak reject |
| TA (visual) | Weak accept, would ask for a revision |
| math | Weak accept |

Consensus: borderline. The rubric items are all present, but the question and
checks need a revision.

## Major

> **Rejection drivers**
> 1. Q1 is a goal ("I hope my simulation can show…"), not a question. (4 of 4)
> 2. The variables in Q1 cannot produce the bend it targets: a carcinogen that
>    *starts* at some age makes the curve steeper, not flatter. (math, intro;
>    verified)

1. **Q1 is not a question (4/4).** Three free knobs tuned until the curve looks
   right make "yes, it bends" nearly guaranteed. No criterion says what result
   would count as "no".
2. **The mechanism doesn't match the bend (2/4, verified).**
   - Armitage & Doll explain the lung deficit at old ages by older generations
     having smoked less (pp. 7–8). That is a difference *between generations*,
     and a single simulated generation can't show it.
   - A carcinogen that switches on at an age raises the later rate, so the line
     gets steeper.
   - A downward bend needs exposure that weakens or stops later in life, or
     several generations with different exposure.
   - Saturation (hits not rare) does flatten the line, but slowly. With r = 7 and
     p = 0.05 the local slopes are 4.0, 3.2 and 2.6 at about ages 40, 60 and 77
     (recomputed). The CI5 England curve instead goes from about 8 to 1.9
     (recomputed earlier).
3. **The checks test only the no-carcinogen baseline (3/4).**
   - Slope = r − 1 is missing its conditions: constant p, rare hits, fixed order
     (pp. 2, 10). As written it contradicts the bend Q1 is after.
   - 5,000× assumes r = 7 and observation at age 60, neither stated. It becomes
     915 at r = 6 and 100,000 at t = 55 (recomputed).
   - A one-year burst changes a rare rate so little that the 5,000× check works
     on exact expected rates, not on random case counts (math).
   - Nothing checks the bend itself, and there is no no-carcinogen control.
4. **Undefined on the page (TA, proofreading).** "Hit", r, "Fig. 3" (whose?),
   CI5 and 5,000× all appear before they are explained.

## Minor

- **Feasibility (experiments, verified).** At real rates, getting 100 lung
  cases in the 25–29 group takes about 3.6 million simulated people. The
  proposal should say that p is scaled up and only the curve's shape is
  compared. The per-cell grid adds nothing while cells are independent.
- **Different data, unacknowledged (experiments).** Fig. 3 is 1950–51 deaths;
  CI5 is 2013–17 new cases.
- **The title and "where I want to take it" don't connect to Q1** (intro).
- **"Same curvature" has no measure** (experiments). Possible measures: slope
  before and after 65, or fit error.

## Recommendations (easiest first)

1. Define hit, r, CI5 and Fig. 3 at first use, and name the paper first.
2. Add the conditions to the slope check, and r and t to the 5,000× check.
3. Say that p is scaled up and the curve's shape is compared.
4. State a measurable target for the bend (for example, the slope after 65
   compared with before), plus a no-carcinogen control.
5. **Decisive:** turn Q1 into a real question whose mechanism can produce a
   downward bend. Exposure that stops or weakens, or a comparison across
   generations, are the candidates; the paper's own explanation is generations.
   This choice belongs to the author.
