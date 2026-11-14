// app.js - the page: sliders, the real-data menu and the two graphs.
// Drawing and buttons only. Every number comes from model.js (tested) or ci5.js.
// pageNumbers() has no drawing in it, so it can also run in node for checks.

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
    real: realGroups.map((g) => ({ age: g.start + 2.5, rate: g.rate, shifted: g.rate === null ? null : g.rate * k })),
    realFit,
    real6064: realGroups[12].rate,
    k,
    sim: sim ? sim.groups.map((g) => ({ age: g.start + 2.5, rate: g.simulatedRate, cases: g.simulatedCases })) : null,
    simFit: sim ? sim.simulatedFit : null,
    match: sim ? matchSummary(sim) : null,
  };
}

/**
 * How well one simulation matches the exact model, from runReport's tested
 * z-scores (spec item 9). Colors use the decided bands: |z| below 2 plain,
 * 2 to 3 yellow, above 3 red. The pass line itself is not set yet (HAND CHECK 6).
 */
function matchSummary(sim) {
  const z = sim.zSummary;
  const k = z.groupsInSum;
  const spread = Math.sqrt(2 * k);
  const size = z.largest ? Math.abs(z.largest.z) : 0;
  const level = size > 3 ? "red" : size >= 2 ? "yellow" : "plain";
  const fromSlopeAge = sim.groups.filter((g) => g.start >= SLOPE_FROM);
  return {
    largest: z.largest, // {z, start, end} or null
    level,
    sumZ2: z.sumZ2,
    groups: k,
    noiseLow: k - spread,
    noiseHigh: k + spread,
    fewCases: fromSlopeAge.filter((g) => g.note === "few cases").length,
    impossible: sim.groups.filter((g) => g.note === "impossible: expected 0").map((g) => `${g.start}-${g.end}`),
  };
}

// --- Drawing (SVG strings) --------------------------------------------------
const COLORS = { ink: "#0b0b0b", muted: "#52514e", grid: "#e6e5e0", blue: "#2a78d6", orange: "#d9822b" };

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
    if (xy.length > 1) s.push(`<polyline fill="none" stroke="${color}" stroke-width="2" ${extra || ""} points="${xy.join(" ")}"/>`);
  };
  const dots = (pts, color, tip) => {
    for (const d of pts.filter((d) => ok(d.v))) {
      s.push(`<circle cx="${xp(d.a).toFixed(1)}" cy="${yp(d.v * 1e5).toFixed(1)}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5"><title>${tip(d)}</title></circle>`);
    }
  };
  // Real data (shifted), orange.
  const real = nums.real.map((d) => ({ a: d.age, v: d.shifted, raw: d.rate }));
  line(real, COLORS.orange, 'stroke-opacity="0.5"');
  dots(real, COLORS.orange, (d) => `${nums.cancerName}, ages ${d.a - 2.5}-${d.a + 1.5}: real ${per100k(d.raw)} per 100,000 (drawn ×${nums.k.toPrecision(3)})`);
  // Exact curve, black.
  line(nums.exact.map((d) => ({ a: d.age, v: d.rate })), COLORS.ink);
  // Simulation, blue dots and fitted line (log graph only for the line: it is straight there).
  if (nums.sim) {
    dots(nums.sim.map((d) => ({ a: d.age, v: d.rate, cases: d.cases })), COLORS.blue,
      (d) => `Ages ${d.a - 2.5}-${d.a + 1.5}, all 20,000 simulated people: ${d.cases} cancers, ` +
        `${Math.round(d.cases / d.v).toLocaleString("en-US")} person-years, rate ${per100k(d.v)} per 100,000`);
    if (nums.simFit) {
      const f = (a) => Math.exp(nums.simFit.intercept + nums.simFit.slope * Math.log(a));
      const pts = [];
      for (let a = 27.5; a <= 82.5; a += 1) pts.push({ a, v: f(a) });
      line(pts, COLORS.blue, 'stroke-dasharray="6 4"');
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

  /** Put a number in one of the big tiles, with a smaller line under it. */
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

    tile("tLife", `${(100 * nums.lifetimeRisk).toFixed(1)}%`, "chance of cancer by age 85 (real single cancers: a few % up to ~10%)");
    const r2 = (fit) => `R² ${fit.rSquared.toFixed(3)}`;
    tile("tExact", nums.exactFit ? nums.exactFit.slope.toFixed(2) : "–",
      nums.exactFit ? `${r2(nums.exactFit)} · simple rule says r − 1 = ${st.r - 1}` : "no cases from age 25 up");
    if (nums.simFit) {
      tile("tSim", nums.simFit.slope.toFixed(2), `${r2(nums.simFit)} · ${nums.simFit.used} age groups · 20,000 people, seed ${state.seed}`);
    } else {
      tile("tSim", "–", state.sim ? "settings changed: press Run again" : "press Run simulation");
    }
    tile("tReal", nums.realFit.slope.toFixed(2),
      `${r2(nums.realFit)} · ${nums.cancerName}, England men. Real 60–64 rate ${per100k(nums.real6064)} per 100,000, drawn ×${nums.k.toPrecision(3)}`);
    $("match").innerHTML = matchHtml(nums.match, !!state.sim);

    $("logGraph").innerHTML = drawGraph(nums, "log");
    $("plainGraph").innerHTML = drawGraph(nums, "plain");
  }

  /** The "how well does the simulation match?" panel, as HTML. */
  function matchHtml(m, ranBefore) {
    const passLine = `<div class="note">Pass line not set yet: how far off counts as "wrong" will be measured over 20 seeds
      (spec HAND CHECK 6). Until then these numbers describe the run; they don't pass or fail it.</div>`;
    if (!m) {
      return `<div class="mtitle">How well does the simulation match the exact model?</div>
        <div>${ranBefore ? "Settings changed: press Run simulation again." : "Press Run simulation to compare it with the exact model."}</div>${passLine}`;
    }
    const zText = m.largest
      ? `<b class="${m.level}">${Math.abs(m.largest.z).toFixed(2)}</b> in ages ${m.largest.start}–${m.largest.end}
         (${m.largest.z > 0 ? "too many" : "too few"} cases)`
      : "none (no age group from 25 up has enough cases)";
    const extra = [
      m.fewCases ? `${m.fewCases} group(s) from 25 up had fewer than 10 expected cases; their z is unreliable and left out.` : "",
      m.impossible.length ? `<b class="red">Impossible: cases in ${m.impossible.join(", ")}, where the exact model expects 0.</b>` : "",
    ].filter(Boolean).map((t) => `<div>${t}</div>`).join("");
    return `<div class="mtitle">How well does the simulation match the exact model?</div>
      <div><b>Largest gap (|z|):</b> ${zText}. Up to 2 is normal noise; 2–3 <span class="yellow">yellow</span>; over 3 <span class="red">red</span>.</div>
      <div><b>All age groups together (sum of z²):</b> <b>${m.sumZ2.toFixed(1)}</b> over ${m.groups} groups.
        Noise alone usually gives about ${m.groups} (${m.noiseLow.toFixed(1)} to ${m.noiseHigh.toFixed(1)}).</div>
      ${extra}${passLine}`;
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

  for (const id of ["r", "p", "N", "cancer"]) $(id).addEventListener("input", render);
  $("run").addEventListener("click", runSim);
  $("seed").addEventListener("click", () => { state.seed += 1; runSim(); });
  render();
}

if (typeof module !== "undefined") module.exports = { pageNumbers, drawGraph, matchSummary, P_VALUES, N_VALUES };
