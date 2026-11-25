/* ============================================================
   Sample client portal — /portal.html

   A made-up project (second-storey addition and first-floor renovation)
   with real PSI photographs, so a visitor can click around the portal
   every client gets. Everything works: the scope checklist drives the
   percentage, decisions can be made, change orders approved, invoices
   paid, messages sent. State lives in localStorage so it survives a
   reload; "Reset the sample" puts it back.

   Dates are relative to today, so the "next Thursday" decision is always
   next Thursday. The schedule is 16 weeks starting five weeks ago.
   ============================================================ */
(function () {
  "use strict";
  const main = document.getElementById("portalMain");
  if (!main) return;

  // ---------------- dates ----------------
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monday = (d) => { const m = new Date(d); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; };
  const thisMon = monday(today);
  const addDays = (d, n) => new Date(d.getTime() + n * DAY);
  const START = addDays(thisMon, -35);                       // week 1 Monday, five weeks ago
  const WEEKS = 16;
  const weekOf = (d) => Math.floor((monday(d) - START) / (7 * DAY)) + 1;
  const CUR_WEEK = weekOf(today);                            // 6
  const fmt = (d, o) => d.toLocaleDateString("en-US", o || { weekday: "short", month: "short", day: "numeric" });
  const fmtLong = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const money = (n) => "$" + n.toLocaleString("en-US");
  const daysUntil = (d) => Math.round((d - today) / DAY);
  const dueWord = (d) => { const n = daysUntil(d); return n < 0 ? Math.abs(n) + " days overdue" : n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days"; };
  // next week's Thursday, the Friday two weeks out, the Tuesday three weeks out
  const NEXT_THU = addDays(thisMon, 7 + 3);
  const FRI_2W = addDays(thisMon, 14 + 4);
  const TUE_3W = addDays(thisMon, 21 + 1);

  // ---------------- photographs (a real PSI job) ----------------
  const P = "assets/photos/417-warren/417warren-";
  const photo = (n, cap, phase) => ({ src: P + String(n).padStart(2, "0") + ".jpg", cap, phase });
  const PHOTOS = [
    photo(1, "The second floor framed out — subfloor down, walls going up", "Framing"),
    photo(2, "Exterior walls framed on the new second floor", "Framing"),
    photo(3, "Interior partitions framed out", "Framing"),
    photo(4, "Framing run tight to the existing chimney", "Framing"),
    photo(5, "The new second storey framed above the original house", "Framing"),
    photo(6, "From the street — a one-storey house gaining a floor", "Framing"),
    photo(7, "Roof sheathing going on", "Roof"),
    photo(8, "Roof decked and ready for underlayment", "Roof"),
    photo(9, "Inside the new floor, partitions and services framed", "Framing"),
    photo(10, "Sheathed and wrapped against the weather", "Exterior"),
    photo(11, "The wrapped second storey from the street", "Exterior"),
    photo(12, "Materials staged alongside the wrapped addition", "Exterior"),
    photo(13, "Drywall hung and taped in the new rooms", "Drywall"),
    photo(14, "The main space boarded out", "Drywall"),
    photo(15, "Ceilings taped, fixture hung", "Drywall"),
    photo(16, "Hallway boarded through to the new rooms", "Drywall"),
    photo(17, "Corridor taped and sanded", "Drywall"),
    photo(18, "Ready for primer", "Drywall"),
    photo(19, "Shower formed and boarded, ready to tile", "Tile"),
    photo(20, "Shower walls tiled", "Tile"),
    photo(21, "Tub surround tiled", "Tile"),
    photo(22, "Recessed niche set into the tiled surround", "Tile"),
    photo(23, "The second shower tiled through", "Tile"),
    photo(24, "Painted out, before the flooring goes down", "Paint"),
    photo(25, "Rooms painted and waiting on floors", "Paint"),
    photo(26, "Siding going on over the wrap", "Siding"),
    photo(27, "The addition sided and trimmed", "Siding"),
    photo(28, "Built-in cabinetry and new flooring in", "Finished"),
    photo(29, "Tub complete with fixtures set", "Finished"),
    photo(30, "Bathroom finished — vanity, toilet, tiled floor", "Finished"),
    photo(31, "The finished room, floor laid throughout", "Finished"),
    photo(32, "Finished space through to the hall", "Finished"),
    photo(33, "Built-in bookcase in solid timber", "Finished"),
    photo(34, "Frameless glass shower complete", "Finished"),
    photo(35, "The second bathroom finished", "Finished"),
  ];
  // On a sample job that is a third of the way through, only the first
  // twelve photographs "exist" so far. The rest appear under their phases
  // in the photo tab as what is to come, marked as such.
  const TAKEN = 12;

  // ---------------- the plan ----------------
  // Phases with their weeks and the tasks that make up the percentage.
  const PHASES = [
    { name: "Drawings, engineering & permits", weeks: [1, 2], tasks: ["Measured survey of the existing house", "Architectural drawings issued", "Structural engineering stamped", "Kingston building permit issued"] },
    { name: "Site set-up & demolition", weeks: [3, 3], tasks: ["Protection down inside, dumpster and fencing set", "Existing roof stripped and trusses removed", "Temporary weather cover on"] },
    { name: "Framing the second storey", weeks: [4, 5], tasks: ["Floor system and subfloor", "Exterior walls framed", "Interior partitions framed", "Framing inspection passed"] },
    { name: "Roof", weeks: [6, 6], tasks: ["Roof framed and sheathed", "Underlayment and ice-and-water", "Shingles on", "Flashing and gutters"] },
    { name: "Windows, wrap & dry-in", weeks: [7, 7], tasks: ["House wrap and flashing tape", "Windows set and sealed", "Exterior doors hung"] },
    { name: "Rough-ins", weeks: [8, 8], tasks: ["Electrical rough-in", "Plumbing rough-in", "HVAC extended to the new floor", "Rough inspections passed"] },
    { name: "Insulation & drywall", weeks: [9, 10], tasks: ["Insulation and vapour barrier", "Insulation inspection", "Drywall hung", "Taped, sanded and primed"] },
    { name: "Siding & exterior trim", weeks: [11, 11], tasks: ["Siding installed", "Trim, soffit and fascia"] },
    { name: "Tile, paint & flooring", weeks: [12, 14], tasks: ["Bathrooms waterproofed and tiled", "Walls and ceilings painted", "Flooring laid", "Interior doors and trim"] },
    { name: "Fixtures, cabinetry & punch list", weeks: [15, 16], tasks: ["Plumbing and lighting fixtures set", "Built-in cabinetry installed", "Final inspection and CO", "Punch list and final clean"] },
  ];
  const TASKS = [];
  PHASES.forEach((ph, pi) => ph.tasks.forEach((t, ti) => TASKS.push({ id: pi + "-" + ti, phase: pi, name: t })));
  // what is done at the start of the sample: everything up to the roof sheathing
  const DONE_AT_START = new Set(TASKS.slice(0, 12).map((t) => t.id));   // 12 of 36 → 33%

  // ---------------- daily updates ----------------
  // Working days back from yesterday; the newest first. Each ties to the
  // photographs that were taken that day.
  const UPDATE_TEXT = [
    { text: "Roof sheathing finished on the rear slope and the ridge vent cut in. Underlayment starts tomorrow, ice-and-water at the eaves first. Dumpster swapped at 2pm.", crew: 4, hours: "7:15–4:00", weather: "Overcast, 48°F", photos: [8] },
    { text: "Front slope sheathed. Roofer walked the job for the shingle delivery next week — Charcoal, as decided. Framing inspection card signed off and posted at the panel.", crew: 4, hours: "7:00–3:45", weather: "Sunny, 52°F", photos: [7] },
    { text: "Roof rafters set and the ridge beam bolted. Interior partitions on the new floor finished and the chase for the bathroom plumbing framed in. Framing inspection booked for tomorrow 10am.", crew: 5, hours: "7:00–4:30", weather: "Sunny, 55°F", photos: [9] },
    { text: "The whole second storey is now framed above the house. Window openings checked against the order; two rough openings adjusted a half inch. No one on site tomorrow — lumber delivery is Monday.", crew: 5, hours: "7:00–4:00", weather: "Clear, 50°F", photos: [5, 6] },
    { text: "Framing run tight to the existing chimney and the flashing detail photographed for the roofer. Rear bedroom wall and the closet partitions up.", crew: 4, hours: "7:15–4:00", weather: "Rain until 10, then clear", photos: [4] },
    { text: "Interior partitions on the new floor laid out and framed: two bedrooms, bathroom, hall. Electrician stopped by to walk the panel route.", crew: 4, hours: "7:00–3:30", weather: "Sunny, 46°F", photos: [3] },
    { text: "Exterior walls stood and braced on all four sides. Sheathing started on the west wall. Street side will be wrapped before the weekend if the weather holds.", crew: 5, hours: "7:00–4:15", weather: "Windy, 44°F", photos: [2] },
    { text: "Floor system complete and the subfloor glued and screwed. First exterior wall framed flat and ready to stand in the morning. Yard protection re-laid after the delivery.", crew: 5, hours: "7:00–4:00", weather: "Sunny, 49°F", photos: [1] },
    { text: "Floor joists hung on the new beam, blocking in. Lumber for the walls stacked on the deck under tarps.", crew: 4, hours: "7:15–3:45", weather: "Sunny, 51°F", photos: [] },
    { text: "Temporary roof cover on and tied down. Old trusses out and hauled. The house is weather-tight for the weekend.", crew: 4, hours: "7:00–5:00", weather: "Cloudy, 47°F", photos: [] },
    { text: "Roof stripped to the top plates. Protection checked inside — no dust past the stair door. Dumpster two-thirds full.", crew: 4, hours: "7:00–4:30", weather: "Clear, 53°F", photos: [] },
    { text: "Site set-up: fencing, dumpster, protection down in the hall and stair, power and water confirmed. Demolition starts tomorrow.", crew: 3, hours: "8:00–3:00", weather: "Sunny, 56°F", photos: [] },
  ];
  const UPDATES = [];
  (function () {
    let d = addDays(today, -1), i = 0;
    while (i < UPDATE_TEXT.length) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { UPDATES.push(Object.assign({ date: d }, UPDATE_TEXT[i])); i++; }
      d = addDays(d, -1);
    }
  })();

  // ---------------- schedule ----------------
  // Per week: items placed on days (0 = Mon … 5 = Sat).
  const SCHEDULE = {
    1: [[0, "Measured survey", "done"], [1, "Drawings started", "done"], [4, "Drawings issued for review", "done"]],
    2: [[0, "Engineering review", "done"], [2, "Stamped drawings received", "done"], [3, "Permit application filed", "done"], [4, "Permit issued", "done"]],
    3: [[0, "Site set-up, protection, dumpster", "done"], [1, "Roof demolition", "done"], [2, "Roof demolition", "done"], [3, "Temporary cover on", "done"]],
    4: [[0, "Lumber delivery", "done"], [1, "Floor system", "done"], [2, "Subfloor", "done"], [3, "Exterior walls", "done"], [4, "Exterior walls", "done"]],
    5: [[0, "Interior partitions", "done"], [1, "Partitions, chimney detail", "done"], [2, "Rafters and ridge", "done"], [3, "Framing inspection 10am", "insp"], [4, "Roof sheathing", "done"]],
    6: [[0, "Roof sheathing", "done"], [1, "Underlayment, ice-and-water", "now"], [2, "Underlayment", "now"], [3, "Shingles delivered", "up"], [4, "Shingles on", "up"], [5, "Shingles on (half day)", "up"]],
    7: [[0, "Flashing and gutters", "up"], [1, "House wrap", "up"], [2, "Windows set", "up"], [3, "Windows, exterior doors", "up"], [3, "Decision due: bathroom tile", "you"], [4, "Dry-in check", "up"]],
    8: [[0, "Electrical rough-in", "up"], [1, "Electrical rough-in", "up"], [2, "Plumbing rough-in", "up"], [3, "HVAC extended", "up"], [4, "Rough inspections", "insp"], [4, "Decision due: windows", "you"]],
    9: [[0, "Insulation", "up"], [1, "Insulation", "up"], [2, "Insulation inspection", "insp"], [3, "Drywall delivered", "up"], [4, "Drywall hung", "up"]],
    10: [[0, "Drywall hung", "up"], [1, "Decision due: siding colour", "you"], [1, "Taping", "up"], [2, "Taping", "up"], [3, "Sanding", "up"], [4, "Primer", "up"]],
    11: [[0, "Siding", "up"], [1, "Siding", "up"], [2, "Siding", "up"], [3, "Trim, soffit, fascia", "up"], [4, "Exterior paint", "up"]],
    12: [[0, "Bathroom waterproofing", "up"], [1, "Tile", "up"], [2, "Tile", "up"], [3, "Tile", "up"], [4, "Grout", "up"]],
    13: [[0, "Paint", "up"], [1, "Paint", "up"], [2, "Paint", "up"], [3, "Flooring delivered", "up"], [4, "Flooring", "up"]],
    14: [[0, "Flooring", "up"], [1, "Interior doors", "up"], [2, "Trim", "up"], [3, "Trim", "up"], [4, "Trim paint", "up"]],
    15: [[0, "Plumbing fixtures", "up"], [1, "Lighting fixtures", "up"], [2, "Built-in cabinetry", "up"], [3, "Built-in cabinetry", "up"], [4, "Final inspection", "insp"]],
    16: [[0, "Punch list", "up"], [1, "Punch list", "up"], [2, "Final clean", "up"], [3, "Walk-through with you", "you"]],
  };

  // ---------------- decisions ----------------
  const DECISIONS = [
    { id: "tile", title: "Bathroom tile selection", due: NEXT_THU, text: "Both upstairs bathrooms. The tile order takes ten working days, and tiling starts in week 12 — this is the last day we can order without moving the schedule. Samples are at the house, in the hall.",
      opts: [{ k: "a", name: "Carrara-look porcelain 12×24", note: "Within allowance", delta: 0 }, { k: "b", name: "Charcoal slate-look porcelain 12×24", note: "Within allowance", delta: 0 }, { k: "c", name: "Handmade-look white subway + hex floor", note: "Over allowance", delta: 1140 }] },
    { id: "windows", title: "Window style & exterior colour", due: FRI_2W, text: "Six windows on the new floor. The order is placed the Monday after this date, five-week lead time, set in week 7 of the plan.",
      opts: [{ k: "a", name: "Double-hung, white exterior", note: "Matches the existing", delta: 0 }, { k: "b", name: "Double-hung, black exterior", note: "Upgrade", delta: 860 }, { k: "c", name: "Casement, black exterior", note: "Upgrade", delta: 1420 }] },
    { id: "siding", title: "Siding colour for the addition", due: TUE_3W, text: "Vinyl siding, matched profile to the existing first floor. Two sample boards are clipped to the front wall so you can see them in the morning and evening light.",
      opts: [{ k: "a", name: "Match existing — Clay", note: "No change", delta: 0 }, { k: "b", name: "Whole house re-sided — Slate Grey", note: "Change order", delta: 7900 }] },
  ];
  const DECIDED = [
    { title: "Roof shingle colour", choice: "Charcoal architectural shingle", when: addDays(today, -13) },
    { title: "Stair location", choice: "Kept at the rear hall, as drawn", when: addDays(today, -24) },
    { title: "Second bathroom layout", choice: "Tub with shower over, vanity on the window wall", when: addDays(today, -27) },
  ];

  // ---------------- contract, change orders, allowances ----------------
  const CONTRACT = { total: 186400, signed: addDays(START, -12) };
  const CHANGES = [
    { id: "CO-01", title: "Built-in bookcase, rear bedroom", amount: 3850, status: "approved", when: addDays(today, -20), text: "Solid poplar built-in, 8 ft wide, painted to match trim. Adds two days to week 15." },
    { id: "CO-02", title: "Frameless glass shower, main bath", amount: 2400, status: "approved", when: addDays(today, -9), text: "In place of the framed door in the contract. No schedule change." },
    { id: "CO-03", title: "Relocate laundry to the new floor", amount: 6900, status: "pending", when: addDays(today, -2), text: "Stacked washer-dryer in the hall closet: plumbing and drain run, dedicated circuit, dryer vent through the rear wall. Adds one day to week 8 and one to week 15. Needs your approval before the plumbing rough-in." },
  ];
  const ALLOWANCES = [
    { name: "Tile (material)", allow: 4200, spent: 0, note: "Pending your selection" },
    { name: "Plumbing fixtures", allow: 3600, spent: 3180 },
    { name: "Lighting fixtures", allow: 1800, spent: 1265 },
    { name: "Flooring (material)", allow: 5400, spent: 5400 },
    { name: "Interior doors & hardware", allow: 2100, spent: 2310 },
  ];

  // ---------------- invoices ----------------
  const INVOICES = [
    { id: "INV-1001", title: "Deposit — on signing", amount: 18640, due: addDays(START, -12), status: "paid", paidOn: addDays(START, -12), method: "Check #2201" },
    { id: "INV-1002", title: "Progress 1 — permits & site set-up", amount: 27960, due: addDays(START, 16), status: "paid", paidOn: addDays(START, 15), method: "Bank transfer" },
    { id: "INV-1003", title: "Progress 2 — framing complete", amount: 37280, due: addDays(START, 32), status: "paid", paidOn: addDays(START, 33), method: "Bank transfer" },
    { id: "INV-1004", title: "Progress 3 — roof on & dry-in", amount: 37280, due: NEXT_THU, status: "due" },
    { id: "INV-1005", title: "Progress 4 — rough-ins & drywall", amount: 27960, due: addDays(START, 70), status: "scheduled" },
    { id: "INV-1006", title: "Progress 5 — finishes", amount: 27960, due: addDays(START, 98), status: "scheduled" },
    { id: "INV-1007", title: "Final — on completion", amount: 9320, due: addDays(START, 112), status: "scheduled" },
  ];
  const RECEIPTS = [
    { id: "R-0418", vendor: "Lumber supply", what: "Framing package, 2nd storey", amount: 11240, when: addDays(START, 21), invoice: "INV-1003" },
    { id: "R-0431", vendor: "Roofing supply", what: "Sheathing, underlayment, ice-and-water", amount: 2870, when: addDays(START, 33), invoice: "INV-1004" },
    { id: "R-0436", vendor: "Roofing supply", what: "Charcoal architectural shingles, ridge vent", amount: 3410, when: addDays(today, -1), invoice: "INV-1004" },
    { id: "R-0407", vendor: "Kingston Borough", what: "Building permit", amount: 1385, when: addDays(START, 11), invoice: "INV-1002" },
  ];

  // ---------------- messages ----------------
  const MESSAGES = [
    { who: "PSI", when: addDays(today, -3), text: "Framing inspection passed this morning, no notes. Roof sheathing starts tomorrow." },
    { who: "You", when: addDays(today, -3), text: "Great news. Is the chimney flashing detail sorted with the roofer?" },
    { who: "PSI", when: addDays(today, -3), text: "Yes — photographed it for him on Thursday, it's in that day's update. Step flashing with a counter-flashing cut into the mortar joint." },
    { who: "PSI", when: addDays(today, -1), text: "Reminder: the tile decision is due next Thursday so the order lands before week 12. Samples are in the hall if you want to look at them in daylight this weekend." },
  ];

  // ---------------- state ----------------
  const KEY = "psiPortalSample.v1";
  let state;
  function freshState() {
    return { done: Array.from(DONE_AT_START), decided: {}, changes: {}, paid: {}, messages: [], tab: "overview", week: CUR_WEEK };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.done) return s; } catch (e) { /* fine */ }
    return freshState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* fine */ } }
  state = load();
  const isDone = (id) => state.done.indexOf(id) >= 0;
  const pct = () => Math.round(100 * state.done.length / TASKS.length);
  const pendingDecisions = () => DECISIONS.filter((d) => !state.decided[d.id]);
  const pendingChanges = () => CHANGES.filter((c) => c.status === "pending" && !state.changes[c.id]);
  const dueInvoices = () => INVOICES.filter((i) => i.status === "due" && !state.paid[i.id]);
  const currentPhase = () => {
    for (let i = PHASES.length - 1; i >= 0; i--) if (TASKS.some((t) => t.phase === i && isDone(t.id))) return PHASES[Math.min(i + (TASKS.filter((t) => t.phase === i).every((t) => isDone(t.id)) ? 1 : 0), PHASES.length - 1)];
    return PHASES[0];
  };

  // ---------------- helpers ----------------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const h = (strings, ...vals) => strings.reduce((out, s, i) => out + s + (i < vals.length ? vals[i] : ""), "");

  // ---------------- views ----------------
  const VIEWS = {};

  VIEWS.overview = () => {
    const p = pct(), r = 46, c = 2 * Math.PI * r;
    const ph = currentPhase();
    const week = Math.min(WEEKS, Math.max(1, CUR_WEEK));
    const weekItems = (SCHEDULE[week] || []);
    const next = pendingDecisions().slice().sort((a, b) => a.due - b.due)[0];
    const due = dueInvoices()[0];
    const co = pendingChanges()[0];
    return h`
      <div class="pp__head">
        <div><h2 class="pp__title">Overview</h2><p class="pp__sub">${esc(fmtLong(today))} · week ${week} of ${WEEKS}</p></div>
        <span class="pill pill--now">On schedule</span>
      </div>
      <div class="pp__grid">
        <div class="card card--4">
          <p class="card__title">Progress</p>
          <div class="ring">
            <svg class="ring__svg" viewBox="0 0 108 108" aria-hidden="true">
              <circle class="ring__track" cx="54" cy="54" r="${r}"></circle>
              <circle class="ring__bar" cx="54" cy="54" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p / 100)).toFixed(1)}"></circle>
              <text class="ring__num" x="54" y="62" text-anchor="middle">${p}%</text>
            </svg>
            <div class="ring__text"><strong>${esc(ph.name)}</strong><span>${state.done.length} of ${TASKS.length} items complete</span></div>
          </div>
          <p class="card__link"><button type="button" data-go="scope">See the full scope checklist &rarr;</button></p>
        </div>
        <div class="card card--4 ${next || due || co ? "" : "card--soft"}">
          <p class="card__title">Needs you</p>
          <ul class="plain">
            ${due ? h`<li><div><strong>${esc(due.title)}</strong><br><small>${money(due.amount)} · <button type="button" class="linklike" data-tab-go="invoices">pay or view</button></small></div><span class="when"><strong>${esc(fmt(due.due))}</strong>${dueWord(due.due)}</span></li>` : ""}
            ${co ? h`<li><div><strong>Approve ${esc(co.id)}: ${esc(co.title)}</strong><br><small>${money(co.amount)} · <button type="button" class="linklike" data-tab-go="documents">review</button></small></div><span class="when"><strong>Before week 8</strong>rough-ins</span></li>` : ""}
            ${pendingDecisions().slice().sort((a, b) => a.due - b.due).map((d) => h`<li><div><strong>${esc(d.title)}</strong><br><small><button type="button" class="linklike" data-tab-go="decisions">decide</button></small></div><span class="when"><strong>${esc(fmt(d.due))}</strong>${dueWord(d.due)}</span></li>`).join("")}
            ${!due && !co && !pendingDecisions().length ? "<li>Nothing outstanding. Thank you.</li>" : ""}
          </ul>
        </div>
        <div class="card card--4">
          <p class="card__title">Latest update <small>· ${esc(fmt(UPDATES[0].date))}</small></p>
          <p style="margin:0 0 10px">${esc(UPDATES[0].text)}</p>
          <div class="upd__photos">${UPDATES[0].photos.map((n) => h`<button type="button" data-photo="${n - 1}"><img src="${PHOTOS[n - 1].src}" alt="${esc(PHOTOS[n - 1].cap)}" loading="lazy"></button>`).join("")}</div>
          <p class="card__link"><button type="button" data-tab-go="updates">All daily updates &rarr;</button></p>
        </div>
        <div class="card card--8">
          <p class="card__title">This week <small>· ${esc(fmt(addDays(START, (week - 1) * 7)))} – ${esc(fmt(addDays(START, (week - 1) * 7 + 5)))}</small></p>
          ${renderWeek(week, true)}
          <p class="card__link"><button type="button" data-tab-go="schedule">Full 16-week schedule &rarr;</button></p>
        </div>
        <div class="card card--4">
          <p class="card__title">Money</p>
          <ul class="plain">
            <li><span>Contract</span><span class="doc__amt">${money(CONTRACT.total)}</span></li>
            <li><span>Approved changes</span><span class="doc__amt">+${money(approvedChangesTotal())}</span></li>
            <li><span>Paid to date</span><span class="doc__amt">${money(paidTotal())}</span></li>
            <li><span><strong>Current contract value</strong></span><span class="doc__amt"><strong>${money(CONTRACT.total + approvedChangesTotal())}</strong></span></li>
          </ul>
          <p class="card__link"><button type="button" data-tab-go="invoices">Invoices &amp; receipts &rarr;</button></p>
        </div>
      </div>`;
  };

  function approvedChangesTotal() {
    return CHANGES.reduce((s, c) => s + ((c.status === "approved" || state.changes[c.id] === "approved") ? c.amount : 0), 0);
  }
  function paidTotal() {
    return INVOICES.reduce((s, i) => s + ((i.status === "paid" || state.paid[i.id]) ? i.amount : 0), 0);
  }

  VIEWS.scope = () => h`
    <div class="pp__head">
      <div><h2 class="pp__title">Scope checklist</h2><p class="pp__sub">Every item in the contract. Tick one and the percentage moves — this is what drives the number on the overview.</p></div>
      <span class="pill pill--now">${pct()}% complete</span>
    </div>
    <div class="scope">
      ${PHASES.map((ph, pi) => {
        const tasks = TASKS.filter((t) => t.phase === pi);
        const done = tasks.filter((t) => isDone(t.id)).length;
        return h`<div class="scope__phase">
          <div class="scope__phase-head"><span>${esc(ph.name)} <small style="color:var(--muted);font-weight:400">· weeks ${ph.weeks[0]}${ph.weeks[1] !== ph.weeks[0] ? "–" + ph.weeks[1] : ""}</small></span><div class="scope__bar"><i style="width:${100 * done / tasks.length}%"></i></div><span>${done}/${tasks.length}</span></div>
          <ul class="scope__tasks">${tasks.map((t) => h`<li><label class="scope__task ${isDone(t.id) ? "is-done" : ""}"><input type="checkbox" data-task="${t.id}" ${isDone(t.id) ? "checked" : ""}><span>${esc(t.name)}</span>${isDone(t.id) ? "<small>done</small>" : ""}</label></li>`).join("")}</ul>
        </div>`;
      }).join("")}
    </div>`;

  VIEWS.updates = () => h`
    <div class="pp__head">
      <div><h2 class="pp__title">Daily updates</h2><p class="pp__sub">Posted at the end of every working day, with the photographs taken that day.</p></div>
    </div>
    <div class="upd">
      ${UPDATES.map((u) => h`<article class="upd__day">
        <div class="upd__head"><h3 class="upd__date">${esc(fmtLong(u.date))}</h3><span class="upd__meta">${u.crew} on site · ${esc(u.hours)} · ${esc(u.weather)}</span></div>
        <p class="upd__text">${esc(u.text)}</p>
        ${u.photos.length ? h`<div class="upd__photos">${u.photos.map((n) => h`<button type="button" data-photo="${n - 1}"><img src="${PHOTOS[n - 1].src}" alt="${esc(PHOTOS[n - 1].cap)}" loading="lazy"></button>`).join("")}</div>` : ""}
      </article>`).join("")}
    </div>`;

  function renderWeek(week, compact) {
    const mon = addDays(START, (week - 1) * 7);
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const items = SCHEDULE[week] || [];
    return h`<div class="sch__week">${names.map((n, d) => {
      const date = addDays(mon, d);
      const cls = date.getTime() === today.getTime() ? "is-today" : date < today ? "is-past" : "";
      return h`<div class="sch__day ${cls}"><p class="sch__dayname">${n}<b>${date.getDate()}</b></p>${items.filter((it) => it[0] === d).map((it) => {
        const k = it[2] === "done" ? "sch__item--done" : it[2] === "insp" ? "sch__item--insp" : it[2] === "you" ? "sch__item--you" : it[2] === "up" ? "sch__item--up" : "";
        return h`<p class="sch__item ${k}">${esc(it[1])}</p>`;
      }).join("")}</div>`;
    }).join("")}</div>`;
  }

  VIEWS.schedule = () => {
    const week = Math.min(WEEKS, Math.max(1, state.week || CUR_WEEK));
    const mon = addDays(START, (week - 1) * 7);
    return h`
      <div class="pp__head">
        <div><h2 class="pp__title">Schedule</h2><p class="pp__sub">Sixteen weeks. Green is done, blue is this week's work, red is something we need from you.</p></div>
        <span class="pill pill--now">Week ${CUR_WEEK} of ${WEEKS}</span>
      </div>
      <div class="sch__nav">
        <button type="button" data-week="${week - 1}" ${week <= 1 ? "disabled" : ""}>&larr; Previous week</button>
        <strong>Week ${week} · ${esc(fmt(mon, { month: "long", day: "numeric" }))} – ${esc(fmt(addDays(mon, 5), { month: "long", day: "numeric" }))}${week === CUR_WEEK ? " (this week)" : ""}</strong>
        <button type="button" data-week="${week + 1}" ${week >= WEEKS ? "disabled" : ""}>Next week &rarr;</button>
      </div>
      ${renderWeek(week)}
      <div class="sch__legend"><span><i style="background:#e3f3e8;border-left:3px solid var(--ok)"></i>Done</span><span><i style="background:#e6eef9;border-left:3px solid #1f4f8f"></i>In progress</span><span><i style="background:var(--soft);border-left:3px solid #b9b5ad"></i>Planned</span><span><i style="background:#fdeedd;border-left:3px solid var(--warn)"></i>Inspection</span><span><i style="background:#fde8e8;border-left:3px solid var(--accent)"></i>Needs you</span></div>
      <div class="sch__phases card" style="margin-top:20px">
        <p class="card__title">The whole job at a glance</p>
        ${PHASES.map((ph, pi) => {
          const tasks = TASKS.filter((t) => t.phase === pi);
          const all = tasks.every((t) => isDone(t.id)), some = tasks.some((t) => isDone(t.id));
          const l = (ph.weeks[0] - 1) / WEEKS * 100, w = (ph.weeks[1] - ph.weeks[0] + 1) / WEEKS * 100;
          return h`<div class="sch__phase-row"><span>${esc(ph.name)}</span><div class="sch__gantt"><i class="${all ? "is-done" : some ? "is-now" : ""}" style="left:${l}%;width:${w}%"></i><b style="left:${(CUR_WEEK - 1 + ((today - thisMon) / DAY) / 7) / WEEKS * 100}%" title="Today"></b></div></div>`;
        }).join("")}
      </div>`;
  };

  VIEWS.decisions = () => {
    const pending = pendingDecisions().slice().sort((a, b) => a.due - b.due);
    const made = DECISIONS.filter((d) => state.decided[d.id]).map((d) => ({ title: d.title, choice: d.opts.find((o) => o.k === state.decided[d.id].k).name, when: new Date(state.decided[d.id].when) })).concat(DECIDED).sort((a, b) => b.when - a.when);
    return h`
      <div class="pp__head">
        <div><h2 class="pp__title">Decisions</h2><p class="pp__sub">What we need from you, and the day we need it by so nothing waits on site. Decisions you have made are kept below.</p></div>
        ${pending.length ? h`<span class="pill pill--due">${pending.length} waiting on you</span>` : h`<span class="pill pill--ok">All decided</span>`}
      </div>
      <div class="dec">
        ${pending.map((d) => h`<div class="dec__item dec__item--due">
          <div class="dec__head"><h3 class="dec__title">${esc(d.title)}</h3><span class="dec__due">Needed by <strong>${esc(fmtLong(d.due))}</strong> · ${dueWord(d.due)}</span></div>
          <p class="dec__text">${esc(d.text)}</p>
          <div class="dec__opts">${d.opts.map((o) => h`<button type="button" class="dec__opt" data-decide="${d.id}" data-opt="${o.k}"><strong>${esc(o.name)}</strong><span>${esc(o.note)}</span><em>${o.delta ? "+" + money(o.delta) : "No change to price"}</em></button>`).join("")}</div>
        </div>`).join("")}
        ${made.length ? h`<div class="card card--soft"><p class="card__title">Decided</p><ul class="plain">${made.map((m) => h`<li><div><strong>${esc(m.title)}</strong><br><span class="dec__done"><strong>✓</strong> ${esc(m.choice)}</span></div><span class="when"><strong>${esc(fmt(m.when))}</strong>decided</span></li>`).join("")}</ul></div>` : ""}
      </div>`;
  };

  VIEWS.documents = () => h`
    <div class="pp__head">
      <div><h2 class="pp__title">Contract &amp; changes</h2><p class="pp__sub">The signed contract, every change order with its price and what it does to the schedule, and the allowances with what has been spent against them.</p></div>
    </div>
    <div class="pp__grid">
      <div class="card card--12">
        <p class="card__title">Contract</p>
        <div class="doc">
          <div class="doc__row"><div><strong>Construction agreement — second-storey addition &amp; first-floor renovation</strong><small>Signed ${esc(fmt(CONTRACT.signed, { month: "long", day: "numeric", year: "numeric" }))} · 16-week schedule · fixed price with allowances</small></div><span class="doc__amt">${money(CONTRACT.total)}</span><div class="doc__actions"><button type="button" class="doc__btn" data-modal="contract">View</button></div></div>
        </div>
      </div>
      <div class="card card--12">
        <p class="card__title">Change orders</p>
        <div class="doc">
          ${CHANGES.map((c) => { const st = state.changes[c.id] || c.status; return h`<div class="doc__row"><div><strong>${esc(c.id)} · ${esc(c.title)}</strong><small>${st === "pending" ? "Waiting on your approval" : st === "declined" ? "Declined" : "Approved " + esc(fmt(c.when))} · ${esc(c.text.split(". ")[0])}.</small></div><span class="doc__amt">${st === "declined" ? "—" : "+" + money(c.amount)}</span><div class="doc__actions"><button type="button" class="doc__btn" data-modal="co:${c.id}">View</button>${st === "pending" ? h`<button type="button" class="doc__btn doc__btn--go" data-co="${c.id}" data-set="approved">Approve</button><button type="button" class="doc__btn" data-co="${c.id}" data-set="declined">Decline</button>` : h`<span class="pill ${st === "approved" ? "pill--ok" : ""}">${st}</span>`}</div></div>`; }).join("")}
        </div>
      </div>
      <div class="card card--12">
        <p class="card__title">Allowances <small>· what the contract sets aside for your selections, and what has been spent</small></p>
        <table class="tbl"><thead><tr><th>Allowance</th><th class="num">Allowed</th><th class="num">Spent</th><th class="num">Remaining</th></tr></thead><tbody>
          ${ALLOWANCES.map((a) => { const rem = a.allow - a.spent; return h`<tr><td>${esc(a.name)}${a.note ? h`<br><small style="color:var(--muted)">${esc(a.note)}</small>` : ""}<div class="bar"><i class="${rem < 0 ? "is-over" : ""}" style="width:${Math.min(100, 100 * a.spent / a.allow)}%"></i></div></td><td class="num">${money(a.allow)}</td><td class="num">${money(a.spent)}</td><td class="num" style="color:${rem < 0 ? "var(--accent)" : "inherit"}">${rem < 0 ? "−" + money(-rem) : money(rem)}</td></tr>`; }).join("")}
          <tr class="total"><td>Total</td><td class="num">${money(ALLOWANCES.reduce((s, a) => s + a.allow, 0))}</td><td class="num">${money(ALLOWANCES.reduce((s, a) => s + a.spent, 0))}</td><td class="num">${money(ALLOWANCES.reduce((s, a) => s + a.allow - a.spent, 0))}</td></tr>
        </tbody></table>
      </div>
    </div>`;

  VIEWS.invoices = () => h`
    <div class="pp__head">
      <div><h2 class="pp__title">Invoices &amp; receipts</h2><p class="pp__sub">Each invoice is tied to the milestone it covers. Receipts for materials bought for your job are linked to the invoice they fall under.</p></div>
    </div>
    <div class="pp__grid">
      <div class="card card--12">
        <p class="card__title">Payment schedule</p>
        <table class="tbl"><thead><tr><th>Invoice</th><th>Milestone</th><th>Due</th><th class="num">Amount</th><th></th></tr></thead><tbody>
          ${INVOICES.map((i) => { const st = state.paid[i.id] ? "paid" : i.status; return h`<tr><td>${esc(i.id)}</td><td>${esc(i.title)}</td><td>${esc(fmt(i.due, { month: "short", day: "numeric" }))}${st === "due" ? h` <small style="color:var(--accent)">${dueWord(i.due)}</small>` : ""}</td><td class="num">${money(i.amount)}</td><td style="text-align:right;white-space:nowrap">${st === "paid" ? h`<span class="pill pill--ok">Paid</span> <button type="button" class="doc__btn" data-modal="inv:${i.id}">Receipt</button>` : st === "due" ? h`<span class="pill pill--due">Due</span> <button type="button" class="doc__btn doc__btn--go" data-pay="${i.id}">Pay ${money(i.amount)}</button>` : h`<span class="pill">Scheduled</span>`}</td></tr>`; }).join("")}
          <tr class="total"><td colspan="3">Paid to date</td><td class="num">${money(paidTotal())}</td><td></td></tr>
        </tbody></table>
      </div>
      <div class="card card--12">
        <p class="card__title">Receipts on your job</p>
        <table class="tbl"><thead><tr><th>Receipt</th><th>Vendor</th><th>What</th><th>Date</th><th class="num">Amount</th><th></th></tr></thead><tbody>
          ${RECEIPTS.slice().sort((a, b) => b.when - a.when).map((r) => h`<tr><td>${esc(r.id)}</td><td>${esc(r.vendor)}</td><td>${esc(r.what)}<br><small style="color:var(--muted)">under ${esc(r.invoice)}</small></td><td>${esc(fmt(r.when, { month: "short", day: "numeric" }))}</td><td class="num">${money(r.amount)}</td><td style="text-align:right"><button type="button" class="doc__btn" data-modal="rcpt:${r.id}">View</button></td></tr>`).join("")}
        </tbody></table>
      </div>
    </div>`;

  VIEWS.photos = () => {
    const phases = [];
    PHOTOS.forEach((p, i) => { let g = phases.find((x) => x.name === p.phase); if (!g) { g = { name: p.phase, items: [] }; phases.push(g); } g.items.push(i); });
    return h`
      <div class="pp__head">
        <div><h2 class="pp__title">Photographs</h2><p class="pp__sub">Every photograph from the job, by phase. ${TAKEN} so far on this sample; the rest show what the later phases look like on a finished PSI job.</p></div>
      </div>
      ${phases.map((g) => h`<p class="ph__phase">${esc(g.name)}${g.items[0] >= TAKEN ? ' <span class="pill" style="margin-left:6px">Later phase</span>' : ""}</p><div class="ph__grid">${g.items.map((i) => h`<button type="button" data-photo="${i}" title="${esc(PHOTOS[i].cap)}"><img src="${PHOTOS[i].src}" alt="${esc(PHOTOS[i].cap)}" loading="lazy"></button>`).join("")}</div>`).join("")}`;
  };

  VIEWS.messages = () => {
    const all = MESSAGES.concat(state.messages.map((m) => ({ who: "You", when: new Date(m.when), text: m.text }))).sort((a, b) => a.when - b.when);
    return h`
      <div class="pp__head">
        <div><h2 class="pp__title">Messages</h2><p class="pp__sub">One thread for the whole job, with your project manager. Nothing lost in a text or an email.</p></div>
      </div>
      <div class="msg">${all.map((m) => h`<div class="msg__b ${m.who === "You" ? "msg__b--you" : ""}"><span class="msg__who">${esc(m.who)} · ${esc(fmt(m.when))}</span>${esc(m.text)}</div>`).join("")}</div>
      <form class="msg__form" id="msgForm"><input type="text" name="text" placeholder="Write a message to your project manager…" autocomplete="off" required><button type="submit">Send</button></form>`;
  };

  // ---------------- modal ----------------
  const modal = document.createElement("div");
  modal.className = "pmodal";
  modal.innerHTML = '<div class="pmodal__box" role="dialog" aria-modal="true"><button type="button" class="pmodal__close" aria-label="Close">&times;</button><div class="pmodal__body"></div></div>';
  document.body.appendChild(modal);
  const mbody = modal.querySelector(".pmodal__body");
  function openModal(html) { mbody.innerHTML = html; modal.classList.add("is-open"); modal.querySelector(".pmodal__close").focus(); }
  function closeModal() { modal.classList.remove("is-open"); }
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".pmodal__close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeLightbox(); } });

  function modalFor(key) {
    if (key === "contract") return h`<p class="pmodal__eyebrow">Contract</p><h3 class="pmodal__title">Construction agreement</h3>
      <dl class="pmodal__kv"><dt>Project</dt><dd>Second-storey addition and first-floor renovation (sample)</dd><dt>Signed</dt><dd>${esc(fmt(CONTRACT.signed, { month: "long", day: "numeric", year: "numeric" }))}</dd><dt>Contract price</dt><dd>${money(CONTRACT.total)} fixed, with the allowances listed</dd><dt>Schedule</dt><dd>16 working weeks from permit</dd><dt>Payments</dt><dd>Deposit, five progress payments at milestones, final on completion</dd></dl>
      <p><strong>Scope.</strong> Remove the existing roof; frame, sheathe, roof and side a full second storey with two bedrooms, a bathroom and a hall; extend electrical, plumbing and HVAC; insulate, drywall, tile, paint and floor the new level; renovate the first-floor bath and hall; all permits and inspections.</p>
      <p><strong>Changes.</strong> Any change to scope is priced as a change order and approved by you in this portal before the work is done.</p>
      <p><strong>Warranty.</strong> Two years on workmanship, manufacturers' warranties passed through.</p>`;
    if (key.startsWith("co:")) { const c = CHANGES.find((x) => x.id === key.slice(3)); const st = state.changes[c.id] || c.status; return h`<p class="pmodal__eyebrow">Change order</p><h3 class="pmodal__title">${esc(c.id)} · ${esc(c.title)}</h3>
      <dl class="pmodal__kv"><dt>Price</dt><dd>+${money(c.amount)}</dd><dt>Status</dt><dd><span class="pill ${st === "approved" ? "pill--ok" : st === "pending" ? "pill--due" : ""}">${st}</span></dd><dt>Raised</dt><dd>${esc(fmt(c.when))}</dd></dl><p>${esc(c.text)}</p>
      ${st === "pending" ? h`<div class="pmodal__foot"><button type="button" class="doc__btn" data-co="${c.id}" data-set="declined">Decline</button><button type="button" class="doc__btn doc__btn--go" data-co="${c.id}" data-set="approved">Approve this change</button></div>` : ""}`; }
    if (key.startsWith("inv:")) { const i = INVOICES.find((x) => x.id === key.slice(4)); const paidOn = i.paidOn || new Date(state.paid[i.id]); return h`<p class="pmodal__eyebrow">Receipt</p><h3 class="pmodal__title">${esc(i.id)} · ${esc(i.title)}</h3>
      <dl class="pmodal__kv"><dt>Amount</dt><dd>${money(i.amount)}</dd><dt>Paid</dt><dd>${esc(fmt(paidOn, { month: "long", day: "numeric", year: "numeric" }))}</dd><dt>Method</dt><dd>${esc(i.method || "Card (sample)")}</dd><dt>Applied to</dt><dd>Contract ${money(CONTRACT.total)} — balance after this payment ${money(CONTRACT.total + approvedChangesTotal() - INVOICES.filter((x) => (x.status === "paid" || state.paid[x.id]) && x.due <= i.due).reduce((s, x) => s + x.amount, 0))}</dd></dl>
      <p>Receipts for materials bought under this milestone are listed on the invoices page.</p>`; }
    if (key.startsWith("rcpt:")) { const r = RECEIPTS.find((x) => x.id === key.slice(5)); return h`<p class="pmodal__eyebrow">Receipt</p><h3 class="pmodal__title">${esc(r.vendor)}</h3>
      <dl class="pmodal__kv"><dt>Receipt</dt><dd>${esc(r.id)}</dd><dt>Date</dt><dd>${esc(fmt(r.when, { month: "long", day: "numeric", year: "numeric" }))}</dd><dt>Items</dt><dd>${esc(r.what)}</dd><dt>Amount</dt><dd>${money(r.amount)}</dd><dt>Filed under</dt><dd>${esc(r.invoice)}</dd></dl>
      <p>The original is scanned and attached on the real portal; this is the sample.</p>`; }
    return "";
  }

  // ---------------- lightbox (same chrome as the site's viewer) ----------------
  const viewer = document.createElement("div");
  viewer.className = "viewer";
  viewer.setAttribute("aria-hidden", "true");
  viewer.innerHTML = '<button class="viewer__close" data-vclose aria-label="Close">&times;</button><div class="viewer__head"><p class="viewer__eyebrow">Sample project</p><h2 class="viewer__title">Photographs</h2><p class="viewer__desc"></p></div><button class="viewer__arrow viewer__arrow--prev" data-vstep="-1" aria-label="Previous photo">&larr;</button><div class="viewer__rail"></div><button class="viewer__arrow viewer__arrow--next" data-vstep="1" aria-label="Next photo">&rarr;</button>';
  document.body.appendChild(viewer);
  const vRail = viewer.querySelector(".viewer__rail");
  let vPos = 0;
  function openLightbox(i) {
    vRail.innerHTML = PHOTOS.map((p) => h`<figure class="viewer__fig"><div class="viewer__imgwrap"><img src="${p.src}" alt="${esc(p.cap)}" loading="lazy"><span class="viewer__phase">${esc(p.phase)}</span><figcaption class="viewer__cap">${esc(p.cap)}</figcaption></div></figure>`).join("");
    viewer.classList.add("is-open"); viewer.setAttribute("aria-hidden", "false"); document.body.classList.add("viewer-lock");
    vPos = i; viewer.querySelector(".viewer__desc").textContent = (i + 1) + " of " + PHOTOS.length;
    requestAnimationFrame(() => { const f = vRail.children[vPos]; if (f) vRail.scrollLeft = Math.max(0, f.offsetLeft - 24); });
  }
  function closeLightbox() { viewer.classList.remove("is-open"); viewer.setAttribute("aria-hidden", "true"); document.body.classList.remove("viewer-lock"); }
  function stepLightbox(d) { vPos = ((vPos + d) % PHOTOS.length + PHOTOS.length) % PHOTOS.length; const f = vRail.children[vPos]; vRail.scrollTo({ left: Math.max(0, f.offsetLeft - 24), behavior: "smooth" }); viewer.querySelector(".viewer__desc").textContent = (vPos + 1) + " of " + PHOTOS.length; }
  viewer.addEventListener("click", (e) => { if (e.target.closest("[data-vclose]") || e.target === viewer) return closeLightbox(); const s = e.target.closest("[data-vstep]"); if (s) stepLightbox(+s.dataset.vstep); });
  document.addEventListener("keydown", (e) => { if (!viewer.classList.contains("is-open")) return; if (e.key === "ArrowRight") stepLightbox(1); if (e.key === "ArrowLeft") stepLightbox(-1); });

  // ---------------- render & events ----------------
  const tabs = document.querySelectorAll(".portal__tab");
  function badges() {
    const set = (k, n) => { const b = document.querySelector('[data-badge="' + k + '"]'); if (b) b.textContent = n ? String(n) : ""; };
    set("updates", UPDATES.length);
    set("decisions", pendingDecisions().length);
    set("documents", pendingChanges().length);
    set("invoices", dueInvoices().length);
  }
  function render() {
    const tab = VIEWS[state.tab] ? state.tab : "overview";
    tabs.forEach((t) => t.classList.toggle("is-on", t.dataset.tab === tab || (tab === "scope" && t.dataset.tab === "overview")));
    main.innerHTML = VIEWS[tab]();
    badges();
    save();
  }
  function go(tab) { state.tab = tab; render(); if (window.innerWidth < 860) main.scrollIntoView({ behavior: "smooth", block: "start" }); }
  tabs.forEach((t) => t.addEventListener("click", () => go(t.dataset.tab)));

  document.addEventListener("click", (e) => {
    const t = e.target;
    const tg = t.closest("[data-tab-go]"); if (tg) return go(tg.dataset.tabGo);
    const sg = t.closest("[data-go]"); if (sg) return go(sg.dataset.go);
    const ph = t.closest("[data-photo]"); if (ph) return openLightbox(+ph.dataset.photo);
    const wk = t.closest("[data-week]"); if (wk) { state.week = +wk.dataset.week; return render(); }
    const dec = t.closest("[data-decide]"); if (dec) { state.decided[dec.dataset.decide] = { k: dec.dataset.opt, when: Date.now() }; return render(); }
    const co = t.closest("[data-co]"); if (co) { state.changes[co.dataset.co] = co.dataset.set; closeModal(); return render(); }
    const pay = t.closest("[data-pay]"); if (pay) { state.paid[pay.dataset.pay] = Date.now(); render(); return openModal(modalFor("inv:" + pay.dataset.pay)); }
    const md = t.closest("[data-modal]"); if (md) return openModal(modalFor(md.dataset.modal));
  });
  document.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-task]"); if (!cb) return;
    const id = cb.dataset.task;
    if (cb.checked) { if (!isDone(id)) state.done.push(id); } else state.done = state.done.filter((x) => x !== id);
    render();
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("#msgForm"); if (!f) return;
    e.preventDefault();
    const text = f.text.value.trim(); if (!text) return;
    state.messages.push({ text, when: Date.now() });
    render();
  });
  const reset = document.getElementById("portalReset");
  if (reset) reset.addEventListener("click", () => { state = freshState(); render(); document.getElementById("portal").scrollIntoView({ behavior: "smooth", block: "start" }); });

  render();
})();
