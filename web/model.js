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

/**
 * y values closer together than this count as flat (decided 2026-11-07).
 * Measured: expectedRates for r = 1, p = 0.1 gives rates that should all be
 * 0.1 but differ in the 13th digit; their logs spread by about 8e-12, which
 * made R squared 0.61. 1e-9 is ~100x above that noise; on log(rate) it means
 * rates within 0.0000001% of each other, which real simulated rates never are.
 */
const FLAT_Y = 1e-9;

/**
 * Least-squares straight line through the points (xs[i], ys[i]): the line
 * with the smallest sum of squared vertical misses.
 *   slope = sum (x - mean x)(y - mean y) / sum (x - mean x)^2
 *   intercept = mean y - slope * mean x
 *   R squared = 1 - (sum of squared misses) / sum (y - mean y)^2
 * Returns { slope, intercept, rSquared, note }. note is null, except when the
 * y values are flat: all within FLAT_Y of each other. Then the only spread is
 * rounding noise and R squared would measure the noise (0/0 if exactly
 * equal), so slope is 0, intercept the mean y, R squared 1, and note says so
 * (decided 2026-10-30; "within FLAT_Y" instead of "exactly equal" 2026-11-07).
 * Throws for different lengths, fewer than 2 points, or every x the same
 * (a vertical line has no slope).
 */
function fitLine(xs, ys) {
  if (xs.length !== ys.length) throw new Error(`xs and ys must be the same length, got ${xs.length} and ${ys.length}`);
  if (xs.length < 2) throw new Error(`need at least 2 points, got ${xs.length}`);
  if (xs.every((x) => x === xs[0])) throw new Error(`every x is ${xs[0]}: a vertical line has no slope`);
  const meanYAll = ys.reduce((s, y) => s + y, 0) / ys.length;
  if (Math.max(...ys) - Math.min(...ys) < FLAT_Y) {
    return { slope: 0, intercept: meanYAll, rSquared: 1, note: `every y is within ${FLAT_Y} of ${meanYAll}: flat, so R squared is set to 1 (any spread is rounding noise)` };
  }
  const n = xs.length;
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = ys.reduce((s, y) => s + y, 0) / n;
  let sxy = 0; // sum of (x - mean x)(y - mean y)
  let sxx = 0; // sum of (x - mean x)^2
  let syy = 0; // sum of (y - mean y)^2: the spread of y
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    sxx += (xs[i] - meanX) ** 2;
    syy += (ys[i] - meanY) ** 2;
  }
  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;
  let missesSquared = 0; // sum of (y - line's y)^2
  for (let i = 0; i < n; i++) missesSquared += (ys[i] - (intercept + slope * xs[i])) ** 2;
  return { slope, intercept, rSquared: 1 - missesSquared / syy, note: null };
}

/**
 * Straight line through log(rate) vs log(age), natural log (spec.txt, MODEL
 * item 6). For rate = c * age^k this gives slope k and intercept log(c).
 * Rates of 0 or null have no point to plot (log(0) does not exist), so they
 * are skipped together with their age, and counted. The caller picks which
 * age groups to pass in (decided 2026-11-02).
 * Returns fitLine's { slope, intercept, rSquared, note } plus used and skipped.
 * Throws for different lengths, an age of 0 or below, or a negative rate;
 * fitLine throws if fewer than 2 points are left.
 */
function logLogFit(ages, rates) {
  if (ages.length !== rates.length) throw new Error(`ages and rates must be the same length, got ${ages.length} and ${rates.length}`);
  const xs = [];
  const ys = [];
  for (let i = 0; i < ages.length; i++) {
    if (ages[i] <= 0) throw new Error(`age must be above 0, got ${ages[i]}`);
    if (rates[i] !== null && rates[i] < 0) throw new Error(`rate cannot be negative, got ${rates[i]}`);
    if (rates[i] === null || rates[i] === 0) continue; // skip: no point to plot
    xs.push(Math.log(ages[i]));
    ys.push(Math.log(rates[i]));
  }
  const line = fitLine(xs, ys);
  return { ...line, used: xs.length, skipped: ages.length - xs.length };
}

/**
 * P(Binomial(t, p) >= r): the chance one cell has all r hits after t years
 * (spec.txt, THE EXACT ANSWER). Adds P(exactly j) for j = r ... t directly,
 * never 1 - P(fewer than r), which rounds to 0 for tiny chances.
 *   P(exactly j) = C(t, j) * p^j * (1 - p)^(t - j)
 * C(t, j) is built as (t/1) * ((t-1)/2) * ... * ((t-j+1)/j), so no factorial
 * (85! is about 10^128) is ever formed.
 * Throws for t not a whole number >= 0, r not a whole number >= 1, or p
 * outside 0 to 1 (same words as simulatePopulation).
 */
function cellDoneChance(t, r, p) {
  if (!Number.isInteger(t) || t < 0) throw new Error(`t (years) must be a whole number >= 0, got ${t}`);
  if (!Number.isInteger(r) || r < 1) throw new Error(`r (hits) must be a whole number >= 1, got ${r}`);
  if (typeof p !== "number" || !(p >= 0 && p <= 1)) throw new Error(`p must be a number from 0 to 1, got ${p}`);
  if (r > t) return 0; // can't have more hits than years
  let coefficient = 1; // C(t, 0)
  for (let k = 1; k <= r; k++) coefficient *= (t - k + 1) / k; // now C(t, r)
  let total = 0;
  for (let j = r; j <= t; j++) {
    total += coefficient * p ** j * (1 - p) ** (t - j);
    coefficient *= (t - j) / (j + 1); // C(t, j) -> C(t, j + 1)
  }
  return total;
}

/**
 * log of the chance that ONE cell is NOT done after t years: log P(Binomial(t, p) <= r - 1).
 * Two exact routes (spec.txt, arithmetic trap, decided 2026-11-14):
 *   q = cellDoneChance small (< 0.5): log1p(-q), so a tiny q like 1e-27 is kept;
 *   q near 1: sum the BOTTOM of the Binomial directly, in logs, so 1 - q is never
 *   computed as "1 minus almost 1" and nothing underflows to 0.
 * Returns -Infinity only when the cell is surely done (p = 1 and t >= r).
 */
function logCellNotDone(t, r, p) {
  const q = cellDoneChance(t, r, p); // also checks t, r, p
  if (q < 0.5) return Math.log1p(-q);
  if (p === 1) return t >= r ? -Infinity : 0;
  // log of each term C(t, j) p^j (1-p)^(t-j), j = 0 .. r-1, then log-sum-exp.
  const logs = [];
  let logC = 0; // log C(t, 0)
  for (let j = 0; j <= Math.min(r - 1, t); j++) {
    if (j > 0) logC += Math.log((t - j + 1) / j);
    logs.push(logC + j * Math.log(p) + (t - j) * Math.log1p(-p));
  }
  const top = Math.max(...logs);
  return top + Math.log(logs.reduce((sum, x) => sum + Math.exp(x - top), 0));
}

/**
 * The exact rate in each five-year age group, with no random numbers
 * (spec.txt, THE EXACT ANSWER). Same shape as ageGroupRates:
 * [{ start, end, casesPerPerson, personYearsPerPerson, rate }, ...].
 * Works with log S(t) = N * logCellNotDone(t, r, p), the log of the chance a
 * person is cancer-free at the start of age t (all N cells below r hits).
 * For group g, with d = log S(g+5) - log S(g):
 *   rate = -expm1(d) / (sum of S(a) / S(g) for a = g .. g+4)
 *   casesPerPerson = S(g) * -expm1(d), personYearsPerPerson = S(g) + ... + S(g+4).
 * Dividing by S(g) first means even S = 1e-300 gives the right rate. rate is null
 * only when nobody is left at all (log S(g) = -Infinity). No cutoff (the old
 * "S below 1e-12 is 0" rule broke groups it landed in; replaced 2026-11-14).
 * Throws for N not a whole number >= 1; cellDoneChance checks r and p.
 */
function expectedRates(N, r, p) {
  if (!Number.isInteger(N) || N < 1) throw new Error(`N (cells) must be a whole number >= 1, got ${N}`);
  const logS = [];
  for (let t = 0; t <= YEARS; t++) {
    logS.push(N * logCellNotDone(t, r, p));
  }
  const groups = [];
  for (let start = 0; start < YEARS; start += 5) {
    const base = logS[start];
    let personYearsPerPerson = 0;
    for (let t = start; t < start + 5; t++) personYearsPerPerson += Math.exp(logS[t]);
    if (base === -Infinity) {
      groups.push({ start, end: start + 4, casesPerPerson: 0, personYearsPerPerson: 0, rate: null });
      continue;
    }
    const finishedShare = -Math.expm1(logS[start + 5] - base); // share of those left at g who get cancer by g+5
    let relativeYears = 0;
    for (let t = start; t < start + 5; t++) relativeYears += Math.exp(logS[t] - base);
    groups.push({
      start,
      end: start + 4,
      casesPerPerson: Math.exp(base) * finishedShare,
      personYearsPerPerson,
      rate: finishedShare / relativeYears,
    });
  }
  return groups;
}

/**
 * Below this many expected cases, z is unreliable (decided 2026-11-09,
 * measured): small counts are lopsided, so a correct simulation shows yellow
 * or red too often, and z can't go below -3 (expected 2 -> lowest z -1.41).
 * From 10 up, yellow behaves like the bell curve (1.2x) and z can reach -3.16.
 */
const FEW_CASES = 10;

/**
 * Compare simulated and expected case counts in each age group (spec.txt,
 * MODEL item 8). simulated = ageGroupRates(...), expected = expectedRates(...),
 * M = number of people simulated. For each group:
 *   expectedCases = M * casesPerPerson
 *   z = (simulatedCases - expectedCases) / sqrt(expectedCases), sign kept
 *   note: null; "few cases" when expectedCases < FEW_CASES (z kept, but
 *   unreliable); "expected 0" when expectedCases = 0 (z null), or
 *   "impossible: expected 0" if the simulation had cases there anyway (a bug).
 * Returns [{ start, end, simulatedCases, expectedCases, z, note }, ...].
 * Throws if the two lists of groups don't line up, or for a bad M.
 */
function zScores(simulated, expected, M) {
  if (!Number.isInteger(M) || M < 1) throw new Error(`M (people) must be a whole number >= 1, got ${M}`);
  if (simulated.length !== expected.length) {
    throw new Error(`simulated and expected must have the same number of age groups, got ${simulated.length} and ${expected.length}`);
  }
  return simulated.map((sim, i) => {
    const exp = expected[i];
    if (sim.start !== exp.start || sim.end !== exp.end) {
      throw new Error(`age groups don't line up: ${sim.start}-${sim.end} vs ${exp.start}-${exp.end}`);
    }
    const expectedCases = M * exp.casesPerPerson;
    let z = null;
    let note = null;
    if (expectedCases === 0) {
      note = sim.cases === 0 ? "expected 0" : "impossible: expected 0";
    } else {
      z = (sim.cases - expectedCases) / Math.sqrt(expectedCases);
      if (expectedCases < FEW_CASES) note = "few cases";
    }
    return { start: sim.start, end: sim.end, simulatedCases: sim.cases, expectedCases, z, note };
  });
}

/** The slope uses age groups starting at this age and up: 25-29 ... 80-84 (spec item 6). */
const SLOPE_FROM = 25;

/**
 * Summary of the z's over the groups used for the slope (start >= SLOPE_FROM)
 * whose z is reliable (a number, no note):
 *   largest: the z with the largest size, sign kept, and its group, or null;
 *   sumZ2: the sum of z^2 (spec item 10: noise alone gives about groupsInSum;
 *          all z's leaning the same way, e.g. every one +1.5, gives much more).
 * Returns { largest: { z, start, end } | null, sumZ2, groupsInSum }.
 */
function summarizeZ(zGroups) {
  let largest = null;
  let sumZ2 = 0;
  let groupsInSum = 0;
  for (const g of zGroups) {
    if (g.start < SLOPE_FROM || g.z === null || g.note !== null) continue;
    sumZ2 += g.z ** 2;
    groupsInSum++;
    if (largest === null || Math.abs(g.z) > Math.abs(largest.z)) largest = { z: g.z, start: g.start, end: g.end };
  }
  return { largest, sumZ2, groupsInSum };
}

/**
 * logLogFit, or a reason there is no slope: fewer than 2 groups with a rate
 * above 0 would make fitLine throw, which would crash a whole report.
 */
function fitOrProblem(ages, rates, which) {
  const usable = rates.filter((x) => x !== null && x > 0).length;
  if (usable < 2) return { fit: null, problem: `only ${usable} age group(s) from ${SLOPE_FROM} up with ${which} cases: no slope` };
  return { fit: logLogFit(ages, rates), problem: null };
}

/**
 * One full run, all the numbers (spec.txt, MODEL items 8-10): simulate M
 * people, compare with the exact rates, and fit the log-log line through the
 * groups 25-29 ... 80-84 at their middle ages 27.5, 32.5, ..., 82.5 (decided 2026-11-09), once for the
 * simulated and once for the exact rates.
 * Each group: zScores' fields plus simulatedRate, expectedRate, inSlope and
 * leftOutReason (null, "under 25", "nobody at risk" or "0 cases").
 * Returns { settings, groups, simulatedFit, simulatedFitProblem, exactFit,
 *   exactFitProblem, zSummary }; a fit is null when there is no slope, and
 *   its problem says why. Input checks are done by simulatePopulation.
 */
function runReport(M, N, r, p, seed) {
  const simulated = ageGroupRates(simulatePopulation(M, N, r, p, seed));
  const expected = expectedRates(N, r, p);
  const groups = zScores(simulated, expected, M).map((g, i) => {
    let leftOutReason = null;
    if (g.start < SLOPE_FROM) leftOutReason = "under 25";
    else if (simulated[i].rate === null) leftOutReason = "nobody at risk";
    else if (simulated[i].cases === 0) leftOutReason = "0 cases";
    return { ...g, simulatedRate: simulated[i].rate, expectedRate: expected[i].rate, inSlope: leftOutReason === null, leftOutReason };
  });
  const slopeGroups = groups.filter((g) => g.start >= SLOPE_FROM);
  const middleAges = slopeGroups.map((g) => g.start + 2.5); // group 25-29 covers ages 25.0 to 30.0
  const sim = fitOrProblem(middleAges, slopeGroups.map((g) => g.simulatedRate), "simulated");
  const exact = fitOrProblem(middleAges, slopeGroups.map((g) => g.expectedRate), "expected");
  return {
    settings: { M, N, r, p, seed },
    groups,
    simulatedFit: sim.fit,
    simulatedFitProblem: sim.problem,
    exactFit: exact.fit,
    exactFitProblem: exact.problem,
    zSummary: summarizeZ(groups),
  };
}

// Lets the same file load in the browser (as globals) and in Node (for tests).
/**
 * Real data (CI5) as age-group rates, in the same shape as ageGroupRates:
 * [{start, end, cases, personYears, rate}], group i covers ages 5i to 5i+4.
 * rate = cases / personYears; null when personYears is 0 (nobody at risk).
 */
function realRates(cases, personYears) {
  if (cases.length !== personYears.length) throw new Error("cases and personYears need the same number of age groups");
  const ok = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;
  return cases.map((c, i) => {
    const py = personYears[i];
    if (!ok(c) || !ok(py)) throw new Error("cases and person-years must be numbers >= 0");
    if (py === 0 && c > 0) throw new Error(`group ${5 * i}-${5 * i + 4} has cases with 0 person-years`);
    return { start: 5 * i, end: 5 * i + 4, cases: c, personYears: py, rate: py > 0 ? c / py : null };
  });
}

/**
 * The factor k that slides line `fit` up or down so it meets `targetFit` at `age`.
 * Both are natural-log fits: log(rate) = intercept + slope * log(age).
 * k = exp(target line at age - fit line at age). Multiplying rates by k moves
 * the line on log-log axes without changing its slope.
 */
function shiftToMeet(fit, targetFit, age) {
  const isLine = (f) => f && Number.isFinite(f.slope) && Number.isFinite(f.intercept);
  if (!isLine(fit) || !isLine(targetFit)) throw new Error("fit and targetFit need a slope and an intercept");
  if (!(typeof age === "number" && age > 0)) throw new Error("age must be a number > 0");
  const logAge = Math.log(age);
  return Math.exp((targetFit.intercept + targetFit.slope * logAge) - (fit.intercept + fit.slope * logAge));
}

if (typeof module !== "undefined") module.exports = { makeRng, stepCell, YEARS, simulatePerson, simulatePopulation, ageGroupRates, fitLine, logLogFit, cellDoneChance, expectedRates, zScores, summarizeZ, runReport, realRates, shiftToMeet, SLOPE_FROM };
