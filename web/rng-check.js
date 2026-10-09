// rng-check.js - a slow (about 10 seconds) check of makeRng, run from web/:  node rng-check.js
// It found the problem with our first generator (mulberry32) on 2026-10-09,
// which the quick tests in model.test.js could not see.
//
// The check: 30 million cells, r = 4, p = 0.005, 85 years each. Count how
// many end with 0, 1, 2, 3, 4 hits and compare with the exact chances,
// computed year by year: each year, a cell with h < 4 hits moves to h + 1
// with chance p and stays with chance 1 - p. Each count must be within
// 4 standard deviations (|z| < 4) of what's expected.
//   mulberry32: z = -9.61, 6.92, 4.89, 3.10, 1.40  -> FAIL
//   sfc32:      z = -0.69, 0.12, 0.92, 0.07, 1.73  -> pass

const { makeRng, stepCell } = require("./model.js");

/** Exact chance of having 0 ... r hits after `years` years (year-by-year bookkeeping). */
function exactHitChances(r, p, years) {
  let chance = new Array(r + 1).fill(0);
  chance[0] = 1;
  for (let y = 0; y < years; y++) {
    const next = new Array(r + 1).fill(0);
    for (let h = 0; h <= r; h++) {
      if (h === r) next[r] += chance[r];
      else {
        next[h] += chance[h] * (1 - p);
        next[h + 1] += chance[h] * p;
      }
    }
    chance = next;
  }
  return chance;
}

/** Run the check for one seed; return true if every |z| < 4. */
function checkSeed(seed, cells, r, p, years) {
  const rand = makeRng(seed);
  const counts = new Array(r + 1).fill(0);
  for (let c = 0; c < cells; c++) {
    let hits = 0;
    for (let y = 0; y < years; y++) hits = stepCell(hits, r, p, rand);
    counts[hits]++;
  }
  const chance = exactHitChances(r, p, years);
  const z = counts.map((k, h) => (k - chance[h] * cells) / Math.sqrt(cells * chance[h] * (1 - chance[h])));
  const ok = z.every((v) => Math.abs(v) < 4);
  console.log(`${ok ? "PASS" : "FAIL"}  seed ${seed}: z for 0..${r} hits = ${z.map((v) => v.toFixed(2)).join(", ")}`);
  return ok;
}

const ok = checkSeed(2024, 3e7, 4, 0.005, 85);
if (!ok) process.exit(1);
