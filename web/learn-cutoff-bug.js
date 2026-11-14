// learn-cutoff-bug.js - pictures for the 1e-12 cutoff bug (found and fixed 2026-11-14).
// Run from web/:  node learn-cutoff-bug.js     Writes ../output/learn/10-cutoff-bug.svg.
// It keeps a copy of the OLD expectedRates (with the cutoff) only to draw what went wrong.

const fs = require("fs");
const path = require("path");
const { cellDoneChance, expectedRates, logLogFit, YEARS } = require("./model.js");

/** The old version (2026-11-07 to 2026-11-14): S below 1e-12 was set to 0 and F to 1. */
function oldExpectedRates(N, r, p) {
  const S = [], F = [];
  for (let t = 0; t <= YEARS; t++) {
    const q = Math.min(1, cellDoneChance(t, r, p));
    let s = Math.exp(N * Math.log1p(-q)), f = -Math.expm1(N * Math.log1p(-q));
    if (s < 1e-12) { s = 0; f = 1; }
    S.push(s); F.push(f);
  }
  const groups = [];
  for (let start = 0; start < YEARS; start += 5) {
    let py = 0;
    for (let t = start; t < start + 5; t++) py += S[t];
    groups.push({ start, rate: py > 0 ? (F[start + 5] - F[start]) / py : null });
  }
  return groups;
}

const N = 100, r = 1, p = 0.005, h = 1 - (1 - p) ** N;
const oldG = oldExpectedRates(N, r, p), newG = expectedRates(N, r, p);
const slope = (gs) => { const u = gs.filter((g) => g.start >= 25 && g.rate > 0); return logLogFit(u.map((g) => g.start + 2.5), u.map((g) => g.rate)).slope; };
console.log(`r = 1, N = 100, p = 0.005: true yearly chance h = 1 - 0.995^100 = ${h.toFixed(6)}`);
console.log("group   old rate   new rate");
for (let i = 0; i < 17; i++) console.log(`${String(5 * i).padStart(2)}-${String(5 * i + 4).padEnd(2)}   ${oldG[i].rate === null ? "null    " : oldG[i].rate.toFixed(4).padEnd(8)}   ${newG[i].rate.toFixed(4)}`);
console.log(`slope 25-84: old ${slope(oldG).toFixed(3)}, new ${slope(newG).toFixed(3)}`);
console.log("S at 55..60:", [55, 56, 57, 58, 59, 60].map((t) => ((1 - p) ** (N * t)).toExponential(2)).join(" "));

// Picture: plain axes, rate vs age. Gray line = the truth (h), red = old code, blue = new code.
const W = 720, H = 440, left = 70, right = 170, top = 80, bottom = 56;
const xp = (a) => left + (a / 85) * (W - left - right);
const yp = (v) => H - bottom - (v / 1.1) * (H - top - bottom);
const INK = "#0b0b0b", MUTED = "#52514e", GRID = "#e6e5e0", BLUE = "#2a78d6", RED = "#c8312b";
const s = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`,
  `<rect width="${W}" height="${H}" fill="#fcfcfb"/>`,
  `<text x="24" y="30" font-size="18" font-weight="600" fill="${INK}">The 1e-12 cutoff bug: one hit should give a flat rate</text>`,
  `<text x="24" y="52" font-size="13" fill="${MUTED}">r = 1, N = 100, p = 0.005. Every year 39.4% of the people still cancer-free get cancer, at every age.</text>`];
for (let a = 0; a <= 80; a += 10) {
  s.push(`<line x1="${xp(a)}" y1="${top}" x2="${xp(a)}" y2="${H - bottom}" stroke="${GRID}"/>`);
  s.push(`<text x="${xp(a)}" y="${H - bottom + 18}" font-size="12" fill="${MUTED}" text-anchor="middle">${a}</text>`);
}
for (const v of [0, 0.2, 0.4, 0.6, 0.8, 1.0]) {
  s.push(`<line x1="${left}" y1="${yp(v)}" x2="${W - right}" y2="${yp(v)}" stroke="${GRID}"/>`);
  s.push(`<text x="${left - 8}" y="${yp(v) + 4}" font-size="12" fill="${MUTED}" text-anchor="end">${v.toFixed(1)}</text>`);
}
s.push(`<text x="${(left + W - right) / 2}" y="${H - 14}" font-size="13" fill="${MUTED}" text-anchor="middle">Age (middle of each five-year group)</text>`);
s.push(`<text transform="translate(20 ${(top + H - bottom) / 2}) rotate(-90)" font-size="13" fill="${MUTED}" text-anchor="middle">Rate (cancers per person-year)</text>`);
s.push(`<rect x="${xp(55)}" y="${top}" width="${xp(85) - xp(55)}" height="${H - top - bottom}" fill="${RED}" opacity="0.06"/>`);
s.push(`<text x="${xp(57)}" y="${top + 16}" font-size="11" fill="${RED}">S below 1e-12 from age 56</text>`);
s.push(`<line x1="${xp(0)}" y1="${yp(h)}" x2="${xp(85)}" y2="${yp(h)}" stroke="#b5b4ae" stroke-width="6" opacity="0.6"/>`);
s.push(`<polyline fill="none" stroke="${BLUE}" stroke-width="2" points="${newG.map((g) => `${xp(g.start + 2.5)},${yp(g.rate)}`).join(" ")}"/>`);
for (const g of oldG.filter((g) => g.rate !== null)) s.push(`<circle cx="${xp(g.start + 2.5)}" cy="${yp(g.rate)}" r="5" fill="${RED}" stroke="#fff" stroke-width="1.5"/>`);
const spike = oldG[11];
s.push(`<text x="${xp(spike.start + 2.5) + 10}" y="${yp(spike.rate) + 4}" font-size="12" fill="${RED}">old 55–59: ${spike.rate.toFixed(2)}</text>`);
for (const g of oldG.filter((g) => g.rate === null)) s.push(`<text x="${xp(g.start + 2.5)}" y="${yp(0.06)}" font-size="11" fill="${RED}" text-anchor="middle">null</text>`);
const lx = W - right + 12;
s.push(`<text x="${lx}" y="${yp(h) - 30}" font-size="12" fill="${MUTED}">gray: truth, 0.394</text>`);
s.push(`<text x="${lx}" y="${yp(h) - 12}" font-size="12" fill="${BLUE}">blue: new (logs)</text>`);
s.push(`<text x="${lx}" y="${yp(h) + 6}" font-size="12" fill="${RED}">red: old (cutoff)</text>`);
s.push(`<text x="${lx}" y="${yp(h) + 40}" font-size="12" fill="${INK}">slope 25–84:</text>`);
s.push(`<text x="${lx}" y="${yp(h) + 58}" font-size="12" fill="${RED}">old ${slope(oldG).toFixed(2)}</text>`);
s.push(`<text x="${lx}" y="${yp(h) + 76}" font-size="12" fill="${BLUE}">new ${slope(newG).toFixed(2)} (flat)</text>`);
s.push("</svg>");
const out = path.join(__dirname, "..", "output", "learn", "10-cutoff-bug.svg");
fs.writeFileSync(out, s.join("\n"));
console.log("wrote output/learn/10-cutoff-bug.svg");
