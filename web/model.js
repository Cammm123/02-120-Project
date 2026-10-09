// model.js - the cancer age-curve model from spec.txt (v1).
// Model logic only: no drawing, no buttons. Tests: node model.test.js

/**
 * Make a seeded random-number generator (the "sfc32" generator).
 * Returns a function rand(); each call gives the next number in [0, 1).
 * The same seed always gives the same sequence, so a run can be repeated.
 * seed must be a whole number from 0 to 4294967295 (2^32 - 1).
 *
 * Why not mulberry32 (our first choice): on 2026-10-09 it gave too few cells
 * with 0 hits after 85 years at p = 0.005 (z = -9.6 over 30 million cells),
 * which made about 1.5% too many cancers. sfc32 passed the same check
 * (all |z| < 2). The check is in rng-check.js.
 */
function makeRng(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    throw new Error(`seed must be a whole number from 0 to 4294967295, got ${seed}`);
  }
  // Four hidden 32-bit numbers: three fixed starting values, plus the seed.
  let a = 0x9e3779b9;
  let b = 0x243f6a88;
  let c = 0xb7e15162;
  let d = seed | 0;
  function rand() {
    // Mix the four numbers into each other ("| 0" keeps everything 32-bit).
    const t0 = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11); // rotate c's bits left by 21
    d = (d + 1) | 0; // a counter, so the sequence cannot get stuck
    const t = (t0 + d) | 0;
    c = (c + t) | 0;
    // Turn the 32-bit result (0 ... 2^32 - 1) into a decimal in [0, 1).
    return (t >>> 0) / 4294967296;
  }
  // Throw away the first 15 numbers: they still look too much like the seed.
  for (let i = 0; i < 15; i++) rand();
  return rand;
}

/**
 * One year for one cell. A cell with fewer than r hits gains its next hit
 * with chance p (when rand() < p); hits come in a fixed order, so it gains
 * at most 1. A cell that already has r hits stays at r and draws no number.
 * No input checks here: this runs millions of times, so the caller checks.
 */
function stepCell(hits, r, p, rand) {
  if (hits >= r) return hits;
  return rand() < p ? hits + 1 : hits;
}

/** Years simulated per person: ages 0, 1, ..., 84 (the last CI5 group before 85+). */
const YEARS = 85;

/**
 * One person: N cells, all starting with 0 hits. Each year of age
 * (0 ... 84), every cell takes one stepCell, in order. The moment any cell
 * reaches r hits, return that age (cancer); the rest of that year is skipped.
 * No cell reaches r by the end of age 84 -> return null.
 */
function simulatePerson(N, r, p, rand) {
  const cells = new Array(N).fill(0); // hits in each cell
  for (let age = 0; age < YEARS; age++) {
    for (let i = 0; i < N; i++) {
      cells[i] = stepCell(cells[i], r, p, rand);
      if (cells[i] === r) return age;
    }
  }
  return null;
}

/**
 * Simulate M people, each with N cells needing r hits, chance p per year.
 * All people share ONE generator made from seed, so each person gets
 * different random numbers but the whole run can be repeated exactly.
 * Returns a table: [{ person: 0, ageAtCancer: 61 }, { person: 1, ageAtCancer: null }, ...]
 * Checks its inputs here (stepCell and simulatePerson don't, for speed).
 */
function simulatePopulation(M, N, r, p, seed) {
  if (!Number.isInteger(M) || M < 1) throw new Error(`M (people) must be a whole number >= 1, got ${M}`);
  if (!Number.isInteger(N) || N < 1) throw new Error(`N (cells) must be a whole number >= 1, got ${N}`);
  if (!Number.isInteger(r) || r < 1) throw new Error(`r (hits) must be a whole number >= 1, got ${r}`);
  if (typeof p !== "number" || !(p >= 0 && p <= 1)) throw new Error(`p must be a number from 0 to 1, got ${p}`);
  const rand = makeRng(seed); // also checks the seed
  const table = [];
  for (let person = 0; person < M; person++) {
    table.push({ person, ageAtCancer: simulatePerson(N, r, p, rand) });
  }
  return table;
}

/**
 * Cancer rate for each five-year age group 0-4, 5-9, ..., 80-84 (17 groups),
 * using exact person-years (spec.txt, MODEL item 5).
 * A person adds 1 person-year for each age in the group that they START
 * cancer-free, including the age they get cancer; no cancer -> all 5 years.
 * Returns [{ start: 0, end: 4, cases, personYears, rate }, ...];
 * rate is null when nobody was at risk (personYears = 0).
 */
function ageGroupRates(table) {
  const groups = [];
  for (let start = 0; start < YEARS; start += 5) {
    const end = start + 4;
    let cases = 0;
    let personYears = 0;
    for (const row of table) {
      // The last age this person was at risk: their cancer age, or 84 if none.
      const lastAge = row.ageAtCancer === null ? YEARS - 1 : row.ageAtCancer;
      personYears += Math.max(0, Math.min(lastAge, end) - start + 1);
      if (row.ageAtCancer !== null && row.ageAtCancer >= start && row.ageAtCancer <= end) cases++;
    }
    groups.push({ start, end, cases, personYears, rate: personYears > 0 ? cases / personYears : null });
  }
  return groups;
}

// Lets the same file load in the browser (as globals) and in Node (for tests).
if (typeof module !== "undefined") module.exports = { makeRng, stepCell, YEARS, simulatePerson, simulatePopulation, ageGroupRates };
