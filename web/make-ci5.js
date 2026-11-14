// make-ci5.js - pull the three cancers the page shows out of the big CI5 files.
// Run from web/:  node make-ci5.js      (writes web/ci5.js; run again only if the choice changes)
// Source: data/cases.csv and data/pop.csv (CI5-XII, see data/README.md).
// The full CSV is too big for a web page, so the page loads this small file instead.

const fs = require("fs");
const path = require("path");
const { realRates, logLogFit, SLOPE_FROM } = require("./model.js");

const REGISTRY = "582600199"; // UK, England, 2013-2017 (data/Registry.txt)
const SEX = "1"; // men
const CANCERS = [
  { code: "21", name: "Lung" },
  { code: "11", name: "Stomach" },
  { code: "13", name: "Colon" },
];
const GROUPS = 17; // 0-4 ... 80-84, the same groups as the model (85+ is left out)

/** Read a CSV into its header and rows (no quoted commas in these files). */
function readCsv(file) {
  const lines = fs.readFileSync(path.join(__dirname, "..", "data", file), "utf8").trim().split("\n");
  return { header: lines[0].split(","), rows: lines.slice(1).map((l) => l.split(",")) };
}

/** The 17 numbers from columns <prefix>0_4 ... <prefix>80_84 of one row. */
function ageColumns(header, row, prefix) {
  const out = [];
  for (let g = 0; g < GROUPS; g++) {
    const col = header.indexOf(`${prefix}${5 * g}_${5 * g + 4}`);
    if (col < 0) throw new Error(`no column ${prefix}${5 * g}_${5 * g + 4}`);
    out.push(Number(row[col]));
  }
  return out;
}

const cases = readCsv("cases.csv");
const pop = readCsv("pop.csv");
const popRow = pop.rows.find((r) => r[0] === REGISTRY && r[1] === SEX);
if (!popRow) throw new Error("no population row for England, men");
const personYears = ageColumns(pop.header, popRow, "P");

const out = { source: "CI5-XII (Bray et al., IARC 2023), England 2013-2017, men", registry: REGISTRY, cancers: [] };
for (const c of CANCERS) {
  const row = cases.rows.find((r) => r[0] === REGISTRY && r[1] === SEX && r[2] === c.code);
  if (!row) throw new Error(`no row for ${c.name}`);
  const n = ageColumns(cases.header, row, "N");
  out.cancers.push({ name: c.name, code: c.code, cases: n });
  // Print what the page should show, to check by hand against spec.txt.
  const g = realRates(n, personYears).filter((x) => x.start >= SLOPE_FROM);
  const fit = logLogFit(g.map((x) => x.start + 2.5), g.map((x) => x.rate));
  console.log(`${c.name.padEnd(8)} 60-64: ${n[12]} cases / ${personYears[12]} person-years = ${(1e5 * n[12] / personYears[12]).toFixed(1)} per 100,000; slope 25-84 ${fit.slope.toFixed(2)}`);
}
out.personYears = personYears;

const js = `// ci5.js - made by make-ci5.js from data/ (CI5-XII). Do not edit by hand.
// Real new cases and person-years, England 2013-2017, men, age groups 0-4 ... 80-84.
const CI5 = ${JSON.stringify(out, null, 1)};
if (typeof module !== "undefined") module.exports = { CI5 };
`;
fs.writeFileSync(path.join(__dirname, "ci5.js"), js);
console.log(`wrote web/ci5.js (${js.length} characters)`);
