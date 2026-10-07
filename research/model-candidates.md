# Cancer models we could reproduce (research, 2026-10-06)

Gathered by Claude's research agents from the papers and open full texts. Numbers
are **as reported by the agents** and must be checked against each PDF before
they go into the proposal. Items marked (?) the agents couldn't fully verify.

## Easy: equations, parameters and a numeric target all published

| Model | Hallmark / theme | Type | Target to match | Access | Code |
|---|---|---|---|---|---|
| Strobl et al. 2021, *Cancer Res* 81:1135 (adaptive therapy, cost of resistance) | Resistance, treatment | 2 ODEs (sensitive vs resistant) | Adaptive extends time to progression by 3–104 days (fR = 1%) and 19–211 days (fR = 0.1%) | PMC8455086 | Python: github.com/MathOnco/AT_costOfResistance_LVModel |
| Armitage & Doll 1954, *Br J Cancer* 8:1 (multistage theory) | Age, mutation accumulation | Sequential-hit model, rate ∝ t^(r−1) | Log-log slopes 4.97–6.48 (e.g. colon, men 5.18; checked against the PDF, see papers/armitage-doll-1954-notes.md) means about 6–7 stages | PMC2007940 | Not needed |
| Kuznetsov et al. 1994, *Bull Math Biol* 56:295 (immune vs tumor) | Avoiding immune destruction | 2 ODEs | Dormant and escape states; bifurcations at μ = 0.002633 and 0.005014 | Unofficial PDF on a Rutgers course page | Not needed |
| Hahnfeldt et al. 1999, *Cancer Res* 59:4770 (Folkman lab; tumor + blood vessels) | Inducing angiogenesis | 2 ODEs | Untreated plateau (b/d)^(3/2) ≈ 17,400 mm³ (hand check); TNP-470 set point 12,300 mm³ | Rutgers course PDF | Not needed |
| Viossat & Noble 2021, *Nat Ecol Evol* 5:826 (tumor containment) | Treatment | ODE framework | Exact formula: containment/MTD time ratio = x/ln(1+x) | PMC8967123 | R: github.com/robjohnnoble/LogicOfContainingTumours |

## Moderate

| Model | Theme | Target | Note |
|---|---|---|---|
| Zhang et al. 2017, *Nat Commun* 8:1816 (prostate adaptive therapy trial) | Treatment | Clinical: median time to progression ~16.5 months on standard care vs ≥27 months adaptive, using 47% of the drug | Full parameters plus MATLAB code; model targets are curve shapes |
| Bozic et al. 2010, *PNAS* 107:18545 (driver mutations) | Age, genome instability | 2nd driver after 8.3 yr, 3rd after 4.5 more (worked example) | Formula reconstructed from garbled text (?) |
| Bozic et al. 2013, *eLife* 2:e00747 (combination therapy) | Resistance | Dual therapy cures 26.3% (n12=1) and 99.9% (n12=0) of lesions | Branching process |
| Knudson 1971, *PNAS* 68:820 (retinoblastoma two-hit) | Tumor suppressors | Poisson mean 3 tumors per carrier, so P(0) = e⁻³ | Age curves unverified (?) |
| Spencer et al. 2006, *PLoS Comput Biol* 2:e108 (hallmarks agent-based model) | All hallmarks | 986/1000 runs reach cancer; which hallmark comes first | Rules have gaps; original code link is dead |

## Hard (avoid as the core)

Gatenby 2009 (model not fully specified; headline result is from mice), Abbott
2006 (rules have gaps, code dead), Anderson 2006 / Gerlee & Anderson 2007 (PDE
plus neural network per cell), Gallaher 2018 (off-lattice cell mechanics).

## Real data available now, no account needed

- **CI5-XII (IARC):** https://ci5.iarc.who.int/ci5-xii/download/ has cases.csv +
  pop.csv by registry, sex, site and 5-year age group (includes USA SEER 2013–17).
- **SEER*Explorer archive:** "Incidence Rates by Age at Diagnosis" XLSX.
