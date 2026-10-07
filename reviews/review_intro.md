# Summary
The proposal builds a web-based simulation of Armitage & Doll's multi-stage model: simulated people accumulate "hits" in cells, and the app plots cancer rate against age on log-log axes. Three sliders (p, which hit a carcinogen speeds up, and how early carcinogens appear) are tuned so the output resembles the bending lung cancer curve for men in Fig. 3 and CI5 England data (line 7). Checks are slope = r - 1, a 5,000x burst comparison, and a one-hit flat case (lines 15-17). The extension is dividing cancer and immune cells (lines 27-29). The data, paper and checks are named and in the repo, which is the main thing the rubric asks for.

# Strengths
- The phenomenon is real and well chosen: a famous older paper, with a checkable core result (slope r - 1, paper pp. 2, 10-11).
- Section 3 has three concrete checks, including one solvable by hand (line 17), which meets the rubric's "at least one concrete check".
- The method (five-year groups, cases over people still cancer-free, log-log, line 11) matches the paper's.
- The extension (Luebeck & Moolgavkar, line 29) is a real follow-on to the 6-7 hit result.

# Weaknesses
## Major
1. **Q1 (line 7) is a goal, not a question.** "I hope my simulation can show the same curvature" states the desired output. A reviewer reading it learns no hypothesis about lung cancer. With three free knobs, producing a downward bend is almost certainly possible (any model whose rate saturates will bend), so "yes it bends" is close to unfalsifiable and teaches nothing. The first sentence (the simulation "will report the log-log slope") is a deliverable, not a question. Say what you want to find out: what mechanism could bend the curve, and which of your variables are needed for it, and what would count as a "no".
2. **The proposal does not engage with the paper's own explanation of the lung bend.** Armitage & Doll attribute the flattening at old ages to generations who smoked fewer cigarettes, and note the effect disappears when mortality is examined by birth cohort (p. 7, with pp. 5-6 on the changing cause for lung). That is a cohort effect on exposure. The listed knobs (p, which hit, "how early carcinogens are introduced", line 7) describe a single person's exposure timing, not differing exposure across birth cohorts. It is unclear whether your model can represent the paper's explanation, test it, or offer a competing one. A natural question (does a cohort-varying exposure reproduce the bend, and does a single-cohort simulation fail to?) is sitting right there but is not asked. Also, lines 7 and 11 do not say whether the simulated population is one cohort or a cross-section of cohorts, which decides the answer.
3. **The jump from reproduction to question is unclear.** Section 3 checks a straight-line result (slope r - 1), but the question is about the non-straight lung site, which the paper treats as outside the model (pp. 5-7). It is not stated how the straight-line checks make a fitted lung curve trustworthy, or what the lung comparison would show beyond fitting.

## Minor
- Title (line 1) says "Cancer Extension on Cellular Automata" and names a method, not a phenomenon or a question. "Extension" of what is unstated. Per line 11, "cellular automaton" plus sliders plus presets ("interesting results") can read as a game or toy; the science framing should lead.
- "Where I want to take it" (lines 27-29) is about dividing and immune cells and is not linked to Q1. Say how it would bear on the curvature or the 6-7 hit puzzle, or it reads as a separate wish list.
- Line 11 mixes in "read my resulting proposal or paper", which is not part of what answers a scientific question.
- Many items are "TBD" (cell and people counts, line 11); fine for a proposal, but the check "5,000x" (line 16) is unexplained (presumably (50/5)^... style; state how it follows).
- The paper's data are 1950-51 mortality, CI5 is modern incidence (data/README.md vs paper p. 2); the comparison caveat is not mentioned.

# Rating
Weak reject
