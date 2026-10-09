// model.test.js - checks for model.js. Run from the web/ folder:  node model.test.js
// Every expected number below was worked out by hand (or by a separate,
// differently written program) rather than copied from model.js output.

const { makeRng, stepCell, YEARS, simulatePerson, simulatePopulation, ageGroupRates } = require("./model.js");

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

/** Record a check that `fn` throws an error. */
function checkThrows(name, fn) {
  let threw = false;
  try { fn(); } catch (e) { threw = true; }
  check(name, threw, true);
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
console.log("makeRng");

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
checkThrows("seed 1.5 (not whole) throws", () => makeRng(1.5));
checkThrows("seed -1 (negative) throws", () => makeRng(-1));
checkThrows("seed 4294967296 (too big) throws", () => makeRng(4294967296));
checkThrows('seed "1" (text) throws', () => makeRng("1"));
checkThrows("no seed throws", () => makeRng());

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
checkThrows("M = 0 throws", () => simulatePopulation(0, 100, 4, 0.005, 1));
checkThrows("M = 2.5 throws", () => simulatePopulation(2.5, 100, 4, 0.005, 1));
checkThrows("N = 0 throws", () => simulatePopulation(10, 0, 4, 0.005, 1));
checkThrows("r = 0 throws", () => simulatePopulation(10, 100, 0, 0.005, 1));
checkThrows("p = -0.1 throws", () => simulatePopulation(10, 100, 4, -0.1, 1));
checkThrows("p = 1.5 throws", () => simulatePopulation(10, 100, 4, 1.5, 1));
checkThrows("p = NaN throws", () => simulatePopulation(10, 100, 4, NaN, 1));
checkThrows('p = "0.1" (text) throws', () => simulatePopulation(10, 100, 4, "0.1", 1));
checkThrows("seed 1.5 throws (checked by makeRng)", () => simulatePopulation(10, 100, 4, 0.005, 1.5));
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
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
