# Summary
The proposal plans a web simulator of Armitage and Doll's multistage model. Each simulated person is a cellular automaton whose cells collect "hits" at yearly chance p. The user sets p, which hit a carcinogen speeds up, and when the carcinogen starts. The app plots cancer rate against age on log-log axes and is meant to reproduce the curvature of the male lung curve (Fig. 3) and CI5 England data (lines 5-7, 9-11). Three checks are listed: slope equals r-1, a hit-1 burst at age 5 versus 50 differs by about 5,000x, and a one-hit case is flat (lines 14-17). The data and paper are in the repo, and immune cells are deferred (lines 19-29).

# Strengths
- The question is concrete and tied to a measurable output, the log-log slope.
- The rate definition (new cases over people still cancer-free, five-year groups, line 11) matches the paper, so the comparison is like for like.
- Check 3 (one hit, flat rate) is hand-solvable.
- Paper and data are already in the repo, so the "data never arrives" pitfall is avoided.
- The extension is clearly separated from v1 (lines 27-29).

# Weaknesses
## Major
1. **The per-cell grid is probably not needed, and the population size is unaddressed (lines 10-11).** Cells are independent in Armitage and Doll, so a person's cancer time is the first-passage time of one cell lineage, or of a cell count times a per-cell chance. Real rates are tiny: colon in English men at 60-64 is 846 per million per year (data/README.md line 35), and young ages are 10 to 100 times lower. A stable slope needs roughly 100 cases in the youngest five-year bin. At about 5 per million per year, that is about 4 million people. A 1,000-cell grid for each of 4 million people over 85 years will not run in a browser. Choosing p so cancer is common (say 30% lifetime risk) brings this to a few thousand people. That makes the model a scaled stand-in, so the proposal must say the comparison is of shape, not level. The proposal should also say what the grid adds, or defer it.
2. **The checks test only the baseline regime (lines 15-17).** Checks 1 and 3 have no carcinogen. Only check 2 touches timing, and no derivation is given. It names no r, no burst size and no definition of "differ". It is not obvious that a factor of about 5,000 follows from the model. As written it cannot be verified by hand. Nothing checks the bend, which is the stated target of the question (line 7). Slope r-1 holds only while few cases have occurred and p*t is small, so the check needs an age window and a tolerance.
3. **"Show the same curvature" has no criterion (line 7).** There is no fit error, slope-change measure or tolerance, so success would be judged by eye. There is also no control. A run with no carcinogen, and one with a carcinogen at a different hit or time, would show the bend comes from the mechanism and not from the five-year binning or the shrinking denominator. The old-age flattening is also a known artifact risk, since there are few at-risk people in the oldest bins (see Armitage and Doll's own discussion of the fall-off). The proposal should say whether the model or the sampling noise produces it.
4. **The two data sources are different quantities and eras, and the proposal does not say so.** Fig. 3 is 1950-51 mortality. CI5 is 2013-17 incidence (data/README.md lines 40-45 admits this, proposal.md does not). Lung incidence also reflects a smoking history that shifted across cohorts, with a very different carcinogen timing between the two. Neither the cohort effect nor the choice of site (lung, with only the male CI5 curve named) is explained. Say which CI5 site and sex will be fitted.

## Minor
- Scope is tight for Nov 20 if the grid, the web page, presets and a read-the-paper pane all arrive together (line 11). The grid is the part to cut. Three sliders alone is right-sized.
- "TBD" counts (lines 10-11) show the feasibility question in item 1 has not been run. A quick count of cases per bin would settle it.
- The slider for "which hit" is discrete (1 to r), but r itself is not stated (6-7, per line 29?).
- Stating the random seed and number of runs, so the plot is reproducible, would help the checks.

# Rating
Weak reject
