// learn-slope.js - teaching pictures for "how r (hits) relates to the log-log slope".
// Run from web/:  node learn-slope.js
// Writes ../output/learn/*.svg and prints every number in the tables.
// Not part of the model: it counts things by hand-checkable rules.

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "output", "learn");
fs.mkdirSync(OUT, { recursive: true });
const BLUE = "#2a78d6", ORANGE = "#d9822b", GREEN = "#2f9e6f", INK = "#0b0b0b", MUTED = "#52514e", GRID = "#e6e5e0", BG = "#fcfcfb";

/** Ways to pick k different years out of n years: C(n, k). */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return Math.round(c);
}

/** Ways a cell can get its LAST (r-th) hit exactly in year `age`: the first r-1 hits go in r-1 of the earlier age-1 years. */
function ways(age, r) {
  return choose(age - 1, r - 1);
}

function svgStart(W, H, title, subtitle) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`,
    `<rect width="${W}" height="${H}" fill="${BG}"/>`,
    `<text x="24" y="30" font-size="18" font-weight="600" fill="${INK}">${title}</text>`,
    `<text x="24" y="52" font-size="13" fill="${MUTED}">${subtitle}</text>`,
  ];
}

// ---------------------------------------------------------------------------
// Figure 1: the slope gives the RATIO, not the height.
// Two lines with the same slope 3, one 100x higher. Both go x8 from 30 to 60.
// ---------------------------------------------------------------------------
{
  const W = 720, H = 480, left = 80, right = 30, top = 80, bottom = 60;
  const xMin = 1, xMax = 100, yMin = 1e-2, yMax = 1e7;
  const xp = (a) => left + (Math.log10(a) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * (W - left - right);
  const yp = (v) => H - bottom - (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) * (H - top - bottom);
  const lineA = (a) => 1 * a ** 3;   // rate = 1 x age^3
  const lineB = (a) => 0.01 * a ** 3; // rate = 0.01 x age^3 (100x lower, same slope)
  const s = svgStart(W, H, "Same slope, different height", "Both lines have slope 3. The slope says how fast the rate rises, not where the line sits.");
  for (const a of [1, 2, 5, 10, 30, 60, 100]) {
    s.push(`<line x1="${xp(a)}" y1="${top}" x2="${xp(a)}" y2="${H - bottom}" stroke="${GRID}"/>`);
    s.push(`<text x="${xp(a)}" y="${H - bottom + 20}" font-size="12" fill="${MUTED}" text-anchor="middle">${a}</text>`);
  }
  for (let e = -2; e <= 7; e++) {
    const v = 10 ** e;
    s.push(`<line x1="${left}" y1="${yp(v)}" x2="${W - right}" y2="${yp(v)}" stroke="${GRID}"/>`);
    s.push(`<text x="${left - 8}" y="${yp(v) + 4}" font-size="11" fill="${MUTED}" text-anchor="end">${v >= 1 ? v.toLocaleString("en-US") : v}</text>`);
  }
  s.push(`<text x="${(left + W - right) / 2}" y="${H - 18}" font-size="13" fill="${MUTED}" text-anchor="middle">Age (log scale)</text>`);
  s.push(`<text transform="translate(22 ${(top + H - bottom) / 2}) rotate(-90)" font-size="13" fill="${MUTED}" text-anchor="middle">Rate (made-up units, log scale)</text>`);
  for (const [f, color, label] of [[lineA, BLUE, "rate = 1 × age³"], [lineB, ORANGE, "rate = 0.01 × age³  (100× lower)"]]) {
    s.push(`<line x1="${xp(1)}" y1="${yp(f(1))}" x2="${xp(100)}" y2="${yp(f(100))}" stroke="${color}" stroke-width="2.5"/>`);
    for (const a of [30, 60]) {
      s.push(`<circle cx="${xp(a)}" cy="${yp(f(a))}" r="5" fill="${color}" stroke="${BG}" stroke-width="2"/>`);
      s.push(`<text x="${xp(a) - 8}" y="${yp(f(a)) - 10}" font-size="12" fill="${color}" text-anchor="end">${f(a).toLocaleString("en-US")}</text>`);
    }
    s.push(`<text x="${xp(1.3)}" y="${yp(f(1.3)) - 14}" font-size="12" fill="${color}">${label}</text>`);
  }
  s.push(`<text x="${W - right - 8}" y="${top + 20}" font-size="12" fill="${INK}" text-anchor="end">30 → 60: blue 27,000 → 216,000 (×8); orange 270 → 2,160 (×8)</text>`);
  s.push(`<text x="${W - right - 8}" y="${top + 38}" font-size="12" fill="${INK}" text-anchor="end">1 → 2 also ×8 on both lines: every doubling of age is ×2³ = ×8</text>`);
  s.push("</svg>");
  fs.writeFileSync(path.join(OUT, "1-same-slope-different-height.svg"), s.join("\n"));
  console.log("Figure 1: rate = c x age^3");
  for (const a of [1, 2, 30, 60]) console.log(`  age ${a}: blue ${lineA(a)}, orange ${lineB(a)}`);
}

// ---------------------------------------------------------------------------
// Figure 2: counting the ways, r = 3. A cell gets cancer in year `age` if hit 3
// lands this year and hits 1 and 2 landed in two different earlier years
// (hit 1 before hit 2). Each dot is one (year of hit 1, year of hit 2) pair.
// ---------------------------------------------------------------------------
{
  const W = 760, H = 470, cell = 15;
  const s = svgStart(W, H, "Why r = 3 hits gives slope 2: count the ways", "Each dot = one way to place hits 1 and 2 in earlier years (hit 1 first). Hit 3 lands this year.");
  const panels = [{ age: 10, x0: 60 }, { age: 20, x0: 330 }];
  for (const { age, x0 } of panels) {
    const n = age - 1; // earlier years: 1 .. age-1
    const y0 = 100 + 19 * cell; // bottom of the grid (both panels share the scale)
    let count = 0;
    s.push(`<rect x="${x0}" y="${y0 - n * cell}" width="${n * cell}" height="${n * cell}" fill="none" stroke="${GRID}"/>`);
    for (let h1 = 1; h1 <= n; h1++) {
      for (let h2 = 1; h2 <= n; h2++) {
        const cx = x0 + (h1 - 0.5) * cell, cy = y0 - (h2 - 0.5) * cell;
        if (h1 < h2) { s.push(`<circle cx="${cx}" cy="${cy}" r="4.5" fill="${BLUE}"/>`); count++; }
        else s.push(`<circle cx="${cx}" cy="${cy}" r="1.5" fill="${GRID}"/>`);
      }
    }
    s.push(`<text x="${x0 + (n * cell) / 2}" y="${y0 + 20}" font-size="12" fill="${MUTED}" text-anchor="middle">year of hit 1 (1 to ${n})</text>`);
    s.push(`<text transform="translate(${x0 - 12} ${y0 - (n * cell) / 2}) rotate(-90)" font-size="12" fill="${MUTED}" text-anchor="middle">year of hit 2</text>`);
    s.push(`<text x="${x0}" y="${y0 + 42}" font-size="14" font-weight="600" fill="${INK}">age ${age}: ${count} ways</text>`);
    if (count !== ways(age, 3)) throw new Error("dot count does not match C(age-1, 2)");
  }
  s.push(`<text x="640" y="200" font-size="13" fill="${INK}" text-anchor="middle">Age doubles</text>`);
  s.push(`<text x="640" y="218" font-size="13" fill="${INK}" text-anchor="middle">→ the triangle is</text>`);
  s.push(`<text x="640" y="236" font-size="13" fill="${INK}" text-anchor="middle">twice as wide AND</text>`);
  s.push(`<text x="640" y="254" font-size="13" fill="${INK}" text-anchor="middle">twice as tall</text>`);
  s.push(`<text x="640" y="282" font-size="13" font-weight="600" fill="${INK}" text-anchor="middle">→ about ×4 the dots</text>`);
  s.push(`<text x="640" y="300" font-size="12" fill="${MUTED}" text-anchor="middle">(171 / 36 = 4.75; nearer 4</text>`);
  s.push(`<text x="640" y="316" font-size="12" fill="${MUTED}" text-anchor="middle">at bigger ages, see table)</text>`);
  s.push("</svg>");
  fs.writeFileSync(path.join(OUT, "2-counting-ways-r3.svg"), s.join("\n"));
  console.log(`\nFigure 2: r = 3 ways at age 10 = ${ways(10, 3)}, at age 20 = ${ways(20, 3)}`);
}

// ---------------------------------------------------------------------------
// Figure 3: number of ways vs age on log-log axes for r = 2, 3, 4.
// Straight lines with slopes close to 1, 2, 3 = r - 1.
// ---------------------------------------------------------------------------
{
  const W = 720, H = 480, left = 80, right = 150, top = 80, bottom = 60;
  const xMin = 5, xMax = 100, yMin = 1, yMax = 1e6;
  const xp = (a) => left + (Math.log10(a) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * (W - left - right);
  const yp = (v) => H - bottom - (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) * (H - top - bottom);
  const s = svgStart(W, H, "Ways to get cancer this year, by age", "Log-log axes. More hits needed → the count grows faster with age → steeper line.");
  for (const a of [5, 10, 20, 30, 60, 100]) {
    s.push(`<line x1="${xp(a)}" y1="${top}" x2="${xp(a)}" y2="${H - bottom}" stroke="${GRID}"/>`);
    s.push(`<text x="${xp(a)}" y="${H - bottom + 20}" font-size="12" fill="${MUTED}" text-anchor="middle">${a}</text>`);
  }
  for (let e = 0; e <= 6; e++) {
    s.push(`<line x1="${left}" y1="${yp(10 ** e)}" x2="${W - right}" y2="${yp(10 ** e)}" stroke="${GRID}"/>`);
    s.push(`<text x="${left - 8}" y="${yp(10 ** e) + 4}" font-size="11" fill="${MUTED}" text-anchor="end">${(10 ** e).toLocaleString("en-US")}</text>`);
  }
  s.push(`<text x="${(left + W - right) / 2}" y="${H - 18}" font-size="13" fill="${MUTED}" text-anchor="middle">Age (log scale)</text>`);
  s.push(`<text transform="translate(22 ${(top + H - bottom) / 2}) rotate(-90)" font-size="13" fill="${MUTED}" text-anchor="middle">Number of ways (log scale)</text>`);
  for (const [r, color] of [[2, ORANGE], [3, BLUE], [4, GREEN]]) {
    const pts = [];
    for (let a = 5; a <= 100; a++) pts.push(`${xp(a).toFixed(1)},${yp(ways(a, r)).toFixed(1)}`);
    s.push(`<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${pts.join(" ")}"/>`);
    const slope = Math.log(ways(60, r) / ways(30, r)) / Math.log(2);
    s.push(`<text x="${xp(100) + 8}" y="${yp(ways(100, r)) + 4}" font-size="12" fill="${color}">r = ${r}: slope ≈ ${slope.toFixed(2)}</text>`);
  }
  s.push("</svg>");
  fs.writeFileSync(path.join(OUT, "3-ways-loglog.svg"), s.join("\n"));
}

// ---------------------------------------------------------------------------
// Figure 4 (the slow version of idea 2): r = 2, 1000 cells, p = 1/1000 per year.
// Only cells that ALREADY have mutation 1 can get cancer this year.
// Expected number with mutation 1 by age t: 1000 x (1 - (1 - 1/1000)^t).
// ---------------------------------------------------------------------------
{
  const P = 1 / 1000, CELLS = 1000, cols = 40, rows = 25, d = 7;
  const W = 3 * (cols * d + 40) + 40, H = 330;
  const s = svgStart(W, H, "Two mutations needed: who is ready at each age?",
    "1,000 cells. Each year, each cell has a 1 in 1,000 chance of a mutation. Orange = already has mutation 1, so it is one step from cancer.");
  console.log("\nFigure 4: r = 2, 1000 cells, p = 1/1000");
  [10, 20, 40].forEach((age, i) => {
    const ready = Math.round(CELLS * (1 - (1 - P) ** age));
    const x0 = 40 + i * (cols * d + 40), y0 = 80;
    for (let k = 0; k < CELLS; k++) {
      const cx = x0 + (k % cols) * d + d / 2, cy = y0 + Math.floor(k / cols) * d + d / 2;
      s.push(k < ready ? `<circle cx="${cx}" cy="${cy}" r="3" fill="${ORANGE}"/>` : `<circle cx="${cx}" cy="${cy}" r="1.6" fill="#c9c8c2"/>`);
    }
    const yText = y0 + rows * d + 24;
    s.push(`<text x="${x0}" y="${yText}" font-size="15" font-weight="600" fill="${INK}">age ${age}: about ${ready} ready</text>`);
    s.push(`<text x="${x0}" y="${yText + 20}" font-size="12" fill="${MUTED}">cancers this year ≈ ${ready} × 1/1000 = ${(ready / 1000).toFixed(3)}</text>`);
    console.log(`  age ${age}: ${(CELLS * (1 - (1 - P) ** age)).toFixed(2)} cells have mutation 1 -> rate ${(ready / 1000).toFixed(3)}`);
  });
  s.push("</svg>");
  fs.writeFileSync(path.join(OUT, "4-r2-who-is-ready.svg"), s.join("\n"));
}

// ---------------------------------------------------------------------------
// Figure 5: r = 3, 10,000 cells, p = 1/1000 per year.
// Gray = 0 mutations, orange = exactly 1, red = exactly 2 (ready: one step from cancer).
// Expected count with exactly k mutations by age t: 10000 x C(t,k) p^k (1-p)^(t-k).
// ---------------------------------------------------------------------------
{
  const P = 1 / 1000, CELLS = 10000, side = 100, d = 4;
  const exactly = (t, k) => CELLS * choose(t, k) * P ** k * (1 - P) ** (t - k);
  const panel = side * d, gap = 50, x00 = 40, y0 = 100;
  const W = x00 * 2 + 3 * panel + 2 * gap, H = y0 + panel + 90;
  const s = svgStart(W, H, "Three mutations needed: who is ready at each age?",
    "10,000 cells, 1 in 1,000 chance of a mutation per cell per year. Orange = has 1 mutation. Red = has 2 mutations, so it is ready: one step from cancer.");
  s.push(`<defs><pattern id="g" width="${d}" height="${d}" patternUnits="userSpaceOnUse"><circle cx="${d / 2}" cy="${d / 2}" r="0.7" fill="#c9c8c2"/></pattern></defs>`);
  console.log("\nFigure 5: r = 3, 10000 cells, p = 1/1000");
  [20, 40, 80].forEach((age, i) => {
    const one = exactly(age, 1), two = exactly(age, 2);
    const nOne = Math.round(one), nTwo = Math.round(two);
    const x0 = x00 + i * (panel + gap);
    s.push(`<rect x="${x0}" y="${y0}" width="${panel}" height="${panel}" fill="url(#g)"/>`);
    // Orange cells fill from the top-left; red cells are drawn big so a handful can be seen.
    for (let k = 0; k < nOne; k++) {
      s.push(`<rect x="${x0 + (k % side) * d}" y="${y0 + Math.floor(k / side) * d}" width="${d - 0.6}" height="${d - 0.6}" fill="${ORANGE}"/>`);
    }
    for (let k = 0; k < nTwo; k++) {
      const cx = x0 + 12 + (k % 16) * 24, cy = y0 + panel - 14 - Math.floor(k / 16) * 24;
      s.push(`<circle cx="${cx}" cy="${cy}" r="8" fill="#c8312b" stroke="${BG}" stroke-width="2"/>`);
    }
    s.push(`<text x="${x0}" y="${y0 + panel + 24}" font-size="15" font-weight="600" fill="${INK}">age ${age}: ${nOne} orange, ${nTwo} red</text>`);
    s.push(`<text x="${x0}" y="${y0 + panel + 44}" font-size="12" fill="${MUTED}">cancers this year ≈ red × 1/1000 = ${(two / 1000).toFixed(4)}</text>`);
    s.push(`<text x="${x0}" y="${y0 + panel + 62}" font-size="11" fill="${MUTED}">(red drawn large; they are really ${nTwo} cells out of 10,000)</text>`);
    console.log(`  age ${age}: exactly 1 = ${one.toFixed(2)}, exactly 2 = ${two.toFixed(3)}, cancers this year = ${(two / 1000).toFixed(5)}`);
  });
  s.push("</svg>");
  fs.writeFileSync(path.join(OUT, "5-r3-who-is-ready.svg"), s.join("\n"));
}

// ---------------------------------------------------------------------------
// Figure 6: the counts from figure 5 plotted against age on log-log axes.
// Orange (1 mutation) rises x2 per doubling -> slope 1. Red (2) rises x4 -> slope 2.
// ---------------------------------------------------------------------------
{
  const P = 1 / 1000, CELLS = 10000;
  const exactly = (t, k) => CELLS * choose(t, k) * P ** k * (1 - P) ** (t - k);
  const W = 720, H = 500, left = 80, right = 170, top = 80, bottom = 60;
  const xMin = 10, xMax = 100, yMin = 0.1, yMax = 1000;
  const xp = (a) => left + (Math.log10(a) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) * (W - left - right);
  const yp = (v) => H - bottom - (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) * (H - top - bottom);
  const s = svgStart(W, H, "Counting cells → slope", "The counts from the 3-mutation picture, plotted on log-log axes (10,000 cells, 1 in 1,000 per year).");
  for (const a of [10, 20, 40, 80, 100]) {
    s.push(`<line x1="${xp(a)}" y1="${top}" x2="${xp(a)}" y2="${H - bottom}" stroke="${GRID}"/>`);
    s.push(`<text x="${xp(a)}" y="${H - bottom + 20}" font-size="12" fill="${MUTED}" text-anchor="middle">${a}</text>`);
  }
  for (const v of [0.1, 1, 10, 100, 1000]) {
    s.push(`<line x1="${left}" y1="${yp(v)}" x2="${W - right}" y2="${yp(v)}" stroke="${GRID}"/>`);
    s.push(`<text x="${left - 8}" y="${yp(v) + 4}" font-size="11" fill="${MUTED}" text-anchor="end">${v.toLocaleString("en-US")}</text>`);
  }
  s.push(`<text x="${(left + W - right) / 2}" y="${H - 18}" font-size="13" fill="${MUTED}" text-anchor="middle">Age (log scale: equal steps = doubling)</text>`);
  s.push(`<text transform="translate(22 ${(top + H - bottom) / 2}) rotate(-90)" font-size="13" fill="${MUTED}" text-anchor="middle">Number of cells (log scale)</text>`);
  for (const [k, color, name] of [[1, ORANGE, "orange (1 mutation)"], [2, "#c8312b", "red (2 mutations, ready)"]]) {
    const pts = [];
    for (let a = 10; a <= 100; a++) pts.push(`${xp(a).toFixed(1)},${yp(exactly(a, k)).toFixed(1)}`);
    s.push(`<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${pts.join(" ")}"/>`);
    for (const a of [20, 40, 80]) {
      const v = exactly(a, k);
      s.push(`<circle cx="${xp(a)}" cy="${yp(v)}" r="5" fill="${color}" stroke="${BG}" stroke-width="2"/>`);
      s.push(`<text x="${xp(a) + 8}" y="${yp(v) + 18}" font-size="12" fill="${color}">${v < 10 ? v.toFixed(1) : Math.round(v)}</text>`);
    }
    const slope = Math.log2(exactly(40, k) / exactly(20, k));
    s.push(`<text x="${xp(100) + 8}" y="${yp(exactly(100, k)) + 4}" font-size="12" fill="${color}">${name}</text>`);
    s.push(`<text x="${xp(100) + 8}" y="${yp(exactly(100, k)) + 20}" font-size="12" fill="${color}">×${2 ** Math.round(slope)} per doubling → slope ${slope.toFixed(2)}</text>`);
  }
  s.push("</svg>");
  fs.writeFileSync(path.join(OUT, "6-counts-to-slope.svg"), s.join("\n"));
}

// ---------------------------------------------------------------------------
// Table: ways at age 30 and 60, the ratio, and the slope it implies.
// ---------------------------------------------------------------------------
console.log("\nr  ways at 30   ways at 60   ratio   log2(ratio) = slope   simple guess r-1");
for (const r of [1, 2, 3, 4, 5, 7]) {
  const w30 = ways(30, r), w60 = ways(60, r), ratio = w60 / w30;
  console.log(`${r}  ${String(w30).padStart(10)}   ${String(w60).padStart(10)}   ${ratio.toFixed(2).padStart(5)}   ${Math.log2(ratio).toFixed(2).padStart(19)}   ${String(r - 1).padStart(16)}`);
}
console.log("\nr = 3 at bigger ages (ratio should creep toward 4):");
for (const [a, b] of [[10, 20], [30, 60], [100, 200], [1000, 2000]]) {
  console.log(`  ${a} -> ${b}: ${ways(a, 3)} -> ${ways(b, 3)}, ratio ${(ways(b, 3) / ways(a, 3)).toFixed(3)}`);
}
console.log(`\nwrote ${OUT}`);
