// learn-hc6.js - HAND CHECK 6 (spec): run 20 seeds and see how much the simulated
// slope and the z-scores vary when the simulation is correct. Sets the pass line.
// Run from web/:  node learn-hc6.js   (about 40 s). Writes ../output/learn/11-hand-check-6.svg.

const fs = require("fs");
const path = require("path");
const m = require("./model.js");

const SETTINGS = [[100, 4, 0.005, "defaults: r = 4, p = 0.005"], [100, 6, 0.01, "r = 6, p = 0.01"], [100, 2, 0.002, "r = 2, p = 0.002"]];
const SEEDS = 20;
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const sd = (a) => { const mu = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - mu) ** 2, 0) / (a.length - 1)); };

const results = SETTINGS.map(([N, r, p, label]) => {
  const runs = [];
  for (let seed = 1; seed <= SEEDS; seed++) {
    const rep = m.runReport(20000, N, r, p, seed);
    runs.push({ diff: rep.simulatedFit.slope - rep.exactFit.slope, maxZ: Math.abs(rep.zSummary.largest.z), sumZ2: rep.zSummary.sumZ2, k: rep.zSummary.groupsInSum });
  }
  const d = runs.map((x) => x.diff);
  const res = { label, runs, mean: mean(d), sd: sd(d), k: runs[0].k };
  console.log(`${label}: simulated - exact slope mean ${res.mean.toFixed(3)}, spread ${res.sd.toFixed(3)} (${(res.mean / (res.sd / Math.sqrt(SEEDS))).toFixed(1)} standard errors); ` +
    `largest |z| over 2 in ${runs.filter((x) => x.maxZ > 2).length}/20, over 3 in ${runs.filter((x) => x.maxZ > 3).length}/20; ` +
    `sum z^2 mean ${mean(runs.map((x) => x.sumZ2)).toFixed(1)} (noise ${res.k})`);
  return res;
});

// Picture: one row per setting, one dot per seed, x = simulated slope minus exact slope.
const W = 760, H = 330, left = 210, right = 30, top = 80, rowH = 70;
const xMin = -1.1, xMax = 0.7;
const xp = (v) => left + ((v - xMin) / (xMax - xMin)) * (W - left - right);
const INK = "#0b0b0b", MUTED = "#52514e", GRID = "#e6e5e0", BLUE = "#2a78d6", RED = "#c8312b";
const s = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`,
  `<rect width="${W}" height="${H}" fill="#fcfcfb"/>`,
  `<text x="24" y="30" font-size="18" font-weight="600" fill="${INK}">HAND CHECK 6: 20 seeds, simulated slope minus exact slope</text>`,
  `<text x="24" y="52" font-size="13" fill="${MUTED}">One dot per seed (20,000 people each). 0 = the simulation's slope equals the exact model's. Bar = average.</text>`];
for (let v = -1; v <= 0.6 + 1e-9; v += 0.2) {
  const x = xp(v);
  s.push(`<line x1="${x}" y1="${top - 6}" x2="${x}" y2="${top + SETTINGS.length * rowH}" stroke="${Math.abs(v) < 1e-9 ? "#9a9994" : GRID}" ${Math.abs(v) < 1e-9 ? 'stroke-width="1.5"' : ""}/>`);
  s.push(`<text x="${x}" y="${top + SETTINGS.length * rowH + 18}" font-size="11" fill="${MUTED}" text-anchor="middle">${v.toFixed(1)}</text>`);
}
s.push(`<text x="${(left + W - right) / 2}" y="${top + SETTINGS.length * rowH + 40}" font-size="12" fill="${MUTED}" text-anchor="middle">simulated slope − exact slope</text>`);
results.forEach((res, i) => {
  const y = top + i * rowH + rowH / 2;
  const biased = Math.abs(res.mean / (res.sd / Math.sqrt(SEEDS))) > 2;
  s.push(`<text x="${left - 12}" y="${y - 4}" font-size="13" fill="${INK}" text-anchor="end">${res.label}</text>`);
  s.push(`<text x="${left - 12}" y="${y + 13}" font-size="11" fill="${biased ? RED : MUTED}" text-anchor="end">average ${res.mean >= 0 ? "+" : "−"}${Math.abs(res.mean).toFixed(2)}, spread ${res.sd.toFixed(2)}</text>`);
  res.runs.forEach((run, j) => s.push(`<circle cx="${xp(run.diff).toFixed(1)}" cy="${(y + ((j % 5) - 2) * 5).toFixed(1)}" r="4" fill="${BLUE}" opacity="0.75"/>`));
  s.push(`<line x1="${xp(res.mean)}" y1="${y - 16}" x2="${xp(res.mean)}" y2="${y + 16}" stroke="${biased ? RED : INK}" stroke-width="3"/>`);
});
s.push("</svg>");
fs.writeFileSync(path.join(__dirname, "..", "output", "learn", "11-hand-check-6.svg"), s.join("\n"));
console.log("wrote output/learn/11-hand-check-6.svg");
