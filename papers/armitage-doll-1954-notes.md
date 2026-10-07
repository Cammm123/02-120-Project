# Armitage & Doll (1954): checked against the PDF

Source: `papers/brjcancer 00386.pdf`, Armitage P. and Doll R., "The age
distribution of cancer and a multi-stage theory of carcinogenesis",
*Br J Cancer* 8(1):1–12, March 1954 (PMC2007940).

## The data they used (p. 2)
- **Mortality**, not incidence: death rates from cancer in England and Wales,
  1950 and 1951 (Registrar General). They treat mortality as a stand-in for
  incidence.
- Five-year age groups from **25 to 74**, plotted at the mid-point of each group.
- A site is included only if it had more than 1000 deaths in each of the two years.
- 17 types of cancer in total (Summary, p. 9).
- Rates are per million persons, plotted as log10(rate) against log10(age).

## The model (p. 2 and Mathematical Appendix, pp. 10–11)
- A cell needs r changes in a fixed order. Change number i happens at a rate of
  p_i per unit time, constant over life.
- Incidence at age t ≈ N · p1·p2·…·pr · t^(r−1) / (r−1)!, where N is the number
  of cell lines per person.
- So log(rate) = (r−1)·log(t) + a constant: a straight line with slope r − 1.
- **This is an approximation.** It holds only when every p_i·t is small
  ("as t → 0", p. 10). A simulation can test when this breaks down.

## Table I (p. 4): the slopes of the straight lines

| Sex | Site       | Slope |
|-----|------------|-------|
| M   | Oesophagus | 6.26  |
| M   | Stomach    | 5.91  |
| M   | Colon      | 5.18  |
| M   | Rectum     | 5.62  |
| M   | Pancreas   | 5.76  |
| F   | Stomach    | 5.27  |
| F   | Colon      | 4.97  |
| F   | Rectum     | 5.03  |
| F   | Pancreas   | 6.48  |

Range 4.97–6.48, matching the earlier research. They read this as "6 or 7
successive changes" (p. 4). Slope 6 means r = 7.

## Sites that do NOT fit (pp. 5–7)
The second group is lung, bladder and prostate in men, and lung, breast, ovary,
cervix and corpus uteri in women. Their explanation is that the cause changes
over life: hormones (breast, ovary, cervix, prostate), smoking that has changed
across generations (lung), and workplace exposure (bladder).

## A second result that can be checked by hand (pp. 8, 12)
Penile cancer and age at circumcision: with r = 7, and the first change
possible only before circumcision at age T, the risk at age 53 relative to no
circumcision is

    1 − ((53 − T) / 53)^6

| Circumcised at (mid-point T) | Paper | Hand check |
|------------------------------|-------|------------|
| 0–5 yrs (3)                  | 0.30  | 1 − (50/53)^6 = 0.295 |
| 6–16 yrs (11.5)              | 0.77  | 1 − (41.5/53)^6 = 0.770 |
| 17–35 yrs (26.5)             | 0.98  | 1 − (26.5/53)^6 = 1 − 1/64 = 0.984 |
| never (44.5)                 | 1.00  | 1 − (8.5/53)^6 = 1.000 |

Observed (Shrek and Lenowitz, 1947): 0.00, 0.67, 0.96, 1.00. This could become an
extension: a simulation where one stage switches off at a chosen age.

## Things the paper does not give
- The raw death rates behind the figures. They come from the Registrar General's
  1950–51 tables, not the paper. So we compare our *slopes* with Table I,
  using modern data (CI5), rather than redrawing their exact points.
