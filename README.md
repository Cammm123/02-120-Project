# How many hits make a cancer? A multistage cancer model

**Live app:** https://02-120-project-web.vercel.app

Cameron Kani · 02-120 Programming for Scientists, Carnegie Mellon University · Fall 2026

## The question

From my proposal (`proposal.md`):

> Can changing the variables *p* (which "hit" gets sped up), when exposure starts, and when exposure stops produce
> the downward bend and flattening at old ages seen in the lung cancer curve for men (Fig. 3 in Armitage & Doll,
> 1954, and in the CI5 England data)?

## What the app does now (first version, v1)

- Each simulated person has **N cells**. A cell becomes cancer after **r hits**, and each hit has chance **p** per
  year (Armitage & Doll's multistage model). 20,000 people are simulated from birth to age 85.
- The app plots the cancer rate against age on **log-log axes**, where the slope is about **r − 1**, and on plain
  axes.
- It compares three things:
  - **the simulation**, one random run;
  - **the exact model**, the same model worked out by formula with no randomness;
  - **real data**: lung, stomach or colon cancer in English men, 2013–2017.
- **Accuracy checks** on every run:
  - each age group's gap (z) between simulated and expected cancers;
  - the total miss (sum of z²) against a pass line that was measured over 20 seeds;
  - R² for each fitted line.
- **Not built yet (v2):** the carcinogen, which speeds up one chosen hit between a start age and a stop age. That is
  the part that answers the question above.

## Run it yourself

No install and no build step. You only need a web browser, plus [Node.js](https://nodejs.org) for the tests.

```
open web/index.html              # the app, straight from the file
cd web
node model.test.js               # all tests (296 at the time of writing)
node report.js                   # one run as a table: node report.js [M N r p seed]
node plot-fit.js                 # draws output/v1-fit.svg
```

## Files

| Path | What it is |
|---|---|
| `web/model.js` | The model and all of its math: simulation, exact rates, line fitting, z-scores, pass line. No drawing. |
| `web/model.test.js` | Tests for every function in `model.js`, with expected numbers worked out by hand. |
| `web/index.html`, `web/app.js` | The page: sliders, graphs, tables, the About Data tab. Drawing only. |
| `web/ci5.js`, `web/make-ci5.js` | The real data the page uses, and the script that extracts it from `data/`. |
| `web/report.js`, `web/plot-*.js`, `web/learn-*.js` | Command-line report, graphs, and teaching pictures (`output/learn/`). |
| `spec.txt` | The plan: model rules, hand checks, decisions, and a list of **limitations**. |
| `progress-log.md` | What was done in each session. |
| `notes/`, `papers/` | Reading notes and the papers. |
| `journal/` | The build journal (AI session logs), required by the course. |

## Sources

- Armitage P, Doll R (1954). The age distribution of cancer and a multi-stage theory of carcinogenesis.
  *British Journal of Cancer* 8(1):1–12.
- Knudson AG (1971). Mutation and cancer: statistical study of retinoblastoma. *PNAS* 68(4):820–823.
- Real data: Bray F, Colombet M, Aitken JF, et al., editors (2023). *Cancer Incidence in Five Continents, Vol. XII*
  (IARC CancerBase No. 19). Lyon: International Agency for Research on Cancer. https://ci5.iarc.who.int.
  The data may be freely used with acknowledgement of the source, but not for sale or commercial purposes
  (`data/README.md`).

## Limitations

These are listed in full in `spec.txt` (LIMITATIONS). In short:

1. The model's N and p are scaled-up stand-ins. Real numbers would give almost no cancer, so only the **shape** of
   the curve is compared with real data.
2. There is no childhood cancer, because everyone starts with 0 hits. Knudson's inherited first hit is a possible
   next step.
3. Every hit has the same chance p.
4. N and M are chosen to keep the lifetime risk believable.
5. The simulated slope reads low when the cancer is rare at young ages, because age groups with 0 cases have to be
   dropped from the log-log fit.

## How this was built

Built with Claude (Anthropic's AI assistant) as a coding partner. The course's build journal is in `journal/`. Every
function has tests with hand-worked expected values, and the decisions and their reasons are recorded in `spec.txt`
and `progress-log.md`.
