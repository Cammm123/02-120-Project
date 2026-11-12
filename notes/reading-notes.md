# Reading notes (science review)

Cameron's takeaways in his own words. Under each one: a check against the source.
The checks were added with Claude; the takeaways are Cameron's.

## 2026-11-10: multistage model and retinoblastoma

Article: Wikipedia, "Armitage–Doll multistage model of carcinogenesis"
(https://en.wikipedia.org/wiki/Armitage%E2%80%93Doll_multistage_model_of_carcinogenesis),
read 2026-11-10. It's a summary page, so each point is checked below against
the primary paper it cites.

Both takeaways match what the Wikipedia page says. Two of the page's own claims
don't match the primary sources, and those are flagged below.

### Takeaway 1: several mutations are needed to start a tumor

> They found out that a series of mutations were required to initiate a tumor.
> This is called the power law, where the chance increases with age. [...] It's
> why they now accept that multiple mutations are required to initiate a tumor,
> and on average, it's typically between 5 and 7 mutations.

**Check:**
- "Power law" names the **shape of the curve**: rate ∝ age^(r−1). It isn't the
  name of the finding. On log-log axes it's a straight line with slope r − 1.
  (`papers/armitage-doll-1954-notes.md`, p. 2)
- What rises is the **rate this year** (new cases per person-year), not the
  total chance so far. This is the same "line 1" point as in
  `armitage-doll-my-notes.md`.
- **Slope vs. hits:** Wikipedia says "r was typically between 5 and 7". The
  paper itself measured *slopes* of 4.97–6.48 and read them as **6 or 7
  changes** (slope + 1). So "5 to 7" mixes the two scales. Say "slopes of about
  5–6, so about 6–7 hits". (Table I, p. 4)
- **The equation** (Wikipedia, in Ashley's 1969 notation, the same as our
  paper notes): rate = N · p1·p2·…·pr · t^(r−1) / (r−1)!. N = cells at risk,
  pi = chance of hit i per year, r = hits, t = age.
- **Where "power law" comes from:** Wikipedia credits Nordling (1953), a year
  before Armitage & Doll, with noticing that risk rises with a power of age.
- In 1954 this was a theory that fit the shape of the death-rate data, not a
  direct observation of mutations. The sequencing that counts actual mutations
  came decades later.

### Takeaway 2: retinoblastoma is the exception

> Retinoblastoma, a cancer in the eyes, typically emerges in early childhood
> and only needs 1 or 2 preexisting genetic factors.

**Check:**
- Wikipedia says retinoblastoma "can emerge from as few as 1 or 2, depending on
  pre-existing genetic factors". That sentence **has no citation** on the page.
- Yes: it's a cancer of the **retina**, usually diagnosed before about age 5.
- It comes from **Knudson (1971)**, not Armitage & Doll (1954).
- The count needs fixing. Retinoblastoma needs **2 hits** (both copies of the
  *RB1* gene knocked out), which makes it a two-hit cancer.
  - **Inherited form:** one hit is already present at birth, in every cell, so
    only **1 more** is needed. That's why it comes early and often affects both
    eyes.
  - **Sporadic form:** both hits happen after birth, in the same cell. It comes
    later and usually affects one eye.
  - So it's "2 hits needed, of which 0 or 1 is inherited", not "1 or 2
    preexisting".
- **Link to our model:** this is the childhood-cancer flaw in spec.txt
  LIMITATIONS. Our model starts every cell at 0 hits with r = 6–7, so ages 0–4
  get an expected rate of essentially 0. Adding "inherited hits" (starting some
  people at 1 hit) is the next step listed there.

## Questions to settle
- [x] Read Knudson (1971), PNAS 68(4):820–823, the source for the two-hit
      retinoblastoma model. Confirmed: 2 mutations; inherited form = 1
      inherited + 1 after birth; non-inherited form = both after birth
      (abstract, p. 820). See the 2026-11-12 section below.
- [ ] Optional: the 2004 commentaries on the original paper (Frank;
      Moolgavkar; Doll, in Int J Epidemiol 33(6)) for criticisms. Wikipedia
      doesn't summarize them.

## 2026-11-12: Knudson (1971), the source paper

Article: Knudson AG. "Mutation and cancer: statistical study of
retinoblastoma." *PNAS* 68(4):820–823, 1971. `papers/knudson-1971.pdf`.

### Takeaway 1: two mutations, germinal and somatic

> There are two mutations. One is germinal and the other is somatic.

**Check (abstract, p. 820):** right for the **inherited** form. In the
**non-inherited** form, *both* mutations are somatic.
- **Germinal:** passed down in the egg or sperm, so it's in every cell of the
  body from the start.
- **Somatic:** happens later, in one body cell, and isn't passed on.

| form | mutation 1 | mutation 2 |
|---|---|---|
| inherited | germinal (born with it) | somatic |
| not inherited | somatic | somatic |

### Takeaway 2: one eye vs both

> Nonhereditary version is unilateral while hereditary is a mix.

**Check (Table 2, p. 821):** right. The non-inherited form is 0% bilateral
(both eyes). The inherited form is mostly bilateral (60–75% of carriers),
sometimes unilateral (25–40%), and some carriers never get a tumor (1–10%)
(p. 820).

### Takeaway 3: the ages (worked through together)

- **Average age at diagnosis (p. 823):** both eyes (inherited) 15 months; one
  eye (mostly not inherited) 32 months. The inherited form comes earlier
  because it starts one mutation ahead.
- **Fig. 1 (p. 823):** S = fraction of the children not yet diagnosed, on a
  log scale, against age in months. Picture redrawn from his formulas:
  `output/learn/7-knudson-one-vs-two-hit.svg`.
  - Both eyes (1 hit still needed): a straight line, so the same share of the
    remaining children (7.4%) is diagnosed every month. That's the r = 1,
    slope 0 case: a flat rate.
  - One eye (2 hits needed): it curves down. The share diagnosed each month
    grows with age (1.9% at 10 months, 3.7% at 20, 7.2% at 40). Doubling age
    doubles it: slope 1, r = 2.
- Only in childhood: the retina cells that can turn into this tumor
  disappear as the eye finishes growing (p. 823), so new cases stop.
