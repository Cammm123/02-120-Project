# Cancer Extension on Cellular Automata

Cameron Kani · 02-120 Programming for Scientists · 10/7/26

## Paper and data

- Paper: Armitage, P. and Doll, R. (1954). "The age distribution of cancer and a
  multi-stage theory of carcinogenesis." *British Journal of Cancer* 8(1):1–12.
  In the repo: `papers/brjcancer 00386.pdf`. Their model: a cell becomes cancer
  after r rare changes ("hits") in a fixed order, which makes the cancer rate grow
  like age^(r−1). Their Fig. 3 shows cancers, such as lung cancer in men, whose
  curves bend away from this straight line at old ages.
- Data: Cancer Incidence in Five Continents (CI5), Vol. XII, from the
  International Agency for Research on Cancer (IARC), summary database, in
  `data/` (source and terms in `data/README.md`). Fig. 3 counts deaths in
  1950–51, while CI5 counts new cases in 2013–17, so I compare the shapes and
  slopes of the curves rather than exact rates.

## 1. Scientific question

My simulation will measure the log-log slope of cancer rate against age, with the variable p measuring the chance per year of getting the hit that the carcinogen speeds up. Can changing p, which hit gets sped up, and when exposure starts and stops produce the downward bend and flattening at old ages seen in the lung cancer curve for men in Fig. 3 and in the CI5 England data?

## 2. What I will build

Each simulated person will be a cellular automaton with a to-be-decided number of cells, starting with regular cells that collect hits. I will simulate a to-be-decided number of people from birth to age 85 and store each person’s results in a table. Real cancers are rare, so I will scale p up to get enough cases from a number of people a browser can handle, and compare the shape of the curve. Using that table, I will make a graph of the cancer rate against age (new cases in each five-year age group divided by the people still cancer-free in that group, on log-log axes), following the same method used in the paper so I can compare the curves.

The user can change these variables with sliders: p, which hit the carcinogen speeds up, and when exposure starts and stops. This will run on a web page where users can run simulations, try presets that produce interesting results, and read my resulting proposal or paper.

## 3. How I will check it

- With no carcinogen (p constant) and rare hits, the slope of the graph should equal r − 1 (r = number of hits).
- With r = 7 hits and cancer measured at age 60, a hit-#1 burst at age 5 should raise the cancer rate about 5,000× more than the same burst at age 50, since (55/10)^5 ≈ 5,000. I will compare this using expected rates, because one short burst changes a rare rate very little.
- A case solved by hand: with 1 hit, the rate is flat.
- The bend: a control run with no carcinogen should give a straight line. I will measure the bend as the slope before age 65 compared with after, and compare it with CI5 England lung cancer in men, where the slope falls from about 8 before 65 to about 2 between 75–79 and 80–84.

## Where I want to take it

Add cancer and immune cells, with different rules for each type, and cells that divide and pass their hits on to their copies (Luebeck & Moolgavkar 2002, PNAS 99:15095, who fit colon cancer with 4 hits plus dividing cells instead of 6–7 hits).
