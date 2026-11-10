// report.js - print one run of the model as a table in the terminal.
// Run from the web/ folder:   node report.js [M N r p seed]
// Defaults: node report.js 20000 100 4 0.005 1   (spec.txt, DEFAULTS)
// The numbers come from runReport in model.js (tested); this file only prints.

const { runReport } = require("./model.js");

const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const PLAIN = "\x1b[0m";

/** Color for a z (spec item 9): plain below 2, yellow 2 to 3, red above 3; unreliable z's stay plain. */
function zColor(g) {
  if (g.note === "impossible: expected 0") return RED;
  if (g.z === null || g.note !== null) return PLAIN;
  const size = Math.abs(g.z);
  if (size > 3) return RED;
  if (size >= 2) return YELLOW;
  return PLAIN;
}

/** A small sideways bar for z, centered at 0: each # is 0.5, up to 4 on each side. */
function zBar(z) {
  if (z === null) return " ".repeat(8) + "|" + " ".repeat(8);
  const n = Math.min(8, Math.round(Math.abs(z) / 0.5));
  const left = z < 0 ? " ".repeat(8 - n) + "#".repeat(n) : " ".repeat(8);
  const right = z > 0 ? "#".repeat(n) + " ".repeat(8 - n) : " ".repeat(8);
  return left + "|" + right;
}

/** One fitted line as text, with fitLine's note when R squared was set to 1. */
function fitText(fit, problem) {
  if (fit === null) return `none (${problem})`;
  const note = fit.note ? `  [${fit.note}]` : "";
  return `${fit.slope.toFixed(3)}   R squared ${fit.rSquared.toFixed(4)}   (${fit.used} groups)${note}`;
}

/** The whole report as lines of text. */
function printReport(rep) {
  const { M, N, r, p, seed } = rep.settings;
  const lines = [];
  lines.push(`Run: M = ${M} people, N = ${N} cells, r = ${r} hits, p = ${p}, seed = ${seed}`);
  lines.push("");
  lines.push(`Log-log slope, groups 25-29 to 80-84 (middle ages 27.5 ... 82.5):`);
  lines.push(`  simulated: ${fitText(rep.simulatedFit, rep.simulatedFitProblem)}`);
  lines.push(`  exact:     ${fitText(rep.exactFit, rep.exactFitProblem)}`);
  lines.push("");
  lines.push("group    simulated   expected        z    z: -4 ... 0 ... +4   notes");
  for (const g of rep.groups) {
    const label = `${g.start}-${g.end}`.padEnd(7);
    const sim = String(g.simulatedCases).padStart(9);
    const exp = g.expectedCases.toFixed(1).padStart(10);
    const z = (g.z === null ? "-" : g.z.toFixed(2)).padStart(8);
    const notes = [g.note, g.leftOutReason ? `not in slope: ${g.leftOutReason}` : null].filter(Boolean).join("; ");
    lines.push(`${label}  ${sim}  ${exp}  ${zColor(g)}${z}${PLAIN}    ${zBar(g.z)}   ${notes}`);
  }
  lines.push("");
  const s = rep.zSummary;
  if (s.largest === null) {
    lines.push("Largest |z|: none (no group from 25 up with a reliable z)");
  } else {
    const sign = s.largest.z > 0 ? "too many cases" : "too few cases";
    lines.push(`Largest |z|: ${s.largest.z.toFixed(2)} in ${s.largest.start}-${s.largest.end} (${sign})`);
  }
  const k = s.groupsInSum;
  lines.push(`Sum of z^2: ${s.sumZ2.toFixed(1)} over ${k} groups (noise alone: about ${k}, give or take ${Math.sqrt(2 * k).toFixed(1)})`);
  lines.push("Pass line for the slope and z's: not set yet (spec HAND CHECK 6: measure over 20 seeds).");
  return lines.join("\n");
}

if (require.main === module) {
  const args = process.argv.slice(2).map(Number);
  const [M = 20000, N = 100, r = 4, p = 0.005, seed = 1] = args;
  console.log(printReport(runReport(M, N, r, p, seed)));
}

module.exports = { printReport };
