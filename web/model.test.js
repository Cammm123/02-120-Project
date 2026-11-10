// model.test.js - checks for model.js. Run from the web/ folder:  node model.test.js
// Every expected number below was worked out by hand (or by a separate,
// differently written program) rather than copied from model.js output.

const { makeRng, stepCell, YEARS, simulatePerson, simulatePopulation, ageGroupRates, fitLine, logLogFit, cellDoneChance, expectedRates, zScores, summarizeZ, runReport } = require("./model.js");

let passed = 0;
let failed = 0;

/** Record one check: print PASS/FAIL with its name. */
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}` + (ok ? "" : `  (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`));
}

/** Like check, but for decimals: passes if actual is within 1e-9 of expected. */
function checkClose(name, actual, expected) {
  const ok = Math.abs(actual - expected) < 1e-9;
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}` + (ok ? "" : `  (got ${actual}, expected ${expected})`));
}

/**
 * What happens when fn runs: "did not throw", or the error's message.
 * Kept separate from checkThrows so the helper itself can be tested.
 */
function thrownMessage(fn) {
  try { fn(); } catch (e) { return e.message; }
  return "did not throw";
}

/** The rule checkThrows uses: a real error was thrown, and its message contains the (required) words. */
function throwsWith(message, words) {
  return typeof words === "string" && words.length > 0 && message !== "did not throw" && message.includes(words);
}

/**
 * Record a check that fn throws AND that the error message contains `words`
 * (decided 2026-11-04). Any error used to count, so a typo in the test or an
 * input that trips a different check passed for the wrong reason.
 * The words are required: leaving them out is itself a FAIL.
 */
function checkThrows(name, fn, words) {
  const message = thrownMessage(fn);
  const ok = throwsWith(message, words);
  if (ok) passed++;
  else failed++;
  const reason = typeof words === "string" && words.length > 0 ? `expected an error containing "${words}", got: ${message}` : "no expected words given";
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}` + (ok ? "" : `  (${reason})`));
}

/**
 * True if actual is within a fraction `rel` of expected (rel = 0.001 -> 0.1%).
 * For tiny answers like 3.3e-27, where checkClose's 1e-9 would accept 0.
 */
function relClose(actual, expected, rel) {
  return typeof actual === "number" && Math.abs(actual - expected) <= rel * Math.abs(expected);
}

/** Record a check that actual is within a fraction `rel` of expected. */
function checkRelClose(name, actual, expected, rel) {
  const ok = relClose(actual, expected, rel);
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}` + (ok ? "" : `  (got ${actual}, expected ${expected} within ${rel * 100}%)`));
}

/** Record a check that `actual` lies between low and high (inclusive). */
function checkBetween(name, actual, low, high) {
  const ok = actual >= low && actual <= high;
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (got ${actual}, allowed ${low} to ${high})`);
}

/** Call fn and return its result, or "error: ..." if it throws, so one crash is one FAIL. */
function safe(fn) {
  try { return fn(); } catch (e) { return `error: ${e.message}`; }
}

/** A fake rand() that returns the given numbers in order, then throws if asked for more. */
function fakeRand(values) {
  let i = 0;
  return () => {
    if (i >= values.length) throw new Error("fakeRand ran out of numbers");
    return values[i++];
  };
}

/** Draw `count` numbers from a generator into an array. */
function draw(rand, count) {
  return Array.from({ length: count }, () => rand());
}

// ---------------------------------------------------------------------------
console.log("checkThrows (the test helper itself)");

// The helper must be able to say NO, or every throws test below means nothing.
// Each case: what fn does -> does the rule accept it?
const thrower = () => { throw new Error("rate cannot be negative, got -1"); };
check("right error, right words -> accepted", throwsWith(thrownMessage(thrower), "rate cannot be negative"), true);
check("right error, wrong words -> rejected", throwsWith(thrownMessage(thrower), "same length"), false);
check("typo in the test (not defined) -> rejected",
  throwsWith(thrownMessage(() => notARealFunction()), "rate cannot be negative"), false);
check("did not throw -> rejected", throwsWith(thrownMessage(() => 5), "rate cannot be negative"), false);
check('words "did not throw" when it did not -> still rejected', throwsWith(thrownMessage(() => 5), "did not throw"), false);
check("no words given -> rejected", throwsWith(thrownMessage(thrower), undefined), false);
check("empty words -> rejected (every message contains \"\")", throwsWith(thrownMessage(thrower), ""), false);

// relClose must also be able to say no, above all to the 0 the trap gives.
check("relClose: 3.29e-27 vs 3.29e-27 -> accepted", relClose(3.29e-27, 3.29e-27, 0.001), true);
check("relClose: 0 vs 3.29e-27 -> rejected", relClose(0, 3.29e-27, 0.001), false);
check("relClose: 3.3e-15 (the trap's answer) vs 3.29e-27 -> rejected", relClose(3.3e-15, 3.29e-27, 0.001), false);
check("relClose: 0.2% off with 0.1% allowed -> rejected", relClose(1.002, 1, 0.001), false);

// ---------------------------------------------------------------------------
console.log("\nmakeRng");

// 1. It is really sfc32: matches a separate Python version (plain
//    arithmetic mod 2^32 instead of JavaScript's bit tricks), several seeds,
//    so a hardcoded answer could not pass.
{
  const rand = makeRng(1);
  checkClose("seed 1, 1st number matches Python", rand(), 0.9805858375038952);
  checkClose("seed 1, 2nd number matches Python", rand(), 0.6556431967765093);
  checkClose("seed 1, 3rd number matches Python", rand(), 0.9556611387524754);
  checkClose("seed 0, 1st number matches Python", makeRng(0)(), 0.11025513336062431);
  checkClose("seed 42, 1st number matches Python", makeRng(42)(), 0.6796399562153965);
}

// 2. Same seed -> exactly the same sequence (1,000 numbers).
check("same seed twice gives the same 1,000 numbers", draw(makeRng(7), 1000), draw(makeRng(7), 1000));

// 3. Different seeds -> different sequences.
{
  const a = draw(makeRng(1), 1000);
  const b = draw(makeRng(2), 1000);
  const same = a.filter((x, i) => x === b[i]).length;
  check("seeds 1 and 2 share no numbers in the same position", same, 0);
}

// 4. Two generators don't disturb each other: drawing from one does not
//    change what the other gives next.
{
  const a = makeRng(5);
  const b = makeRng(5);
  draw(a, 100); // use up 100 numbers from a only
  check("drawing from one generator leaves another untouched", b(), makeRng(5)());
}

// 5. Every number is in [0, 1): never below 0, never 1 or more.
{
  const xs = draw(makeRng(3), 10000);
  check("10,000 numbers: none below 0", xs.filter((x) => x < 0).length, 0);
  check("10,000 numbers: none 1 or above", xs.filter((x) => x >= 1).length, 0);
}

// 6. Spread evenly. By hand, for 10,000 even numbers:
//    - below 0.3: expect 3,000; sd = sqrt(10000 x 0.3 x 0.7) = 45.8;
//      3 sd -> 2,863 to 3,137.
//    - mean: expect 0.5; sd = sqrt(1/12 / 10000) = 0.00289; 3 sd -> 0.4913 to 0.5087.
{
  const xs = draw(makeRng(11), 10000);
  checkBetween("count below 0.3 is near 3,000", xs.filter((x) => x < 0.3).length, 2863, 3137);
  checkBetween("mean is near 0.5", xs.reduce((s, x) => s + x, 0) / xs.length, 0.4913, 0.5087);
}

// 7. Neighbors are unrelated: in 5,000 pairs (1st,2nd), (3rd,4th), ...,
//    both below 0.5 should happen 1/4 of the time: expect 1,250;
//    sd = sqrt(5000 x 0.25 x 0.75) = 30.6; 3 sd -> 1,158 to 1,342.
{
  const xs = draw(makeRng(13), 10000);
  let both = 0;
  for (let i = 0; i < xs.length; i += 2) if (xs[i] < 0.5 && xs[i + 1] < 0.5) both++;
  checkBetween("pairs both below 0.5 is near 1,250", both, 1158, 1342);
}

// 8. Edge seeds: the smallest and largest allowed seeds work.
{
  const low = draw(makeRng(0), 1000);
  const high = draw(makeRng(4294967295), 1000);
  check("seed 0 gives numbers in [0, 1)", low.every((x) => x >= 0 && x < 1), true);
  check("seed 4294967295 gives numbers in [0, 1)", high.every((x) => x >= 0 && x < 1), true);
}

// 9. Bad seeds are refused instead of silently becoming some other seed.
checkThrows("seed 1.5 (not whole) throws", () => makeRng(1.5), "seed must be a whole number");
checkThrows("seed -1 (negative) throws", () => makeRng(-1), "seed must be a whole number");
checkThrows("seed 4294967296 (too big) throws", () => makeRng(4294967296), "seed must be a whole number");
checkThrows('seed "1" (text) throws', () => makeRng("1"), "seed must be a whole number");
checkThrows("no seed throws", () => makeRng(), "seed must be a whole number");

// ---------------------------------------------------------------------------
console.log("\nstepCell");

// 1. The hit rule, rand() < p, with hand-picked numbers.
check("rand 0.2 < p 0.5: hit (0 -> 1)", stepCell(0, 4, 0.5, fakeRand([0.2])), 1);
check("rand 0.7 >= p 0.5: miss (0 -> 0)", stepCell(0, 4, 0.5, fakeRand([0.7])), 0);
check("rand 0.3 = p 0.3: miss (the boundary counts as a miss)", stepCell(2, 4, 0.3, fakeRand([0.3])), 2);
check("rand 0.2999 < p 0.3: hit (2 -> 3)", stepCell(2, 4, 0.3, fakeRand([0.2999])), 3);

// 2. Edges of p: p = 0 never hits, even with the smallest rand (0);
//    p = 1 always hits, even with the largest rand (just under 1).
check("p = 0, rand 0: no hit", stepCell(0, 4, 0, fakeRand([0])), 0);
check("p = 1, rand 0.999999: hit", stepCell(0, 4, 1, fakeRand([0.999999])), 1);

// 3. A finished cell (hits = r) stays at r and uses no random number
//    (fakeRand([]) would throw if it were asked for one).
check("hits = r = 4 stays 4, even with p = 1", safe(() => stepCell(4, 4, 1, fakeRand([]))), 4);
check("r = 1: hits 1 stays 1", safe(() => stepCell(1, 1, 1, fakeRand([]))), 1);

// 4. The picture in spec.txt: r = 3, p = 0.5, flips miss HIT miss HIT HIT.
//    By hand: 0.7 miss -> 0; 0.2 hit -> 1; 0.9 miss -> 1; 0.1 hit -> 2; 0.4 hit -> 3.
{
  const rand = fakeRand([0.7, 0.2, 0.9, 0.1, 0.4]);
  const path = [];
  let hits = 0;
  for (let age = 0; age < 5; age++) {
    hits = stepCell(hits, 3, 0.5, rand);
    path.push(hits);
  }
  check("spec picture: hits by age 0..4 are 0,1,1,2,3", path, [0, 1, 1, 2, 3]);
}

// 5. Fixed order: 1,000 separate cells, 10 years each, p = 0.5, r = 4, real
//    random numbers. Every change is +0 or +1 (never +2, never down), and no
//    cell passes r. Many cells, not one: a single cell climbs to r only once,
//    so it would test the +1 step just 4 times.
//    By hand: a cell gets min(4, heads in 10 flips) hits. P(0,1,2,3 heads) =
//    1, 10, 45, 120 out of 1,024; P(4 or more) = 848/1,024. Average per cell =
//    (10x1 + 45x2 + 120x3 + 848x4) / 1,024 = 3,852 / 1,024 = 3.76, so expect
//    3,762 +1 steps. Per-cell variance = 14,838/1,024 - 3.76^2 = 0.34;
//    sd for 1,000 cells = sqrt(340) = 18.4; 3 sd -> 3,707 to 3,817.
{
  const rand = makeRng(21);
  let badSteps = 0;
  let plusOneSteps = 0;
  let maxHits = 0;
  for (let cell = 0; cell < 1000; cell++) {
    let hits = 0;
    for (let year = 0; year < 10; year++) {
      const next = stepCell(hits, 4, 0.5, rand);
      if (next - hits === 1) plusOneSteps++;
      else if (next !== hits) badSteps++;
      hits = next;
      maxHits = Math.max(maxHits, hits);
    }
  }
  checkBetween("1,000 cells x 10 years: about 3,762 +1 steps happened", plusOneSteps, 3707, 3817);
  check("1,000 cells x 10 years: no step other than +0 or +1", badSteps, 0);
  check("1,000 cells x 10 years: never more than r = 4 hits", maxHits, 4);
}

// 6. The chance really is p. 10,000 cells with 0 hits, p = 0.2, one year each.
//    By hand: expect 2,000 hits; sd = sqrt(10000 x 0.2 x 0.8) = 40;
//    3 sd -> 1,880 to 2,120.
{
  const rand = makeRng(22);
  let count = 0;
  for (let i = 0; i < 10000; i++) count += stepCell(0, 4, 0.2, rand);
  checkBetween("p = 0.2: about 2,000 hits in 10,000 tries", count, 1880, 2120);
}

// ---------------------------------------------------------------------------
console.log("\nsimulatePerson");

check("YEARS is 85 (ages 0 to 84)", YEARS, 85);

// 1. No hits possible -> never cancer.
check("p = 0: no cancer (null)", simulatePerson(100, 4, 0, makeRng(1)), null);
check("N = 0 cells: no cancer (null)", simulatePerson(0, 4, 1, makeRng(1)), null);

// 2. p = 1: every cell gains a hit every year (ages 0, 1, 2, ...), so the
//    r-th hit comes at age r - 1. The spec's hand check: r = 3 -> age 2.
check("p = 1, r = 3: cancer at age 2", simulatePerson(100, 3, 1, makeRng(1)), 2);
check("p = 1, r = 1: cancer at age 0", simulatePerson(100, 1, 1, makeRng(1)), 0);
// Boundary: the last simulated age is 84.
check("p = 1, r = 85: cancer at age 84 (the last year)", simulatePerson(1, 85, 1, makeRng(1)), 84);
check("p = 1, r = 86: needs age 85, too late -> null", simulatePerson(1, 86, 1, makeRng(1)), null);

// 3. The picture: N = 2, r = 2, p = 0.5, hand-picked numbers.
//    age 0: A 0.9 miss [0], B 0.1 hit [1]; age 1: A 0.1 hit [1], B 0.9 miss [1];
//    age 2: A 0.2 hit [2] -> cancer at age 2, and B does NOT draw.
//    fakeRand has exactly 5 numbers, so a 6th draw would be an error.
check("picture: 2 cells, cancer at age 2", safe(() => simulatePerson(2, 2, 0.5, fakeRand([0.9, 0.1, 0.1, 0.9, 0.2]))), 2);

// 4. It is the FIRST cell to reach r that counts, not a particular cell:
//    N = 3, r = 1, p = 0.5. Age 0: 0.8, 0.7, 0.6 all miss. Age 1: 0.9 miss,
//    0.9 miss, 0.3 hit on the 3rd cell -> cancer at age 1.
check("3rd cell reaching r first still counts: age 1", safe(() => simulatePerson(3, 1, 0.5, fakeRand([0.8, 0.7, 0.6, 0.9, 0.9, 0.3]))), 1);

// 5. Same seed -> same answer (repeatable runs).
check("same seed gives the same age twice", simulatePerson(100, 4, 0.05, makeRng(9)), simulatePerson(100, 4, 0.05, makeRng(9)));

// 6. One cell, one hit, p = 0.1: each year a 10% chance. 10,000 people.
//    By hand:
//    - cancer at age 0: chance 0.1 -> expect 1,000; sd = sqrt(10000 x 0.1 x 0.9) = 30;
//      3 sd -> 910 to 1,090.
//    - cancer at age 1: miss then hit = 0.9 x 0.1 = 0.09 -> expect 900;
//      sd = sqrt(10000 x 0.09 x 0.91) = 28.6; 3 sd -> 814 to 986.
//    - no cancer by 85: 0.9^85 = 0.000129 -> expect about 1.3 people; allow 0 to 8.
{
  const rand = makeRng(31);
  const ages = Array.from({ length: 10000 }, () => simulatePerson(1, 1, 0.1, rand));
  checkBetween("1 cell: about 1,000 cancers at age 0", ages.filter((a) => a === 0).length, 910, 1090);
  checkBetween("1 cell: about 900 cancers at age 1", ages.filter((a) => a === 1).length, 814, 986);
  checkBetween("1 cell: about 1.3 people with no cancer by 85", ages.filter((a) => a === null).length, 0, 8);
}

// 7. More cells -> more chances. 10 cells, r = 1, p = 0.1: cancer at age 0
//    unless all 10 miss: 1 - 0.9^10 = 0.6513 -> expect 6,513 of 10,000;
//    sd = sqrt(10000 x 0.6513 x 0.3487) = 47.7; 3 sd -> 6,370 to 6,656.
{
  const rand = makeRng(32);
  const ages = Array.from({ length: 10000 }, () => simulatePerson(10, 1, 0.1, rand));
  checkBetween("10 cells: about 6,513 cancers at age 0", ages.filter((a) => a === 0).length, 6370, 6656);
}

// ---------------------------------------------------------------------------
console.log("\nsimulatePopulation");

// 1. Shape of the table: M rows, people numbered 0 ... M-1.
{
  const table = simulatePopulation(3, 100, 3, 1, 1);
  check("p = 1, r = 3, 3 people: everyone gets cancer at age 2",
    table, [{ person: 0, ageAtCancer: 2 }, { person: 1, ageAtCancer: 2 }, { person: 2, ageAtCancer: 2 }]);
  check("p = 0: 50 people, nobody gets cancer", simulatePopulation(50, 100, 4, 0, 1).every((row) => row.ageAtCancer === null), true);
  check("M = 1: one row", simulatePopulation(1, 10, 2, 0.5, 1).length, 1);
}

// 2. Repeatable, but different seeds give different tables.
{
  const a = simulatePopulation(500, 100, 4, 0.05, 3);
  const b = simulatePopulation(500, 100, 4, 0.05, 3);
  const c = simulatePopulation(500, 100, 4, 0.05, 4);
  check("same seed -> identical table", a, b);
  check("different seed -> different table", JSON.stringify(a) === JSON.stringify(c), false);
}

// 3. People are NOT copies of each other. (A classic bug: making a new
//    generator from the same seed for every person, so all ages are equal.)
//    1,000 people, N = 100, r = 4, p = 0.05: ages should vary a lot.
{
  const ages = simulatePopulation(1000, 100, 4, 0.05, 5).map((row) => row.ageAtCancer);
  checkBetween("1,000 people get many different ages (distinct values)", new Set(ages).size, 10, 86);
}

// 4. The default run (spec): M = 20,000, N = 100, r = 4, p = 0.005, seed 1.
//    Expected people with cancer by 85, from a separate Python calculation of
//    the spec's formula: one cell done by 85 = P(Binomial(85, 0.005) >= 4)
//    = 0.000917; person = 1 - (1 - 0.000917)^100 = 0.0876 -> 1,753 of 20,000;
//    sd = sqrt(20000 x 0.0876 x 0.9124) = 40; 3 sd -> 1,633 to 1,873.
//    Also times the run (speed was not measured before).
{
  const start = Date.now();
  const table = simulatePopulation(20000, 100, 4, 0.005, 1);
  const seconds = (Date.now() - start) / 1000;
  checkBetween("default run: about 1,753 people with cancer by 85", table.filter((row) => row.ageAtCancer !== null).length, 1633, 1873);
  console.log(`      (default run took ${seconds.toFixed(2)} s)`);
}

// 5. Bad inputs are refused with a clear error.
checkThrows("M = 0 throws", () => simulatePopulation(0, 100, 4, 0.005, 1), "M (people) must be");
checkThrows("M = 2.5 throws", () => simulatePopulation(2.5, 100, 4, 0.005, 1), "M (people) must be");
checkThrows("N = 0 throws", () => simulatePopulation(10, 0, 4, 0.005, 1), "N (cells) must be");
checkThrows("r = 0 throws", () => simulatePopulation(10, 100, 0, 0.005, 1), "r (hits) must be");
checkThrows("p = -0.1 throws", () => simulatePopulation(10, 100, 4, -0.1, 1), "p must be a number from 0 to 1");
checkThrows("p = 1.5 throws", () => simulatePopulation(10, 100, 4, 1.5, 1), "p must be a number from 0 to 1");
checkThrows("p = NaN throws", () => simulatePopulation(10, 100, 4, NaN, 1), "p must be a number from 0 to 1");
checkThrows('p = "0.1" (text) throws', () => simulatePopulation(10, 100, 4, "0.1", 1), "p must be a number from 0 to 1");
checkThrows("seed 1.5 throws (checked by makeRng)", () => simulatePopulation(10, 100, 4, 0.005, 1.5), "seed must be a whole number");
check("p = 0 and p = 1 are allowed (the edges)", safe(() => simulatePopulation(1, 1, 1, 0, 1).length + simulatePopulation(1, 1, 1, 1, 1).length), 2);

// ---------------------------------------------------------------------------
console.log("\nageGroupRates");

/** A table from a list of ages at cancer (null = no cancer). */
function tableOf(ages) {
  return ages.map((ageAtCancer, person) => ({ person, ageAtCancer }));
}

/** The group starting at `start` (0, 5, ..., 80). */
function group(groups, start) {
  return groups.find((g) => g.start === start);
}

// 1. 17 groups, 0-4 up to 80-84.
{
  const g = ageGroupRates(tableOf([null]));
  check("17 groups", g.length, 17);
  check("first group is 0-4", [g[0].start, g[0].end], [0, 4]);
  check("last group is 80-84", [g[16].start, g[16].end], [80, 84]);
}

// 2. One person, no cancer: 5 person-years and 0 cases in every group, rate 0.
check("no cancer: every group has 5 person-years, 0 cases, rate 0",
  ageGroupRates(tableOf([null])).every((g) => g.personYears === 5 && g.cases === 0 && g.rate === 0), true);

// 3. The picture: cancer at 61.
{
  const g = ageGroupRates(tableOf([61]));
  check("cancer at 61: group 60-64 has 1 case, 2 person-years (ages 60, 61)",
    [group(g, 60).cases, group(g, 60).personYears, group(g, 60).rate], [1, 2, 0.5]);
  check("cancer at 61: group 55-59 has 5 person-years, 0 cases", [group(g, 55).cases, group(g, 55).personYears], [0, 5]);
  check("cancer at 61: group 65-69 has nobody at risk -> rate null", [group(g, 65).personYears, group(g, 65).rate], [0, null]);
}

// 4. Edges of a group, and of the whole age range.
{
  check("cancer at 64 (last age of 60-64): 1 case, 5 person-years",
    [group(ageGroupRates(tableOf([64])), 60).cases, group(ageGroupRates(tableOf([64])), 60).personYears], [1, 5]);
  const g65 = ageGroupRates(tableOf([65]));
  check("cancer at 65: counts in 65-69 (1 case, 1 person-year), not 60-64",
    [group(g65, 60).cases, group(g65, 65).cases, group(g65, 65).personYears], [0, 1, 1]);
  const g0 = ageGroupRates(tableOf([0]));
  check("cancer at 0: group 0-4 has 1 case in 1 person-year, rate 1",
    [group(g0, 0).cases, group(g0, 0).personYears, group(g0, 0).rate], [1, 1, 1]);
  const g84 = ageGroupRates(tableOf([84]));
  check("cancer at 84: group 80-84 has 1 case in 5 person-years, rate 0.2",
    [group(g84, 80).cases, group(g84, 80).personYears, group(g84, 80).rate], [1, 5, 0.2]);
}

// 5. Several people add up. Ages 61, none, 62; group 60-64:
//    cases 2; person-years 2 + 5 + 3 = 10; rate 2 / 10 = 0.2.
{
  const g = group(ageGroupRates(tableOf([61, null, 62])), 60);
  check("ages 61, none, 62: group 60-64 = 2 cases / 10 person-years = 0.2", [g.cases, g.personYears, g.rate], [2, 10, 0.2]);
}

// 6. Empty table: nobody at risk anywhere.
check("empty table: every rate is null", ageGroupRates([]).every((g) => g.rate === null && g.personYears === 0), true);

// 7. Totals on a big simulated table. Every case lands in exactly one group,
//    and each person's years add up to (cancer age + 1), or 85 with no cancer.
{
  const table = simulatePopulation(2000, 100, 4, 0.02, 41);
  const g = ageGroupRates(table);
  const totalCases = table.filter((row) => row.ageAtCancer !== null).length;
  const totalYears = table.reduce((s, row) => s + (row.ageAtCancer === null ? 85 : row.ageAtCancer + 1), 0);
  check("cases over all groups = people with cancer", g.reduce((s, x) => s + x.cases, 0), totalCases);
  check("person-years over all groups = sum of (cancer age + 1, or 85)", g.reduce((s, x) => s + x.personYears, 0), totalYears);
}

// 8. Spec hand check 3: one cell, one hit -> the rate is p in EVERY group.
//    N = 1, r = 1, p = 0.1, 10,000 people. By hand:
//    - 0-4: person-years about 10,000 x (1 - 0.9^5) / 0.1 = 40,951, cases about 4,095;
//      sd of the rate = sqrt(4,095) / 40,951 = 0.0016; 3 sd -> 0.0953 to 0.1047.
//    - 5-9: about 5,905 people left; person-years 24,182, cases 2,418;
//      sd = sqrt(2,418) / 24,182 = 0.0020; 3 sd -> 0.0939 to 0.1061.
{
  const g = ageGroupRates(simulatePopulation(10000, 1, 1, 0.1, 51));
  checkBetween("one hit, p = 0.1: rate in 0-4 is about 0.1", group(g, 0).rate, 0.0953, 0.1047);
  checkBetween("one hit, p = 0.1: rate in 5-9 is about 0.1 (flat)", group(g, 5).rate, 0.0939, 0.1061);
}

// ---------------------------------------------------------------------------
console.log("\nfitLine");

// 1. Spec hand check 4: (0,0), (1,2), (2,1).
//    Means x = 1, y = 1; slope = [(-1)(-1) + 0 + (1)(0)] / [1 + 0 + 1] = 0.5;
//    intercept = 1 - 0.5 x 1 = 0.5; line gives 0.5, 1, 1.5; misses -0.5, 1, -0.5
//    -> squared 1.5; spread of y = 1 + 1 + 0 = 2; R squared = 1 - 1.5/2 = 0.25.
{
  const f = safe(() => fitLine([0, 1, 2], [0, 2, 1]));
  checkClose("(0,0) (1,2) (2,1): slope 0.5", f.slope, 0.5);
  checkClose("(0,0) (1,2) (2,1): intercept 0.5", f.intercept, 0.5);
  checkClose("(0,0) (1,2) (2,1): R squared 0.25", f.rSquared, 0.25);
}

// 2. A second scattered case, so a hardcoded answer can't pass.
//    (1,1) (2,3) (3,2) (4,4): means 2.5, 2.5; x misses -1.5 -0.5 0.5 1.5,
//    y misses -1.5 0.5 -0.5 1.5; sum of products = 2.25 - 0.25 - 0.25 + 2.25 = 4;
//    sum of x misses squared = 5 -> slope 0.8; intercept = 2.5 - 0.8 x 2.5 = 0.5.
//    Line gives 1.3 2.1 2.9 3.7; misses -0.3 0.9 -0.9 0.3 -> squared 1.8;
//    spread of y = 5; R squared = 1 - 1.8/5 = 0.64.
{
  const f = safe(() => fitLine([1, 2, 3, 4], [1, 3, 2, 4]));
  checkClose("(1,1) (2,3) (3,2) (4,4): slope 0.8", f.slope, 0.8);
  checkClose("(1,1) (2,3) (3,2) (4,4): intercept 0.5", f.intercept, 0.5);
  checkClose("(1,1) (2,3) (3,2) (4,4): R squared 0.64", f.rSquared, 0.64);
  check("scattered points: no note", f.note, null);
}

// 3. Points exactly on y = 2x + 1 (x = 0..3: y = 1, 3, 5, 7).
{
  const f = safe(() => fitLine([0, 1, 2, 3], [1, 3, 5, 7]));
  checkClose("on y = 2x + 1: slope 2", f.slope, 2);
  checkClose("on y = 2x + 1: intercept 1", f.intercept, 1);
  checkClose("on y = 2x + 1: R squared 1", f.rSquared, 1);
}

// 4. Negative slope: (0,4) (1,2) (2,0) lie on y = -2x + 4.
{
  const f = safe(() => fitLine([0, 1, 2], [4, 2, 0]));
  checkClose("(0,4) (1,2) (2,0): slope -2", f.slope, -2);
  checkClose("(0,4) (1,2) (2,0): intercept 4", f.intercept, 4);
  checkClose("(0,4) (1,2) (2,0): R squared 1", f.rSquared, 1);
}

// 5. Two points always lie on a line: (1,1) (3,5) -> slope 4/2 = 2,
//    intercept 1 - 2 x 1 = -1, R squared 1.
{
  const f = safe(() => fitLine([1, 3], [1, 5]));
  checkClose("two points (1,1) (3,5): slope 2", f.slope, 2);
  checkClose("two points (1,1) (3,5): intercept -1", f.intercept, -1);
  checkClose("two points (1,1) (3,5): R squared 1", f.rSquared, 1);
}

// 6. The order of the points doesn't matter: test 2 shuffled.
{
  const f = safe(() => fitLine([3, 1, 4, 2], [2, 1, 4, 3]));
  checkClose("test 2 shuffled: slope still 0.8", f.slope, 0.8);
  checkClose("test 2 shuffled: R squared still 0.64", f.rSquared, 0.64);
}

// 7. Every y the same: (0,5) (1,5) (2,5). Slope 0, intercept 5. R squared
//    is 1 - 0/0 (undefined); decided 2026-10-30: report 1, since the points
//    sit exactly on the line, and say why in a note.
{
  const f = safe(() => fitLine([0, 1, 2], [5, 5, 5]));
  checkClose("all y = 5: slope 0", f.slope, 0);
  checkClose("all y = 5: intercept 5", f.intercept, 5);
  check("all y = 5: R squared set to 1", f.rSquared, 1);
  check("all y = 5: note explains the 1", typeof f.note === "string" && f.note.length > 0, true);
}

// 7b. Flat up to rounding noise (decided 2026-11-07): y values within 1e-9
//     of each other count as flat. The 10-30 example: 0.1, 0.10000000000000002,
//     0.1 used to give R squared 0 instead of 1.
{
  const f = safe(() => fitLine([0, 1, 2], [0.1, 0.10000000000000002, 0.1]));
  checkClose("y off in the 17th digit: slope 0", f.slope, 0);
  check("y off in the 17th digit: R squared 1 (was 0)", f.rSquared, 1);
  check("y off in the 17th digit: note explains the 1", typeof f.note === "string" && f.note.length > 0, true);
}

// 7c. Just outside the threshold is NOT flat: test 1's points with y scaled
//     down by 1e-9: (0, 0) (1, 2e-9) (2, 1e-9). Spread 2e-9 > 1e-9.
//     Scaling y scales slope and intercept but not R squared:
//     slope 0.5e-9, R squared 0.25, no note.
{
  const f = safe(() => fitLine([0, 1, 2], [0, 2e-9, 1e-9]));
  checkRelClose("spread 2e-9: a real fit, slope 5e-10", f.slope, 5e-10, 1e-6);
  checkClose("spread 2e-9: R squared 0.25 (not set to 1)", f.rSquared, 0.25);
  check("spread 2e-9: no note", f.note, null);
}

// 8. Inputs it must refuse.
checkThrows("xs and ys of different lengths", () => fitLine([0, 1, 2], [0, 1]), "xs and ys must be the same length");
checkThrows("only 1 point", () => fitLine([1], [1]), "need at least 2 points, got 1");
checkThrows("no points", () => fitLine([], []), "need at least 2 points, got 0");
checkThrows("every x the same (vertical line)", () => fitLine([2, 2], [1, 3]), "vertical line has no slope");

// ---------------------------------------------------------------------------
console.log("\nlogLogFit");

// logLogFit(ages, rates) = fitLine on log(age), log(rate) (natural log),
// skipping rates of 0 or null (no point to plot), plus how many it used and
// skipped. The caller picks which age groups to pass in (decided 2026-11-02).
// For rate = c x age^k the logs give  log(rate) = log(c) + k log(age):
// slope k, intercept log(c).

// Made-up ages, 5 apart: 27, 32, ..., 82 (any positive ages work here).
const middles = Array.from({ length: 12 }, (_, i) => 27 + 5 * i);

// 1. rate = age^3 (c = 1): slope exactly 3, intercept log(1) = 0, R squared 1.
{
  const f = safe(() => logLogFit(middles, middles.map((a) => a ** 3)));
  checkClose("age^3: slope 3", f.slope, 3);
  checkClose("age^3: intercept log(1) = 0", f.intercept, 0);
  checkClose("age^3: R squared 1", f.rSquared, 1);
  check("age^3: used 12, skipped 0", [f.used, f.skipped], [12, 0]);
}

// 2. Two points, rate 1 at age 10 and rate 4 at age 20 (spec Test 4):
//    doubling age multiplies the rate by 4 = 2^2, so slope 2.
//    Intercept: log(1) = b + 2 log(10), so b = -2 log(10) = -4.6052.
{
  const f = safe(() => logLogFit([10, 20], [1, 4]));
  checkClose("(10,1) (20,4): slope 2", f.slope, 2);
  checkClose("(10,1) (20,4): intercept -2 log(10)", f.intercept, -2 * Math.log(10));
}

// 3. A constant that is not 1: rate = 0.001 x age^2 at ages 10, 20, 40
//    (rates 0.1, 0.4, 1.6). Slope 2; intercept log(0.001) = -6.9078.
//    Catches the wrong log base: log10 would give intercept -3.
{
  const f = safe(() => logLogFit([10, 20, 40], [0.1, 0.4, 1.6]));
  checkClose("0.001 age^2: slope 2", f.slope, 2);
  checkClose("0.001 age^2: intercept log(0.001), natural log", f.intercept, Math.log(0.001));
}

// 4. Points NOT on a line. Ages 1, e, e^2 have logs 0, 1, 2; rates 1, e^2, e
//    have logs 0, 2, 1. So the log points are (0,0) (1,2) (2,1), the fitLine
//    case worked by hand above: slope 0.5, intercept 0.5.
//    Line's y: 0.5, 1, 1.5; misses -0.5, 1, -0.5; squared sum 1.5.
//    Spread of y: 1 + 1 + 0 = 2. R squared = 1 - 1.5/2 = 0.25.
//    Catches forgetting a log on either side (the answer would change).
const E = Math.E;
{
  const f = safe(() => logLogFit([1, E, E ** 2], [1, E ** 2, E]));
  checkClose("not a line: slope 0.5", f.slope, 0.5);
  checkClose("not a line: intercept 0.5", f.intercept, 0.5);
  checkClose("not a line: R squared 0.25", f.rSquared, 0.25);
}

// 5. A 0 rate is skipped TOGETHER with its age. Same points as test 4, plus
//    (age 5, rate 0) in front. Same answer, used 3, skipped 1. If the age
//    were not dropped with its rate, the pairs would shift and the slope change.
{
  const f = safe(() => logLogFit([5, 1, E, E ** 2], [0, 1, E ** 2, E]));
  checkClose("0 rate skipped: slope still 0.5", f.slope, 0.5);
  checkClose("0 rate skipped: R squared still 0.25", f.rSquared, 0.25);
  check("0 rate skipped: used 3, skipped 1", [f.used, f.skipped], [3, 1]);
}

// 6. null (nobody at risk) is skipped the same way, here at the end, and
//    with a 0 in the middle: used 3, skipped 2.
{
  const f = safe(() => logLogFit([1, 7, E, E ** 2, 9], [1, 0, E ** 2, E, null]));
  checkClose("0 and null skipped: slope still 0.5", f.slope, 0.5);
  check("0 and null skipped: used 3, skipped 2", [f.used, f.skipped], [3, 2]);
}

// 7. Flat rate (age^0, spec Test 4): every rate 0.1, so every log is the same
//    number. Slope 0, R squared set to 1, and fitLine's note comes through.
{
  const f = safe(() => logLogFit(middles, middles.map(() => 0.1)));
  checkClose("flat 0.1: slope 0", f.slope, 0);
  check("flat 0.1: R squared 1", f.rSquared, 1);
  check("flat 0.1: note explains the 1", typeof f.note === "string" && f.note.length > 0, true);
}

// 8. Inputs it must refuse (decided 2026-11-02).
checkThrows("age 0 (log(0) does not exist)", () => logLogFit([0, 10], [1, 2]), "age must be above 0, got 0");
checkThrows("negative age", () => logLogFit([-5, 10], [1, 2]), "age must be above 0, got -5");
checkThrows("negative rate", () => logLogFit([10, 20], [-1, 2]), "rate cannot be negative");
checkThrows("ages and rates of different lengths", () => logLogFit([10, 20, 30], [1, 2]), "ages and rates must be the same length");
checkThrows("only 1 point left after skipping", () => logLogFit([10, 20], [0, 2]), "need at least 2 points, got 1");
checkThrows("every rate 0: no points", () => logLogFit([10, 20], [0, 0]), "need at least 2 points, got 0");

// ---------------------------------------------------------------------------
console.log("\ncellDoneChance");

// cellDoneChance(t, r, p) = P(Binomial(t, p) >= r): the chance one cell has
// all r hits after t years, adding P(exactly r) + ... + P(exactly t) directly
// (spec: never 1 - P(fewer than r)). P(exactly j) = C(t, j) p^j (1 - p)^(t - j).

// 1. Last session's coin examples (p = 0.5, so every outcome is 1/2^t).
//    t = 3, r = 2: HHT HTH THH HHH -> 4/8.
//    t = 3, r = 1: everything but TTT -> 7/8.
//    t = 2, r = 2: only HH -> 1/4 (so S(2) = 3/4 for one cell).
//    t = 3, r = 3: only HHH -> 1/8 (r = t, the last possible term alone).
checkClose("t=3 r=2 p=0.5: 4/8", safe(() => cellDoneChance(3, 2, 0.5)), 4 / 8);
checkClose("t=3 r=1 p=0.5: 7/8", safe(() => cellDoneChance(3, 1, 0.5)), 7 / 8);
checkClose("t=2 r=2 p=0.5: 1/4", safe(() => cellDoneChance(2, 2, 0.5)), 1 / 4);
checkClose("t=3 r=3 p=0.5: 1/8", safe(() => cellDoneChance(3, 3, 0.5)), 1 / 8);

// 2. p not 0.5, so swapping p and 1 - p is caught. t = 4, r = 2, p = 0.1:
//    exactly 2: C(4,2) x 0.01 x 0.81 = 6 x 0.0081 = 0.0486
//    exactly 3: C(4,3) x 0.001 x 0.9 = 4 x 0.0009 = 0.0036
//    exactly 4: 0.0001
//    sum = 0.0523 (also 1 - 0.9^4 - 4 x 0.1 x 0.9^3 = 1 - 0.6561 - 0.2916).
//    Exact fraction check (Python, fractions): 523/10000.
//    With p and 1 - p swapped it would be 0.9963.
checkClose("t=4 r=2 p=0.1: 0.0523", safe(() => cellDoneChance(4, 2, 0.1)), 0.0523);

// 3. Big coefficients: t = 85, r = 43, p = 0.5. 85 is odd, so "43 or more
//    heads" and "42 or fewer" are mirror images and each is exactly 1/2.
//    Needs C(85, 43) ~ 10^24; 85! (~10^128) would be far too big.
checkClose("t=85 r=43 p=0.5: exactly 1/2 by symmetry", safe(() => cellDoneChance(85, 43, 0.5)), 0.5);

// 4. The arithmetic trap (spec): t = 85, r = 6, p = 1.4e-6.
//    By hand, the first term is nearly all of it:
//      C(85,6) = 85x84x83x82x81x80 / 720 = 437,353,560
//      p^6 = 1.4^6 x 10^-36 = 7.5295e-36;  (1 - p)^79 = 0.99989
//      437,353,560 x 7.5295e-36 x 0.99989 = 3.2928e-27
//    (the next term is 79/7 x p = 1.6e-5 times smaller). Exact fraction
//    check (Python): 3.292757e-27. "1 - P(fewer than 6)" gives about
//    3.3e-15 or 0, which relClose rejects (see the checkThrows section).
checkRelClose("t=85 r=6 p=1.4e-6: 3.2928e-27 (tiny, within 0.1%)", safe(() => cellDoneChance(85, 6, 1.4e-6)), 3.292757e-27, 0.001);

// 5. Edges.
check("r > t: can't have 4 hits in 3 years -> 0", safe(() => cellDoneChance(3, 4, 0.5)), 0);
check("t = 0: no years, no hits -> 0", safe(() => cellDoneChance(0, 1, 0.5)), 0);
check("p = 0: never a hit -> 0", safe(() => cellDoneChance(10, 2, 0)), 0);
check("p = 1, t = 3, r = 3: a hit every year -> 1", safe(() => cellDoneChance(3, 3, 1)), 1);
check("p = 1, t = 2, r = 3: only 2 years -> 0", safe(() => cellDoneChance(2, 3, 1)), 0);

// 6. Inputs it must refuse (same rules and words as simulatePopulation).
checkThrows("t = -1", () => cellDoneChance(-1, 2, 0.5), "t (years) must be a whole number >= 0");
checkThrows("t = 2.5", () => cellDoneChance(2.5, 2, 0.5), "t (years) must be a whole number >= 0");
checkThrows("r = 0", () => cellDoneChance(3, 0, 0.5), "r (hits) must be");
checkThrows("r = 1.5", () => cellDoneChance(3, 1.5, 0.5), "r (hits) must be");
checkThrows("p = -0.1", () => cellDoneChance(3, 2, -0.1), "p must be a number from 0 to 1");
checkThrows("p = 1.5", () => cellDoneChance(3, 2, 1.5), "p must be a number from 0 to 1");
checkThrows("p = NaN", () => cellDoneChance(3, 2, NaN), "p must be a number from 0 to 1");

// ---------------------------------------------------------------------------
console.log("\nexpectedRates");

// expectedRates(N, r, p): the exact rate in each of the 17 groups, no random
// numbers (spec: THE EXACT ANSWER). S(t) = chance a person is cancer-free at
// the start of age t; F(t) = 1 - S(t). For group g..g+4:
//   casesPerPerson = F(g+5) - F(g)   (from F, not S: spec arithmetic trap)
//   personYearsPerPerson = S(g) + S(g+1) + ... + S(g+4)
//   rate = cases / person-years, null when person-years = 0.
// Expected numbers: by hand, and checked with exact fractions in Python.

// 1. Same shape and labels as ageGroupRates: 17 groups, 0-4 ... 80-84.
{
  const groups = safe(() => expectedRates(1, 2, 0.5));
  check("17 groups", groups.length, 17);
  check("labels 0-4, 5-9, ..., 80-84",
    Array.isArray(groups) && groups.map((g) => `${g.start}-${g.end}`).join(","),
    Array.from({ length: 17 }, (_, i) => `${5 * i}-${5 * i + 4}`).join(","));
}

// 2. Spec hand check 5: N = 1, r = 2, p = 0.5. S(0..5) = 1, 1, 3/4, 1/2, 5/16, 3/16.
//    Group 0-4: cases 1 - 3/16 = 13/16; person-years 1+1+3/4+1/2+5/16 = 57/16;
//    rate 13/57 = 0.22807. Group 5-9: cases 181/1024, person-years 53/128,
//    rate 181/424 = 0.42689.
{
  const groups = safe(() => expectedRates(1, 2, 0.5));
  const [g0, g5] = Array.isArray(groups) ? groups : [{}, {}];
  checkClose("N=1 r=2 p=0.5, 0-4: cases per person 13/16", g0.casesPerPerson, 13 / 16);
  checkClose("N=1 r=2 p=0.5, 0-4: person-years 57/16", g0.personYearsPerPerson, 57 / 16);
  checkClose("N=1 r=2 p=0.5, 0-4: rate 13/57", g0.rate, 13 / 57);
  checkClose("N=1 r=2 p=0.5, 5-9: cases per person 181/1024", g5.casesPerPerson, 181 / 1024);
  checkClose("N=1 r=2 p=0.5, 5-9: person-years 53/128", g5.personYearsPerPerson, 53 / 128);
  checkClose("N=1 r=2 p=0.5, 5-9: rate 181/424", g5.rate, 181 / 424);
}

// 3. N cells multiply: N = 2, same r and p. S(t) = (one cell's S)^2:
//    S(0..5) = 1, 1, 9/16, 1/4, 25/256, 9/256.
//    Cases 1 - 9/256 = 247/256; person-years (256+256+144+64+25)/256 = 745/256;
//    rate 247/745 = 0.33154. (Ignoring N would give 13/57 again.)
{
  const g0 = safe(() => expectedRates(2, 2, 0.5)[0]);
  checkClose("N=2 r=2 p=0.5, 0-4: cases per person 247/256", g0.casesPerPerson, 247 / 256);
  checkClose("N=2 r=2 p=0.5, 0-4: person-years 745/256", g0.personYearsPerPerson, 745 / 256);
  checkClose("N=2 r=2 p=0.5, 0-4: rate 247/745", g0.rate, 247 / 745);
}

// 4. Spec hand check 3: r = 1, N = 1, p = 0.1. One hit is cancer, so each
//    year a cancer-free person gets it with chance 0.1: rate 0.1 in EVERY group.
{
  const groups = safe(() => expectedRates(1, 1, 0.1));
  const rates = Array.isArray(groups) ? groups.map((g) => g.rate) : [];
  check("r=1 p=0.1: 17 rates", rates.length, 17);
  check("r=1 p=0.1: every rate 0.1 (within 1e-9)", rates.length === 17 && rates.every((x) => Math.abs(x - 0.1) < 1e-9), true);
}

// 5. p = 0: nobody gets cancer. Every group: 0 cases, 5 person-years, rate 0.
{
  const groups = safe(() => expectedRates(100, 4, 0));
  check("p=0: every group 0 cases, 5 person-years, rate 0",
    Array.isArray(groups) && groups.every((g) => g.casesPerPerson === 0 && g.personYearsPerPerson === 5 && g.rate === 0), true);
}

// 6. p = 1, r = 3: everyone gets cancer at age 2 (hits at ages 0, 1, 2).
//    Group 0-4: 1 case, person-years 3 (ages 0, 1, 2), rate 1/3.
//    Later groups: nobody left at risk -> 0 cases, 0 person-years, rate null.
{
  const groups = safe(() => expectedRates(1, 3, 1));
  const [g0, ...rest] = Array.isArray(groups) ? groups : [{}];
  check("p=1 r=3, 0-4: 1 case per person", g0.casesPerPerson, 1);
  check("p=1 r=3, 0-4: 3 person-years", g0.personYearsPerPerson, 3);
  checkClose("p=1 r=3, 0-4: rate 1/3", g0.rate, 1 / 3);
  check("p=1 r=3, 5-9 ... 80-84: 0 person-years, rate null",
    rest.length === 16 && rest.every((g) => g.personYearsPerPerson === 0 && g.rate === null), true);
}

// 7. The arithmetic trap, realistic sizes: N = 1e8 cells, r = 6, p = 1.4e-6.
//    Group 80-84 from Python with exact fractions and 80-digit decimals:
//    cases per person 1.030331e-19, rate 2.060662e-20. Computing the top as
//    S(80) - S(85) gives 0 here (both are 0.99999... to 16 digits).
{
  const g80 = safe(() => expectedRates(1e8, 6, 1.4e-6)[16]);
  checkRelClose("N=1e8 r=6 p=1.4e-6, 80-84: cases per person 1.0303e-19", g80.casesPerPerson, 1.030331e-19, 0.001);
  checkRelClose("N=1e8 r=6 p=1.4e-6, 80-84: rate 2.0607e-20", g80.rate, 2.060662e-20, 0.001);
}

// 8. No negative cases or rates anywhere, even where nearly everyone already
//    has cancer and S is rounding noise (decided 2026-11-07: S below 1e-12 -> 0,
//    F -> 1). Found by test 6: before the fix, p = 1, r = 3 gave group 10-14
//    cases -2.2e-16 and rate -2. Several settings, so one lucky case can't pass.
{
  const settings = [[1, 3, 1], [1, 1, 1], [5, 10, 1], [1, 2, 0.5], [3, 4, 0.9], [100, 4, 0.005]];
  for (const [N, r, p] of settings) {
    const groups = safe(() => expectedRates(N, r, p));
    check(`N=${N} r=${r} p=${p}: no negative cases, no negative rate`,
      Array.isArray(groups) && groups.every((g) => g.casesPerPerson >= 0 && (g.rate === null || g.rate >= 0)), true);
  }
}

// 9. The cutoff only removes noise: a real tiny S above 1e-12 is kept.
//    N = 1, r = 2, p = 0.5, age 40: S = P(at most 1 head in 40 flips)
//    = (1 + 40) / 2^40 = 41 / 1,099,511,627,776 = 3.73e-11 (above 1e-12).
//    Group 40-44 person-years starts with S(40), so it must be > 3.7e-11.
{
  const g40 = safe(() => expectedRates(1, 2, 0.5)[8]);
  check("real S of 3.7e-11 at age 40 is kept (person-years > 3.7e-11)", g40.personYearsPerPerson > 3.7e-11, true);
}

// 10. The flat-rate case end to end, as runReport will use it: r = 1 rates
//     for groups 25-29 ... 80-84 (all 0.1, off in the 13th digit) through
//     logLogFit. Before 2026-11-07 this gave R squared 0.61; flat -> 1, slope 0.
{
  const groups = safe(() => expectedRates(1, 1, 0.1).slice(5));
  const f = safe(() => logLogFit(groups.map((g) => g.start + 2), groups.map((g) => g.rate)));
  checkClose("r=1 p=0.1 through logLogFit: slope 0", f.slope, 0);
  check("r=1 p=0.1 through logLogFit: R squared 1 (was 0.61)", f.rSquared, 1);
  check("r=1 p=0.1 through logLogFit: note explains the 1", typeof f.note === "string" && f.note.length > 0, true);
}

// 11. Inputs it must refuse (same words as simulatePopulation).
checkThrows("N = 0", () => expectedRates(0, 2, 0.5), "N (cells) must be");
checkThrows("N = 2.5", () => expectedRates(2.5, 2, 0.5), "N (cells) must be");
checkThrows("r = 0", () => expectedRates(1, 0, 0.5), "r (hits) must be");
checkThrows("p = 1.5", () => expectedRates(1, 2, 1.5), "p must be a number from 0 to 1");

// ---------------------------------------------------------------------------
console.log("\nzScores");

// zScores(simulated, expected, M): for each age group,
//   expectedCases = M x casesPerPerson,  z = (simulated - expected) / sqrt(expected)
// plus a note (decided 2026-11-09):
//   expected 0 -> z null, note "expected 0" (or "impossible: expected 0" if
//                 the simulation had cases anyway: a bug, shown red);
//   expected < 10 -> z kept, note "few cases" (z unreliable: measured, small
//                 counts give yellow/red too often and can't go below -3).
// Small made-up groups so every number is easy by hand. M = 1,000 people.

/** Made-up simulated groups (only start, end, cases matter). */
function simGroups(casesList) {
  return casesList.map((cases, i) => ({ start: 5 * i, end: 5 * i + 4, cases }));
}
/** Made-up expected groups (only start, end, casesPerPerson matter). */
function expGroups(perPersonList) {
  return perPersonList.map((c, i) => ({ start: 5 * i, end: 5 * i + 4, casesPerPerson: c }));
}

// 1. The spec's example: expected 100 (1,000 x 0.1).
//    Got 130: z = 30 / sqrt(100) = 30 / 10 = 3.   Got 100: z = 0.
//    Got 80: z = -20 / 10 = -2 (the sign is kept: too FEW cases).
{
  const z = safe(() => zScores(simGroups([130, 100, 80]), expGroups([0.1, 0.1, 0.1]), 1000));
  check("expected 100, got 130: expectedCases 100", z[0] && z[0].expectedCases, 100);
  checkClose("expected 100, got 130: z = 3", z[0] && z[0].z, 3);
  checkClose("expected 100, got 100: z = 0", z[1] && z[1].z, 0);
  checkClose("expected 100, got 80: z = -2 (sign kept)", z[2] && z[2].z, -2);
  check("expected 100: no note", [z[0] && z[0].note, z[2] && z[2].note], [null, null]);
  check("labels and simulated cases carried through", z[0] && [z[0].start, z[0].end, z[0].simulatedCases], [0, 4, 130]);
}

// 2. M really is used: same groups, M = 4,000 -> expected 400, got 440:
//    z = 40 / 20 = 2.
{
  const z = safe(() => zScores(simGroups([440]), expGroups([0.1]), 4000));
  checkClose("M = 4,000: expected 400, got 440: z = 2", z[0] && z[0].z, 2);
}

// 3. Few cases: expected 4 (1,000 x 0.004), got 6: z = 2 / 2 = 1, note "few cases".
//    Boundary: expected exactly 10 is NOT few; 9.99 is.
{
  const z = safe(() => zScores(simGroups([6, 10, 10]), expGroups([0.004, 0.01, 0.00999]), 1000));
  checkClose("expected 4, got 6: z = 1", z[0] && z[0].z, 1);
  check("expected 4: note 'few cases'", z[0] && z[0].note, "few cases");
  check("expected exactly 10: not few", z[1] && z[1].note, null);
  check("expected 9.99: few", z[2] && z[2].note, "few cases");
}

// 4. Expected exactly 0 (like group 0-4 when r = 6: 6 hits in 5 years is
//    impossible). Got 0 -> z null, "expected 0". Got 2 -> z null,
//    "impossible: expected 0" (a bug somewhere; the report shows it red).
{
  const z = safe(() => zScores(simGroups([0, 2]), expGroups([0, 0]), 1000));
  check("expected 0, got 0: z null", z[0] && z[0].z, null);
  check("expected 0, got 0: note 'expected 0'", z[0] && z[0].note, "expected 0");
  check("expected 0, got 2: z null", z[1] && z[1].z, null);
  check("expected 0, got 2: note 'impossible: expected 0'", z[1] && z[1].note, "impossible: expected 0");
}

// 5. Real groups line up: ageGroupRates and expectedRates both give the 17
//    groups 0-4 ... 80-84, so zScores accepts them and returns 17 z's.
{
  const sim = ageGroupRates([{ ageAtCancer: 30 }, { ageAtCancer: null }]);
  const z = safe(() => zScores(sim, expectedRates(1, 2, 0.5), 2));
  check("real ageGroupRates + expectedRates: 17 results", Array.isArray(z) && z.length, 17);
}

// 6. Inputs it must refuse: groups that don't line up would compare the
//    wrong ages, silently.
checkThrows("different numbers of groups", () => zScores(simGroups([1, 2]), expGroups([0.1]), 1000), "same number of age groups");
checkThrows("labels don't match (0-4 vs 5-9)",
  () => zScores(simGroups([1]), [{ start: 5, end: 9, casesPerPerson: 0.1 }], 1000), "age groups don't line up");
checkThrows("M = 0", () => zScores(simGroups([1]), expGroups([0.1]), 0), "M (people) must be");
checkThrows("M = 2.5", () => zScores(simGroups([1]), expGroups([0.1]), 2.5), "M (people) must be");

// ---------------------------------------------------------------------------
console.log("\nsummarizeZ");

// summarizeZ(zGroups): over the groups used for the slope (25-29 and up) whose
// z is reliable (a number, no note): the largest |z| WITH its sign and group,
// and the sum of z^2 (spec item 10: catches every z small but all leaning the
// same way; noise alone gives about the number of groups).

// 1. Made-up groups, by hand:
//    20-24 z 5          -> left out (under 25)
//    25-29 z 1          -> in: 1^2    = 1
//    30-34 z -2.5       -> in: 2.5^2  = 6.25   <- largest |z|, and it's negative
//    35-39 z 0.5        -> in: 0.5^2  = 0.25
//    40-44 z 4 "few"    -> left out (unreliable)
//    45-49 null         -> left out (expected 0)
//    sum = 7.5 over 3 groups; largest = -2.5 at 30-34 (not 5, not 4).
{
  const groups = [
    { start: 20, end: 24, z: 5, note: null },
    { start: 25, end: 29, z: 1, note: null },
    { start: 30, end: 34, z: -2.5, note: null },
    { start: 35, end: 39, z: 0.5, note: null },
    { start: 40, end: 44, z: 4, note: "few cases" },
    { start: 45, end: 49, z: null, note: "expected 0" },
  ];
  const s = safe(() => summarizeZ(groups));
  check("largest |z|: -2.5 at 30-34, sign kept", s.largest, { z: -2.5, start: 30, end: 34 });
  checkClose("sum of z^2: 1 + 6.25 + 0.25 = 7.5", s.sumZ2, 7.5);
  check("3 groups in the sum", s.groupsInSum, 3);
}

// 2. The hidden bend from spec item 10: 12 groups all at z = +1.5. No single
//    group is yellow, but sum of z^2 = 12 x 2.25 = 27, versus about 12 for noise.
{
  const groups = Array.from({ length: 12 }, (_, i) => ({ start: 25 + 5 * i, end: 29 + 5 * i, z: 1.5, note: null }));
  const s = safe(() => summarizeZ(groups));
  checkClose("12 groups at z = 1.5: sum of z^2 = 27", s.sumZ2, 27);
}

// 3. Nothing usable: largest null, sum 0, 0 groups.
{
  const s = safe(() => summarizeZ([{ start: 10, end: 14, z: 2, note: null }, { start: 30, end: 34, z: null, note: "expected 0" }]));
  check("nothing usable: largest null, sum 0, 0 groups", [s.largest, s.sumZ2, s.groupsInSum], [null, 0, 0]);
}

// ---------------------------------------------------------------------------
console.log("\nrunReport");

// runReport(M, N, r, p, seed) puts it all together: simulate, ageGroupRates,
// expectedRates, zScores, logLogFit on groups 25-29 ... 80-84 (middle ages
// 27.5, 32.5, ..., 82.5) for both the simulated and the exact rates, summarizeZ.

// 1. The exact slope for the defaults is the spec's 2.84 (worked out
//    2026-10-09 with a separate program), close to but below r - 1 = 3.
{
  const rep = safe(() => runReport(2000, 100, 4, 0.005, 1));
  checkBetween("defaults: exact slope 2.84 (spec)", rep.exactFit && rep.exactFit.slope, 2.835, 2.845);
}

// 2. Same seed -> exactly the same report; a different seed -> different people.
{
  const a = safe(() => JSON.stringify(runReport(2000, 100, 4, 0.005, 7)));
  const b = safe(() => JSON.stringify(runReport(2000, 100, 4, 0.005, 7)));
  const c = safe(() => runReport(2000, 100, 4, 0.005, 8));
  const aCases = safe(() => JSON.parse(a).groups.map((g) => g.simulatedCases).join());
  check("same seed: identical report", a === b && a.length > 100, true);
  check("different seed: different cases", Array.isArray(c.groups) && c.groups.map((g) => g.simulatedCases).join() !== aCases, true);
}

// 3. Wired to the right pieces: the report's simulated cases are exactly what
//    ageGroupRates gives for the same people (same seed).
{
  const rep = safe(() => runReport(2000, 100, 4, 0.005, 3));
  const direct = ageGroupRates(simulatePopulation(2000, 100, 4, 0.005, 3)).map((g) => g.cases);
  check("simulated cases match ageGroupRates(simulatePopulation(...))",
    Array.isArray(rep.groups) && rep.groups.map((g) => g.simulatedCases).join(), direct.join());
  check("the summary is summarizeZ of the report's groups", rep.zSummary, safe(() => summarizeZ(rep.groups)));
}

// 4. p = 1, r = 3, M = 50: everyone gets cancer at age 2, by hand.
//    Group 0-4: 50 simulated, 50 expected, z = 0 / sqrt(50) = 0.
//    Groups 5-9 and up: nobody left: 0 simulated, 0 expected -> "expected 0";
//    left out of the slope: under 25 (0-24), nobody at risk (25 and up).
//    No group 25+ has cases, so there is no simulated or exact slope.
{
  const rep = safe(() => runReport(50, 10, 3, 1, 1));
  const g = Array.isArray(rep.groups) ? rep.groups : [];
  check("p=1 r=3: 0-4 has 50 simulated, 50 expected", g[0] && [g[0].simulatedCases, g[0].expectedCases], [50, 50]);
  checkClose("p=1 r=3: 0-4 z = 0", g[0] && g[0].z, 0);
  check("p=1 r=3: groups 5-84 all 'expected 0'", g.length === 17 && g.slice(1).every((x) => x.note === "expected 0"), true);
  check("p=1 r=3: left out as 'under 25' for 0-24",
    g.slice(0, 5).map((x) => x.leftOutReason).join(), "under 25,under 25,under 25,under 25,under 25");
  check("p=1 r=3: left out as 'nobody at risk' for 25-84",
    g.length === 17 && g.slice(5).every((x) => x.leftOutReason === "nobody at risk"), true);
  check("p=1 r=3: no simulated slope, with a reason", [rep.simulatedFit, typeof rep.simulatedFitProblem], [null, "string"]);
  check("p=1 r=3: no exact slope, with a reason", [rep.exactFit, typeof rep.exactFitProblem], [null, "string"]);
}

// 5. Small M = 300 with the defaults: young groups 25+ have expected < 1
//    case (25-29: 16.3 / 20,000 x 300 = 0.24), so some have 0 simulated
//    cases. Every group 25+ with people at risk is either in the slope (has
//    cases) or left out as "0 cases", and the fit used exactly the in-slope ones.
{
  const rep = safe(() => runReport(300, 100, 4, 0.005, 1));
  const g = Array.isArray(rep.groups) ? rep.groups.slice(5) : [];
  check("M=300: some group 25+ has 0 cases (so the test means something)", g.some((x) => x.simulatedCases === 0), true);
  check("M=300: 0 cases -> left out as '0 cases'; else in the slope",
    g.length === 12 && g.every((x) => (x.simulatedCases === 0 ? x.leftOutReason === "0 cases" && !x.inSlope : x.inSlope && x.leftOutReason === null)), true);
  check("M=300: simulated fit used exactly the in-slope groups",
    rep.simulatedFit && rep.simulatedFit.used, g.filter((x) => x.inSlope).length);
}

// 6. Bad inputs are refused (by simulatePopulation, same words).
checkThrows("p = 1.5", () => runReport(100, 100, 4, 1.5, 1), "p must be a number from 0 to 1");
checkThrows("M = 0", () => runReport(0, 100, 4, 0.005, 1), "M (people) must be");

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
