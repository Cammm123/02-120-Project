// app.js - the page: sliders, the real-data menu, the two graphs and the About Data tab.
// Drawing and buttons only. Every number comes from model.js (tested) or ci5.js.
// pageNumbers() and matchSummary() have no drawing in them, so they can run in node for checks.

const MEET_AGE = 62.5; // real data is shifted to meet the model's exact line here (spec)
const M_PEOPLE = 20000;

/**
 * Everything the page shows, for one setting. `sim` is a runReport result or null.
 * Returns the exact curve, the real curve (raw and shifted), the fits and the lifetime risk.
 */
function pageNumbers(r, p, N, cancerIndex, sim) {
  const exactGroups = expectedRates(N, r, p);
  const mids = (gs) => gs.map((g) => g.start + 2.5);
  const fromSlopeAge = (gs) => gs.filter((g) => g.start >= SLOPE_FROM && g.rate > 0);
  const exactUsed = fromSlopeAge(exactGroups);
  const exactFit = exactUsed.length >= 2 ? logLogFit(mids(exactUsed), exactUsed.map((g) => g.rate)) : null;
  const lifetimeRisk = exactGroups.reduce((sum, g) => sum + g.casesPerPerson, 0);

  const cancer = CI5.cancers[cancerIndex];
  const realGroups = realRates(cancer.cases, CI5.personYears);
  const realUsed = fromSlopeAge(realGroups);
  const realFit = logLogFit(mids(realUsed), realUsed.map((g) => g.rate));
  const k = exactFit ? shiftToMeet(realFit, exactFit, MEET_AGE) : 1;

  return {
    exact: exactGroups.map((g) => ({ age: g.start + 2.5, rate: g.rate })),
    exactFit,
    lifetimeRisk,
    cancerName: cancer.name,
    realGroups,
    real: realGroups.map((g) => ({ age: g.start + 2.5, rate: g.rate, shifted: g.rate === null ? null : g.rate * k })),
    realFit,
    k,
    sim: sim ? sim.groups.map((g) => ({ age: g.start + 2.5, start: g.start, rate: g.simulatedRate, cases: g.simulatedCases, expected: g.expectedCases, z: g.z })) : null,
    simFit: sim ? sim.simulatedFit : null,
    match: sim ? matchSummary(sim) : null,
  };
}

/** Color band for one z (spec item 9, decided): below 2 plain, 2 to 3 yellow, above 3 red. */
function zLevel(z) {
  const size = Math.abs(z);
  return size > 3 ? "red" : size >= 2 ? "yellow" : "plain";
}

/**
 * How well one simulation matches the exact model, from runReport's tested
 * z-scores. The verdict is matchVerdict (pass line, spec HAND CHECK 6).
 */
function matchSummary(sim) {
  const z = sim.zSummary;
  const k = z.groupsInSum;
  const fromSlopeAge = sim.groups.filter((g) => g.start >= SLOPE_FROM);
  return {
    largest: z.largest, // {z, start, end} or null
    level: z.largest ? zLevel(z.largest.z) : "plain",
    sumZ2: z.sumZ2,
    groups: k,
    noiseLow: k - Math.sqrt(2 * k),
    noiseHigh: k + Math.sqrt(2 * k),
    verdict: matchVerdict(z), // {passLine, matches} or null
    rows: fromSlopeAge.map((g) => ({ start: g.start, end: g.end, simulated: g.simulatedCases, expected: g.expectedCases, z: g.z, note: g.note })),
    fewCases: fromSlopeAge.filter((g) => g.note === "few cases").length,
    impossible: sim.groups.filter((g) => g.note === "impossible: expected 0").map((g) => `${g.start}-${g.end}`),
  };
}

// --- Drawing (SVG strings) --------------------------------------------------
const COLORS = { ink: "#0b0b0b", muted: "#52514e", grid: "#e6e5e0", blue: "#2a78d6", orange: "#d9822b", yellow: "#d4a017", red: "#c8312b" };

/** Nice tick values: powers of 10 between lo and hi (log axes). */
function decades(lo, hi) {
  const out = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) out.push(10 ** e);
  return out;
}

/** A round step size (1, 2 or 5 times a power of 10) at least as big as `raw`. */
function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}

/** Rate per person-year as "per 100,000" text. */
function per100k(rate) {
  const v = rate * 1e5;
  if (v === 0) return "0";
  if (v >= 100) return Math.round(v).toLocaleString("en-US");
  if (v >= 1) return v.toFixed(1);
  return v.toPrecision(2);
}

/** Text safe to put inside an HTML attribute. */
function attr(text) {
  return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/** One graph. kind = "log" (log-log) or "plain". Rates are drawn per 100,000 person-years. */
function drawGraph(nums, kind) {
  const W = 560, H = 400, left = 70, right = 16, top = 40, bottom = 50;
  const log = kind === "log";
  const series = [
    ...nums.exact.map((d) => d.rate),
    ...nums.real.map((d) => d.shifted),
    ...(nums.sim ? nums.sim.map((d) => d.rate) : []),
  ].filter((v) => v !== null && v > 0).map((v) => v * 1e5);
  const maxV = Math.max(...series);
  const minV = Math.min(...series.filter((v) => v >= maxV * 1e-6)); // don't let a near-0 value squash the plot
  const xMin = log ? 2 : 0, xMax = log ? 100 : 85;
  const yMin = log ? 10 ** Math.floor(Math.log10(minV)) : 0;
  const step = niceStep(maxV * 1.05 / 4); // plain axis: about 4 round-number steps
  const yMax = log ? 10 ** Math.ceil(Math.log10(maxV)) : step * Math.ceil((maxV * 1.05) / step);
  const xp = (a) => left + (log ? (Math.log10(a) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) : (a - xMin) / (xMax - xMin)) * (W - left - right);
  const yp = (v) => H - bottom - (log ? (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) : (v - yMin) / (yMax - yMin)) * (H - top - bottom);
  const ok = (v) => v !== null && v > 0 && (!log || v * 1e5 >= yMin);
  const s = [];
  s.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">`);
  s.push(`<text x="${left}" y="24" font-size="15" font-weight="600" fill="${COLORS.ink}">${log ? "Log-log: the slope counts the hits" : "Plain axes: how fast the rate rises"}</text>`);
  // Ages used for the slope (25 to 85).
  s.push(`<rect x="${xp(25)}" y="${top}" width="${xp(85) - xp(25)}" height="${H - top - bottom}" fill="${COLORS.ink}" opacity="0.035"/>`);
  // Grid.
  for (const a of log ? [2, 5, 10, 20, 30, 50, 70, 100] : [0, 10, 20, 30, 40, 50, 60, 70, 80]) {
    s.push(`<line x1="${xp(a)}" y1="${top}" x2="${xp(a)}" y2="${H - bottom}" stroke="${COLORS.grid}"/>`);
    s.push(`<text x="${xp(a)}" y="${H - bottom + 18}" font-size="11" fill="${COLORS.muted}" text-anchor="middle">${a}</text>`);
  }
  const yTicks = log ? decades(yMin, yMax) : Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  for (const v of yTicks) {
    s.push(`<line x1="${left}" y1="${yp(v)}" x2="${W - right}" y2="${yp(v)}" stroke="${COLORS.grid}"/>`);
    s.push(`<text x="${left - 6}" y="${yp(v) + 4}" font-size="11" fill="${COLORS.muted}" text-anchor="end">${v === 0 ? 0 : v >= 1 ? Math.round(v).toLocaleString("en-US") : log ? v.toPrecision(1) : +v.toPrecision(3)}</text>`);
  }
  s.push(`<text x="${(left + W - right) / 2}" y="${H - 12}" font-size="12" fill="${COLORS.muted}" text-anchor="middle">Age${log ? " (log scale)" : ""}</text>`);
  s.push(`<text transform="translate(16 ${(top + H - bottom) / 2}) rotate(-90)" font-size="12" fill="${COLORS.muted}" text-anchor="middle">New cancers per 100,000 person-years${log ? " (log)" : ""}</text>`);

  const line = (pts, color, extra) => {
    const xy = pts.filter((d) => ok(d.v)).map((d) => `${xp(d.a).toFixed(1)},${yp(d.v * 1e5).toFixed(1)}`);
    if (xy.length > 1) s.push(`<polyline fill="none" stroke="${color}" ${extra || 'stroke-width="2"'} points="${xy.join(" ")}"/>`);
  };
  // Dots carry their hover text in data-tip; the page shows it in a tooltip box.
  const dots = (pts, color, tip) => {
    for (const d of pts.filter((d) => ok(d.v))) {
      s.push(`<circle class="pt" cx="${xp(d.a).toFixed(1)}" cy="${yp(d.v * 1e5).toFixed(1)}" r="5" fill="${color}" stroke="#fff" stroke-width="1.5" data-tip="${attr(tip(d))}"/>`);
    }
  };
  // Real data (shifted), orange.
  const real = nums.real.map((d) => ({ a: d.age, v: d.shifted, raw: d.rate }));
  line(real, COLORS.orange, 'stroke-width="2" stroke-opacity="0.5"');
  dots(real, COLORS.orange, (d) => [`Real ${nums.cancerName.toLowerCase()} cancer, ages ${d.a - 2.5}–${d.a + 1.5}`,
    `Rate: ${per100k(d.raw)} per 100,000`, `Drawn ×${nums.k.toPrecision(3)} to meet the model (see About Data)`].join("|"));
  // Exact curve, black.
  line(nums.exact.map((d) => ({ a: d.age, v: d.rate })), COLORS.ink);
  if (nums.sim) {
    // Simulated dots, blue.
    // Tooltip text: a title, then bullet lines, separated by "|" (the page turns them into a list).
    dots(nums.sim.map((d) => ({ ...d, a: d.age, v: d.rate })), COLORS.blue,
      (d) => [`Simulated, ages ${d.start}–${d.start + 4} (all 20,000 people)`,
        `Cancers: ${d.cases}`,
        `Person-years: ${Math.round(d.cases / d.v).toLocaleString("en-US")}`,
        `Rate: ${per100k(d.v)} per 100,000`,
        `Exact model expects: ${d.expected.toFixed(1)} cancers`,
        d.z === null ? "Gap (z): not computed" : `Gap (z): ${d.z.toFixed(2)}`].join("|"));
    // Fitted line on top of everything, with a white edge so it shows over the black line.
    if (nums.simFit) {
      const f = (a) => Math.exp(nums.simFit.intercept + nums.simFit.slope * Math.log(a));
      const pts = [];
      for (let a = 27.5; a <= 82.5; a += 1) pts.push({ a, v: f(a) });
      line(pts, "#fff", 'stroke-width="6" stroke-opacity="0.9"');
      line(pts, COLORS.blue, 'stroke-width="3" stroke-dasharray="8 5"');
    }
    // The largest gap (worst age group), ringed in its color band.
    const L = nums.match && nums.match.largest;
    const worst = L && nums.sim.find((d) => d.start === L.start);
    if (worst && ok(worst.rate)) {
      const cx = xp(worst.age), cy = yp(worst.rate * 1e5);
      const color = nums.match.level === "red" ? COLORS.red : nums.match.level === "yellow" ? COLORS.yellow : COLORS.muted;
      s.push(`<circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="${color}" stroke-width="2.5"/>`);
      const above = cy > top + 40;
      s.push(`<text x="${cx}" y="${above ? cy - 17 : cy + 26}" font-size="11" font-weight="600" fill="${color}" text-anchor="middle">largest gap: ${Math.abs(L.z).toFixed(2)}</text>`);
    }
  }
  s.push("</svg>");
  return s.join("\n");
}

// --- Page wiring (browser only) -----------------------------------------------
// The p and N sliders snap to a few round values (Cameron, 2026-11-14: fewer
// in-between values, so each move is a clear step). The slider gives an index.
const P_VALUES = [0.001, 0.002, 0.003, 0.005, 0.0075, 0.01, 0.015, 0.02];
const N_VALUES = [10, 25, 50, 100, 150, 200, 300, 400];

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const state = { seed: 1, sim: null, simKey: null, running: false };
  CI5.cancers.forEach((c, i) => $("cancer").add(new Option(c.name, i)));

  const settings = () => ({
    r: Number($("r").value),
    p: P_VALUES[Number($("p").value)],
    N: N_VALUES[Number($("N").value)],
    cancer: Number($("cancer").value),
  });
  const key = (st) => `${st.r}|${st.p}|${st.N}|${state.seed}`;

  /** Put a number in one of the big tiles, with smaller lines under it. */
  function tile(id, big, small) {
    $(id).querySelector(".big").innerHTML = big;
    $(id).querySelector(".small").innerHTML = small;
  }

  /** Redraw everything from the current sliders. The simulation is shown only if it matches them. */
  function render() {
    const st = settings();
    $("rOut").textContent = st.r;
    $("pOut").textContent = st.p;
    $("NOut").textContent = st.N;
    const sim = state.simKey === key(st) ? state.sim : null;
    const nums = pageNumbers(st.r, st.p, st.N, st.cancer, sim);

    const r2 = (fit) => `<span class="r2">R² ${fit.rSquared.toFixed(3)}</span>`;
    tile("tLife", `${(100 * nums.lifetimeRisk).toFixed(1)}%`, "Chance a simulated person gets cancer by age 85.");
    tile("tExact", nums.exactFit ? nums.exactFit.slope.toFixed(2) : "–",
      nums.exactFit
        ? `What the model predicts, worked out by formula, with no randomness. The simple rule says about r − 1 = ${st.r - 1}; ` +
          `the exact slope comes out lower when hits are common.${r2(nums.exactFit)}`
        : "No cases from age 25 up, so no slope.");
    tile("tSim", nums.simFit ? nums.simFit.slope.toFixed(2) : "–",
      nums.simFit
        ? `What one run of 20,000 simulated people gave. It wobbles around the exact slope from run to run.${r2(nums.simFit)}`
        : state.sim ? "Settings changed: press Run simulation again." : "Press Run simulation.");
    tile("tReal", nums.realFit.slope.toFixed(2), `Measured from real cancer cases (choose the cancer above).${r2(nums.realFit)}`);

    $("matchResults").innerHTML = matchHtml(nums.match, !!state.sim);
    $("logGraph").innerHTML = drawGraph(nums, "log");
    $("plainGraph").innerHTML = drawGraph(nums, "plain");
    renderData(nums);
  }

  /** The results half of the match panel (the "How to read these" box is fixed text in index.html). */
  function matchHtml(m, ranBefore) {
    if (!m) return `<div>${ranBefore ? "Settings changed: press Run simulation again." : "Press Run simulation to compare it with the exact model."}</div>`;
    const v = m.verdict;
    const verdict = v
      ? (v.matches
        ? `<div class="verdict ok">✓ Matches the exact model: the total miss (${m.sumZ2.toFixed(1)}) is below the pass line (${v.passLine.toFixed(1)}).</div>`
        : `<div class="verdict bad">✗ Further off than chance usually gives: the total miss (${m.sumZ2.toFixed(1)}) is above the pass line (${v.passLine.toFixed(1)}).</div>`)
      : `<div class="verdict">No verdict: no age group from 25 up has enough cases to judge.</div>`;
    const worst = m.largest
      ? `Ages ${m.largest.start}–${m.largest.end}: <b class="${m.level}">${Math.abs(m.largest.z).toFixed(2)}</b> noise units off
         (${m.largest.z > 0 ? "more" : "fewer"} cancers than the exact model expects). Ringed on the graphs.`
      : "None: no age group from 25 up has enough cases.";
    const extra = [
      m.fewCases ? `${m.fewCases} age group(s) from 25 up expected fewer than 10 cancers, so their gap is too unreliable to count.` : "",
      m.impossible.length ? `<b class="red">Impossible: cancers in ${m.impossible.join(", ")}, where the exact model expects none. This would be a bug.</b>` : "",
    ].filter(Boolean).map((t) => `<div class="small">${t}</div>`).join("");
    const maxBar = Math.max(3, ...m.rows.filter((g) => g.z !== null).map((g) => Math.abs(g.z)));
    const rows = m.rows.map((g) => {
      const counted = g.z !== null && g.note === null;
      const level = counted ? zLevel(g.z) : "plain";
      const barColor = level === "red" ? "#c8312b" : level === "yellow" ? "#d4a017" : "#9fb8d8";
      const bar = g.z === null ? "" :
        `<span class="bar" style="width:${Math.round(60 * Math.abs(g.z) / maxBar)}px;background:${counted ? barColor : "#d9d8d3"}"></span>`;
      const why = g.note === "few cases" ? "fewer than 10 expected: not counted"
        : g.note ? g.note : `${g.z > 0 ? "more" : "fewer"} than expected`;
      return `<tr${counted ? "" : ' class="dim"'}><td>${g.start}–${g.end}</td><td>${g.simulated}</td><td>${g.expected.toFixed(1)}</td>` +
        `<td>${g.z === null ? "–" : `<span class="${counted ? level : ""}">${g.z.toFixed(2)}</span>`}</td><td>${bar}</td><td>${why}</td></tr>`;
    }).join("");
    return `${verdict}
      <div><b>Largest gap:</b> ${worst}</div>
      <div><b>Total miss over the ${m.groups} age groups counted:</b> <b>${m.sumZ2.toFixed(1)}</b>
        (pass line ${v ? v.passLine.toFixed(1) : "–"}).</div>
      ${extra}
      <table class="gaps">
        <thead><tr><th>Ages</th><th>Simulated cancers</th><th>Expected cancers</th><th>Gap (z)</th><th></th><th>Direction</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="small">Every age group from 25 up. Grey rows expected too few cancers for a reliable gap, so they are left out of the total.</div>`;
  }

  /** The About Data tab: where the real numbers come from, for the chosen cancer. */
  function renderData(nums) {
    $("dataCancer").textContent = nums.cancerName;
    $("dataSlope").textContent = `${nums.realFit.slope.toFixed(2)} (R² ${nums.realFit.rSquared.toFixed(3)}, ages 25–84)`;
    $("dataShift").textContent = nums.exactFit
      ? `×${nums.k.toPrecision(3)} (so the real line meets the model's exact line at age ${MEET_AGE})`
      : "not shifted (the model has no slope at these settings)";
    $("dataRows").innerHTML = nums.realGroups.map((g) =>
      `<tr${g.start >= SLOPE_FROM ? "" : ' class="dim"'}><td>${g.start}–${g.end}</td><td>${g.cases.toLocaleString("en-US")}</td>` +
      `<td>${g.personYears.toLocaleString("en-US")}</td><td>${g.rate === null ? "–" : per100k(g.rate)}</td></tr>`).join("");
  }

  /** Lock the controls and show "running" while the simulation works. */
  function setBusy(busy) {
    state.running = busy;
    $("graphs").classList.toggle("busy", busy);
    $("run").textContent = busy ? "Running…" : "Run simulation";
    for (const id of ["run", "seed", "r", "p", "N", "cancer"]) $(id).disabled = busy;
  }

  /**
   * Run the 20,000-person simulation (about a second). The page can't redraw
   * while it runs, so show the "running" look first and wait two frames until
   * the browser has painted it, then do the work.
   */
  function runSim() {
    if (state.running) return;
    setBusy(true);
    $("status").textContent = "Simulating 20,000 people…";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const st = settings();
      const t0 = performance.now();
      state.sim = runReport(M_PEOPLE, st.N, st.r, st.p, state.seed);
      state.simKey = key(st);
      const ms = performance.now() - t0;
      $("status").textContent = `Done in ${ms < 1000 ? Math.round(ms) + " ms" : (ms / 1000).toFixed(1) + " s"} (seed ${state.seed}).`;
      setBusy(false);
      render();
    }));
  }

  /** Tooltip: show a dot's data-tip next to the pointer. */
  const tip = $("tip");
  document.addEventListener("mousemove", (e) => {
    const t = e.target.closest && e.target.closest(".pt");
    if (!t) { tip.style.display = "none"; return; }
    const [title, ...lines] = t.dataset.tip.split("|");
    tip.replaceChildren();
    const head = document.createElement("b");
    head.textContent = title;
    const list = document.createElement("ul");
    for (const line of lines) {
      const li = document.createElement("li");
      li.textContent = line;
      list.append(li);
    }
    tip.append(head, list);
    tip.style.display = "block";
    const x = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
    tip.style.left = `${x}px`;
    tip.style.top = `${e.clientY + 14}px`;
  });

  /** Tabs: Model | About Data. */
  for (const b of document.querySelectorAll(".tab")) {
    b.addEventListener("click", () => {
      for (const x of document.querySelectorAll(".tab")) x.classList.toggle("on", x === b);
      for (const panel of document.querySelectorAll(".panel")) panel.hidden = panel.id !== b.dataset.panel;
    });
  }

  for (const id of ["r", "p", "N", "cancer"]) $(id).addEventListener("input", render);
  $("run").addEventListener("click", runSim);
  $("seed").addEventListener("click", () => { state.seed += 1; runSim(); });
  render();
}

if (typeof module !== "undefined") module.exports = { pageNumbers, drawGraph, matchSummary, zLevel, P_VALUES, N_VALUES };
