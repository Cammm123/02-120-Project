// plot-rates.js - run the default v1 simulation and draw cancer rate vs age
// on log-log axes. Run from web/:  node plot-rates.js
// Writes ../output/v1-rates.svg and prints the numbers behind every point.
// Drawing only: all model numbers come from model.js.

const fs = require("fs");
const path = require("path");
const { simulatePopulation, ageGroupRates } = require("./model.js");

// Default run from spec.txt.
const M = 20000, N = 100, r = 4, p = 0.005, seed = 1;

const groups = ageGroupRates(simulatePopulation(M, N, r, p, seed));
const points = groups
  .filter((g) => g.cases > 0) // log(0) does not exist, so 0-case groups are skipped
  .map((g) => ({ ...g, mid: (g.start + g.end + 1) / 2 })); // 0-4 -> 2.5, 60-64 -> 62.5

console.log("group    cases  person-years   rate per 100,000 person-years");
for (const g of groups) {
  const rate = g.rate === null ? "-" : (g.rate * 1e5).toFixed(1);
  console.log(`${String(g.start).padStart(2)}-${String(g.end).padEnd(2)}  ${String(g.cases).padStart(6)}  ${String(g.personYears).padStart(12)}   ${rate}`);
}

// --- Drawing (SVG, log-log axes) -------------------------------------------
const W = 720, H = 480;
const left = 80, right = 24, top = 72, bottom = 64;
const xMin = 5, xMax = 100; // age axis
const yMin = 1e-6, yMax = 1e-2; // rate axis (per person-year)

/** Age -> x pixel (log scale). */
function xPix(age) {
  return left + ((Math.log10(age) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * (W - left - right);
}
/** Rate -> y pixel (log scale, larger rates higher up). */
function yPix(rate) {
  return H - bottom - ((Math.log10(rate) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin))) * (H - top - bottom);
}

// Guide line with slope r - 1 = 3, passing through the 60-64 point.
// On log-log axes, rate = k x age^3 is a straight line of slope 3.
const anchor = points.find((g) => g.start === 60);
const k = anchor.rate / Math.pow(anchor.mid, r - 1);
const guide = (age) => k * Math.pow(age, r - 1);
const gx0 = 10, gx1 = 90;

const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`);
svg.push(`<rect width="${W}" height="${H}" fill="#fcfcfb"/>`);
svg.push(`<text x="${left}" y="30" font-size="18" font-weight="600" fill="#0b0b0b">Simulated cancer rate by age (v1, no carcinogen)</text>`);
svg.push(`<text x="${left}" y="52" font-size="13" fill="#52514e">${M.toLocaleString("en-US")} people, ${N} cells each, r = ${r} hits, p = ${p} per cell per year, seed ${seed}. Both axes log scale.</text>`);

// Grid and ticks.
for (const age of [5, 10, 20, 30, 50, 70, 100]) {
  svg.push(`<line x1="${xPix(age)}" y1="${top}" x2="${xPix(age)}" y2="${H - bottom}" stroke="#e6e5e0" stroke-width="1"/>`);
  svg.push(`<text x="${xPix(age)}" y="${H - bottom + 20}" font-size="12" fill="#52514e" text-anchor="middle">${age}</text>`);
}
const rateLabels = { 1e-6: "0.1", 1e-5: "1", 1e-4: "10", 1e-3: "100", 1e-2: "1,000" };
for (const rate of [1e-6, 1e-5, 1e-4, 1e-3, 1e-2]) {
  svg.push(`<line x1="${left}" y1="${yPix(rate)}" x2="${W - right}" y2="${yPix(rate)}" stroke="#e6e5e0" stroke-width="1"/>`);
  svg.push(`<text x="${left - 8}" y="${yPix(rate) + 4}" font-size="12" fill="#52514e" text-anchor="end">${rateLabels[rate]}</text>`);
}
svg.push(`<text x="${(left + W - right) / 2}" y="${H - 18}" font-size="13" fill="#52514e" text-anchor="middle">Age (middle of each five-year group)</text>`);
svg.push(`<text transform="translate(22 ${(top + H - bottom) / 2}) rotate(-90)" font-size="13" fill="#52514e" text-anchor="middle">New cancers per 100,000 person-years</text>`);

// Guide line (reference, not data): gray dashed, labeled directly.
svg.push(`<line x1="${xPix(gx0)}" y1="${yPix(guide(gx0))}" x2="${xPix(gx1)}" y2="${yPix(guide(gx1))}" stroke="#8a8984" stroke-width="1.5" stroke-dasharray="6 4"/>`);
svg.push(`<text x="${xPix(gx1)}" y="${yPix(guide(gx1)) - 12}" font-size="12" fill="#52514e" text-anchor="end">dashed: slope 3 = r − 1 (Armitage &amp; Doll), through the 60–64 point</text>`);

// Data: line plus dots, one series (blue).
svg.push(`<polyline fill="none" stroke="#2a78d6" stroke-width="2" points="${points.map((g) => `${xPix(g.mid).toFixed(1)},${yPix(g.rate).toFixed(1)}`).join(" ")}"/>`);
for (const g of points) {
  svg.push(`<circle cx="${xPix(g.mid).toFixed(1)}" cy="${yPix(g.rate).toFixed(1)}" r="4.5" fill="#2a78d6" stroke="#fcfcfb" stroke-width="2">` +
    `<title>Ages ${g.start}–${g.end}: ${g.cases} cases in ${g.personYears.toLocaleString("en-US")} person-years = ${(g.rate * 1e5).toFixed(1)} per 100,000</title></circle>`);
}
const skipped = groups.filter((g) => g.cases === 0).map((g) => `${g.start}–${g.end}`);
if (skipped.length) {
  svg.push(`<text x="${W - right}" y="${H - bottom - 10}" font-size="11" fill="#52514e" text-anchor="end">No cases (not drawn): ${skipped.join(", ")}</text>`);
}
svg.push(`</svg>`);

const outDir = path.join(__dirname, "..", "output");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-rates.svg"), svg.join("\n"));
console.log("\nwrote output/v1-rates.svg");
