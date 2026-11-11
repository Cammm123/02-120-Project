// plot-fit.js - one run of v1 on log-log axes, with the fitted line and the exact curve.
// Run from web/:  node plot-fit.js [M N r p seed]   (defaults 20000 100 4 0.005 1)
// Writes ../output/v1-fit.svg and prints the numbers behind every mark.
// Drawing only: every number comes from runReport in model.js (tested).

const fs = require("fs");
const path = require("path");
const { runReport } = require("./model.js");

const args = process.argv.slice(2).map(Number);
const [M = 20000, N = 100, r = 4, p = 0.005, seed = 1] = args;
const rep = runReport(M, N, r, p, seed);
const mid = (g) => g.start + 2.5; // group 25-29 covers ages 25.0 to 30.0, same as runReport

/** The fitted straight line on log-log axes: log(rate) = intercept + slope * log(age). */
function fitRate(fit, age) {
  return Math.exp(fit.intercept + fit.slope * Math.log(age));
}

// --- Numbers behind the picture -------------------------------------------
console.log("group   middle   simulated rate   exact rate     (per 100,000 person-years)");
for (const g of rep.groups) {
  const sim = g.simulatedRate === null ? "-" : (g.simulatedRate * 1e5).toFixed(2);
  const ex = g.expectedRate === null ? "-" : (g.expectedRate * 1e5).toFixed(4);
  console.log(`${`${g.start}-${g.end}`.padEnd(7)} ${String(mid(g)).padStart(6)}   ${sim.padStart(14)}   ${ex.padStart(10)}${g.inSlope ? "   in slope" : ""}`);
}
const sf = rep.simulatedFit, ef = rep.exactFit;
console.log(`\nsimulated fit: slope ${sf.slope.toFixed(3)}, intercept ${sf.intercept.toFixed(3)} (natural log)`);
console.log(`exact fit:     slope ${ef.slope.toFixed(3)}, intercept ${ef.intercept.toFixed(3)}`);
console.log(`fitted line at 62.5: exp(${sf.intercept.toFixed(3)} + ${sf.slope.toFixed(3)} x ln 62.5) = ${(fitRate(sf, 62.5) * 1e5).toFixed(1)} per 100,000`);

// --- Drawing (SVG, log-log axes) ------------------------------------------
const W = 760, H = 520;
const left = 80, right = 24, top = 92, bottom = 64;
const xMin = 2, xMax = 100;
const yMin = 1e-8, yMax = 1e-2;
const BLUE = "#2a78d6", INK = "#0b0b0b", MUTED = "#52514e", GRID = "#e6e5e0", BG = "#fcfcfb";

/** Age -> x pixel (log scale). */
function xPix(age) {
  return left + ((Math.log10(age) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin))) * (W - left - right);
}
/** Rate -> y pixel (log scale, larger rates higher up). */
function yPix(rate) {
  return H - bottom - ((Math.log10(rate) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin))) * (H - top - bottom);
}

const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`);
svg.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`);
svg.push(`<text x="${left}" y="30" font-size="18" font-weight="600" fill="${INK}">Simulated vs exact cancer rate by age (v1, no carcinogen)</text>`);
svg.push(`<text x="${left}" y="52" font-size="13" fill="${MUTED}">${M.toLocaleString("en-US")} people, ${N} cells each, r = ${r} hits, p = ${p} per cell per year, seed ${seed}. Both axes log scale.</text>`);
svg.push(`<text x="${left}" y="72" font-size="13" fill="${MUTED}">Slope from groups 25–29 to 80–84: simulated ${sf.slope.toFixed(2)} (R² ${sf.rSquared.toFixed(3)}), exact ${ef.slope.toFixed(2)}. Simple Armitage–Doll guess: r − 1 = ${r - 1}.</text>`);

// Grid and ticks.
for (const age of [2, 5, 10, 20, 30, 50, 70, 100]) {
  svg.push(`<line x1="${xPix(age)}" y1="${top}" x2="${xPix(age)}" y2="${H - bottom}" stroke="${GRID}"/>`);
  svg.push(`<text x="${xPix(age)}" y="${H - bottom + 20}" font-size="12" fill="${MUTED}" text-anchor="middle">${age}</text>`);
}
const rateLabels = { 1e-8: "0.001", 1e-7: "0.01", 1e-6: "0.1", 1e-5: "1", 1e-4: "10", 1e-3: "100", 1e-2: "1,000" };
for (const rate of Object.keys(rateLabels).map(Number)) {
  svg.push(`<line x1="${left}" y1="${yPix(rate)}" x2="${W - right}" y2="${yPix(rate)}" stroke="${GRID}"/>`);
  svg.push(`<text x="${left - 8}" y="${yPix(rate) + 4}" font-size="12" fill="${MUTED}" text-anchor="end">${rateLabels[rate]}</text>`);
}
svg.push(`<text x="${(left + W - right) / 2}" y="${H - 18}" font-size="13" fill="${MUTED}" text-anchor="middle">Age (middle of each five-year group)</text>`);
svg.push(`<text transform="translate(22 ${(top + H - bottom) / 2}) rotate(-90)" font-size="13" fill="${MUTED}" text-anchor="middle">New cancers per 100,000 person-years</text>`);

// Shade the ages used for the slope (25 to 85).
svg.push(`<rect x="${xPix(25)}" y="${top}" width="${xPix(85) - xPix(25)}" height="${H - top - bottom}" fill="${INK}" opacity="0.035"/>`);
svg.push(`<text x="${xPix(25) + 6}" y="${top + 16}" font-size="11" fill="${MUTED}">ages used for the slope</text>`);

// Exact curve (from expectedRates): solid dark line through every group with a rate above 0.
const exact = rep.groups.filter((g) => g.expectedRate > 0);
svg.push(`<polyline fill="none" stroke="${INK}" stroke-width="2" points="${exact.map((g) => `${xPix(mid(g)).toFixed(1)},${yPix(g.expectedRate).toFixed(1)}`).join(" ")}"/>`);

// Fitted line (logLogFit on the simulated groups), drawn only over the ages it was fitted on.
const a0 = 27.5, a1 = 82.5;
svg.push(`<line x1="${xPix(a0)}" y1="${yPix(fitRate(sf, a0))}" x2="${xPix(a1)}" y2="${yPix(fitRate(sf, a1))}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="7 4"/>`);

// Simulated points (0-case groups can't go on a log axis).
for (const g of rep.groups.filter((g) => g.simulatedRate > 0)) {
  svg.push(`<circle cx="${xPix(mid(g)).toFixed(1)}" cy="${yPix(g.simulatedRate).toFixed(1)}" r="4.5" fill="${BLUE}" stroke="${BG}" stroke-width="2">` +
    `<title>Ages ${g.start}–${g.end}: simulated ${(g.simulatedRate * 1e5).toFixed(1)}, exact ${(g.expectedRate * 1e5).toFixed(1)} per 100,000 (z ${g.z === null ? "-" : g.z.toFixed(2)})</title></circle>`);
}

// Legend (top left of the plot, where the curves are not).
const lx = left + 14, ly = top + 40;
svg.push(`<circle cx="${lx + 12}" cy="${ly}" r="4.5" fill="${BLUE}"/><text x="${lx + 30}" y="${ly + 4}" font-size="12" fill="${INK}">simulated rate (one dot per age group)</text>`);
svg.push(`<line x1="${lx}" y1="${ly + 22}" x2="${lx + 24}" y2="${ly + 22}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="7 4"/><text x="${lx + 30}" y="${ly + 26}" font-size="12" fill="${INK}">fitted line through the dots, slope ${sf.slope.toFixed(2)}</text>`);
svg.push(`<line x1="${lx}" y1="${ly + 44}" x2="${lx + 24}" y2="${ly + 44}" stroke="${INK}" stroke-width="2"/><text x="${lx + 30}" y="${ly + 48}" font-size="12" fill="${INK}">exact rate from the formula (no randomness), slope ${ef.slope.toFixed(2)}</text>`);

const noCases = rep.groups.filter((g) => !(g.simulatedRate > 0)).map((g) => `${g.start}–${g.end}`);
if (noCases.length) {
  svg.push(`<text x="${W - right}" y="${H - bottom - 10}" font-size="11" fill="${MUTED}" text-anchor="end">No simulated cases (no dot): ${noCases.join(", ")}</text>`);
}
svg.push(`</svg>`);

const outDir = path.join(__dirname, "..", "output");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-fit.svg"), svg.join("\n"));
console.log("\nwrote output/v1-fit.svg");
