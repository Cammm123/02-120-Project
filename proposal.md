# Proposal (draft, Cameron's words)

## 1. Scientific question

My simulation will report the log-log slope of cancer rate against age. By playing with variable p (the chance per year of getting a “hit”), which hit the carcinogen speeds up (for example, hit #1 or hit #6), and how early carcinogens are introduced into the environment, I hope my simulation can show the same curvature as the lung cancer curve for men in Fig. 3 and in the CI5 England data, especially its downward bend and flattening at old ages.

## 2. What I will build

Each simulated person will be a cellular automaton with a to-be-decided number of cells, starting with regular cells that collect hits. I will simulate a TBD number of people over 85 years and store each person’s results in a table. Using that table, I will make a graph of the cancer rate against age (new cases in each five-year age group divided by the people still cancer-free in that group, on log-log axes), following the same method used in the paper so I can compare the curves. The user can change three variables with sliders: p, which hit the carcinogen speeds up, and how early carcinogens are introduced into the environment. This will run on a web page where users can run simulations, try presets that produce interesting results, and read my resulting proposal or paper.

## 3. How I will check it

- The slope of the graph should equal r − 1 (r = number of hits).
- A hit-#1 burst at age 5 vs. 50 should differ by about 5,000×.
- A case solved by hand: with 1 hit, the rate is flat.

## Paper, data, and where I want to take it

- Paper: Armitage, P. and Doll, R. (1954). "The age distribution of cancer and a
  multi-stage theory of carcinogenesis." *British Journal of Cancer* 8(1):1–12.
  In the repo: `papers/brjcancer 00386.pdf`.
- Data: Cancer Incidence in Five Continents, Vol. XII (IARC), summary database,
  in `data/` (source and terms in `data/README.md`).

- Where I want to take it: add cancer and immune cells, with different rules for each type,
  and cells that divide and pass their hits on to their copies (Luebeck & Moolgavkar 2002,
  PNAS 99:15095, who fit colon cancer with 4 hits plus dividing cells instead of 6–7 hits).
