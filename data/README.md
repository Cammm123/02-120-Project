# Data

## CI5-XII summary database

- **What:** Cancer Incidence in Five Continents, Volume XII (IARC Scientific
  Publication No. 169). New cancer cases and population, by registry, sex,
  cancer site and five-year age group, mostly for 2013–2017.
- **Downloaded:** 2026-10-06 from
  https://gco.iarc.fr/media/ci5/data/vol12/Download/CI5-XII.zip
  (linked from https://ci5.iarc.who.int/ci5-xii/download). No account needed.
- **Terms of use:** the data "may be freely used but not for sale or for use in
  conjunction with commercial or promotional purposes, and provided any use
  shall be subject to appropriate reference and acknowledgement of the source."
- **Citation:** Bray F, Colombet M, Aitken JF, et al., editors (2023). *Cancer
  Incidence in Five Continents, Vol. XII* (IARC CancerBase No. 19). Lyon:
  International Agency for Research on Cancer. https://ci5.iarc.who.int

## Files

| File | What it holds |
|------|---------------|
| `cases.csv` | One row per registry × sex × cancer. `N0_4` … `N85` are case counts per age group, summed over the registry's years. |
| `pop.csv` | One row per registry × sex. `P0_4` … `P85` are **person-years** over the same years (not a one-year population). |
| `cancer_summary.txt` | `CANCER` code → ICD-10 site name (e.g. 13 = colon, 14 = rectum). |
| `Registry.txt` | `REGISTRY` code → place and years (e.g. 582600199 = UK, England, 2013–2017). |

`SEX`: 1 = male, 2 = female.

## Hand check: one rate

Colon cancer (CANCER 13), men (SEX 1), England (582600199), ages 60–64:

- cases (`N60_64`) = 6,082
- person-years (`P60_64`) = 7,188,268
- rate = 6,082 / 7,188,268 × 1,000,000 = **846 per million per year**

Check on the units: the men's person-years add up to 135,118,424, which is
27.0 million a year over 5 years, about the male population of England.

## How this differs from Armitage & Doll's data

They used **deaths** in England and Wales in 1950–51. CI5 counts **new cases**
(incidence) in 2013–2017. They assumed the two have the same shape across ages.
Treatment, screening and lifespan have all changed since then, so we compare
slopes, not exact rates.
