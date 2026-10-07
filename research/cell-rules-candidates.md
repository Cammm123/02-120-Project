# Papers with per-cell rules and numbers (searched 2026-10-07)

For a grid simulation (cells of one person over a lifetime). C = checked in the
primary source by the search; U = unconfirmed, do not use until read directly.

## 1. Luebeck & Moolgavkar 2002, PNAS 99(23):15095–100 (best fit)
"Multistage carcinogenesis and the incidence of colorectal cancer". Free:
https://pmc.ncbi.nlm.nih.gov/articles/PMC137549/ (C)
- Fit to US SEER colorectal incidence. Best model has 4 stages (C): two rare APC
  hits, then a frequent event giving an "initiated" cell, which grows as a
  clone (divides at rate α, dies at rate β), then a rare malignant step.
- Table 1 (C):

| Group | APC mutation rate /yr | μ2/α | αμ3 /yr² | clone growth α−β /yr |
|---|---|---|---|---|
| White males | 1.4e-6 | 9.0 | 5.2e-7 | 0.15 |
| African American males | 1.2e-6 | 4.3 | 1.8e-6 | 0.15 |
| White females | 1.3e-6 | 0.7 | 1.2e-5 | 0.13 |
| African American females | 1.1e-6 | 2.9 | 5.2e-6 | 0.13 |

- Assumes about 10^8 colon stem cells. α and β can't be separated from
  incidence data, only combinations of them.

## 2. Nicholson et al. 2018, Cell Stem Cell (colon crypts, human)
"Fixation and Spread of Somatic Mutations in Adult Human Colonic Epithelium".
Free: https://pmc.ncbi.nlm.nih.gov/articles/PMC5989058/ (C)
- 5–10 working stem cells per crypt (mean 7); 0.65–2.7 stem-cell replacements
  per crypt per year (mean 1.3); neutral crypt fission about 0.7%/yr (C).
- Mutant (STAG2) crypts split 2.15%/yr; a mutant stem cell wins a replacement
  with probability ~0.99 vs 0.5 for a neutral one (C).
- About 10^7 crypts per colon (BioNumbers 110647, citing Frank & Nowak 2004) (C).
- KRAS "155-fold" / "10-fold faster" figures: U (possibly mouse).

## 3. Kuznetsov et al. 1994, Bull Math Biol 56(2):295–321 (immune vs tumor)
ODE, not spatial; mouse lymphoma, not human colon. Parameters on pp. 302–303
(C), e.g. tumor growth a = 0.18/day. Using it on a grid would be our own adaptation.

## 4. Tomasetti & Vogelstein 2015, Science 347:78–81
Free manuscript: https://pmc.ncbi.nlm.nih.gov/articles/PMC4446723/ (C).
Per-tissue stem-cell numbers are in supplementary Table S1, which the search
could not open. Colon numbers from memory (2×10^8 cells, 73 divisions/yr): U.

## 5. Background (cite for ideas, numbers not confirmed)
- Moolgavkar & Knudson 1981, JNCI 66(6):1037–52: two-stage clonal expansion model (C).
- Armitage & Doll 1957, Br J Cancer 11(2):161–9, PMC2073730: two stages are enough
  if cells divide as a clone between them (secondary sources only, U).
- Spatial immune–tumor grids: Kather et al. 2017, Cancer Res 77:6442;
  Mallet & de Pillis 2006, J Theor Biol 239:334. Parameter tables U; both too
  complex for v1.

## Open conflict
Stem cell count: ~10^8 (Luebeck), ~10^7 crypts × ~7 stem cells (Nicholson /
BioNumbers), 2×10^8 (Tomasetti, U). Resolve before using.
