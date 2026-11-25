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
    1: [[0, "Measured survey of the existing house", "done"], [1, "Drawings in progress (office)", "done"], [2, "Drawings in progress (office)", "done"], [3, "Drawings in progress (office)", "done"], [4, "Drawings issued for your review", "done"]],
    2: [[0, "Engineering review", "done"], [2, "Stamped drawings received", "done"], [2, "Permit application filed", "done"], [4, "Permit issued", "done"]],
    3: [[0, "Site set-up: fencing, dumpster, floor protection", "done"], [1, "Roof demolition", "done"], [2, "Roof demolition finished; temporary cover on", "done"], [3, "Lumber delivered 7am; floor system laid out", "done"], [4, "Floor joists hung on the new beam", "done"]],
    4: [[0, "Joists and blocking finished", "done"], [1, "Subfloor glued and screwed", "done"], [2, "Exterior walls framed and stood", "done"], [3, "Exterior walls finished; sheathing started", "done"], [4, "Sheathing and bracing", "done"]],
    5: [[0, "Interior partitions laid out and framed", "done"], [1, "Partitions finished; chimney detail", "done"], [2, "Rafters and ridge beam set", "done"], [3, "Framing inspection 10am", "insp"], [3, "Roof sheathing, rear slope", "done"], [4, "Roof sheathing, front slope", "done"]],
    6: [[0, "Roof sheathing finished; ridge vent cut in", "done"], [1, "Ice-and-water at the eaves; underlayment", "now"], [2, "Underlayment finished; shingles delivered 1pm", "now"], [3, "Shingles, rear slope", "up"], [4, "Shingles, front slope; ridge cap", "up"]],
    7: [[0, "Flashing, drip edge and gutters", "up"], [1, "House wrap and flashing tape", "up"], [2, "Windows delivered and set", "up"], [3, "Windows finished; exterior doors hung", "up"], [3, "Decision due: bathroom tile", "you"], [4, "Dry-in check; electrician walk-through", "up"]],
    8: [[0, "Electrical rough-in", "up"], [1, "Electrical rough-in; plumbing rough-in starts", "up"], [2, "Plumbing rough-in", "up"], [3, "HVAC extended to the new floor", "up"], [4, "Rough inspections (electrical, plumbing, mechanical)", "insp"], [4, "Decision due: interior doors & hardware", "you"]],
    9: [[0, "Insulation", "up"], [1, "Insulation and vapour barrier", "up"], [1, "Decision due: siding colour", "you"], [2, "Insulation inspection; drywall delivered", "insp"], [3, "Drywall hung", "up"], [4, "Drywall hung", "up"]],
    10: [[0, "Drywall finished; taping starts", "up"], [1, "Taping, first coat", "up"], [2, "Second coat", "up"], [3, "Sanding", "up"], [4, "Primer; siding delivered", "up"]],
    11: [[0, "Siding", "up"], [1, "Siding", "up"], [2, "Siding finished", "up"], [3, "Trim, soffit and fascia", "up"], [4, "Exterior trim paint; tile delivered", "up"]],
    12: [[0, "Bathroom waterproofing", "up"], [1, "Tile, main bath", "up"], [2, "Tile, main bath finished; second bath started", "up"], [3, "Tile, second bath", "up"], [4, "Grout and seal", "up"]],
    13: [[0, "Paint, bedrooms", "up"], [1, "Paint, hall and bathrooms", "up"], [2, "Paint finished; flooring delivered to acclimate", "up"], [3, "Flooring, bedrooms", "up"], [4, "Flooring, bedrooms finished", "up"]],
    14: [[0, "Flooring, hall and closets", "up"], [1, "Interior doors hung", "up"], [2, "Casing and base", "up"], [3, "Casing and base finished", "up"], [4, "Trim paint", "up"]],
    15: [[0, "Plumbing fixtures set", "up"], [1, "Lighting fixtures and devices", "up"], [2, "Built-in cabinetry", "up"], [3, "Built-in cabinetry finished; glass shower set", "up"], [4, "Final inspection", "insp"]],
    16: [[0, "Punch list", "up"], [1, "Punch list finished", "up"], [2, "Final clean", "up"], [3, "Walk-through with you", "you"]],
  };

  // ---------------- decisions ----------------
  const DECISIONS = [
    { id: "tile", title: "Bathroom tile selection", due: NEXT_THU, text: "Both upstairs bathrooms. The tile order takes ten working days, and tiling starts in week 12 — this is the last day we can order without moving the schedule. Samples are at the house, in the hall.",
      opts: [{ k: "a", name: "Carrara-look porcelain 12×24", note: "Within allowance", delta: 0 }, { k: "b", name: "Charcoal slate-look porcelain 12×24", note: "Within allowance", delta: 0 }, { k: "c", name: "Handmade-look white subway + hex floor", note: "Over allowance", delta: 1140 }] },
    { id: "doors", title: "Interior doors & hardware", due: FRI_2W, text: "Five doors on the new floor plus the hall closet. Ordered the Monday after this date, four-week lead time, hung in week 14. The hardware finish should match the bathroom fixtures you chose.",
      opts: [{ k: "a", name: "Two-panel shaker, white, satin nickel levers", note: "Within allowance", delta: 0 }, { k: "b", name: "Two-panel shaker, white, matte black levers", note: "Within allowance", delta: 0 }, { k: "c", name: "Solid-core five-panel, matte black levers", note: "Over allowance", delta: 1180 }] },
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
    { id: "CO-01", title: "Built-in bookcase, rear bedroom", amount: 3850, status: "approved", when: addDays(today, -20), text: "The Owner asked for a built-in bookcase on the rear bedroom's long wall in place of the plain painted wall in the contract.",
      scope: ["Build: solid poplar built-in, 8 ft wide, floor to ceiling, adjustable shelves on the upper two-thirds and closed cabinets below.", "Finish: primed and painted to match the trim colour selected for the house.", "Install: scribed to the wall and ceiling, fixed to the framing, caulked and touched up."], schedule: "Adds two working days to week 15 (fixtures and cabinetry). No other dates move." },
    { id: "CO-02", title: "Frameless glass shower, main bath", amount: 2400, status: "approved", when: addDays(today, -9), text: "The contract carries a framed sliding shower door. The Owner has chosen a frameless glass enclosure instead.",
      scope: ["Supply: 3/8 in. clear tempered glass panel and door, brushed nickel hinges and handle to match the fixtures.", "Prepare: tile returns and curb finished square and plumb to take the glass.", "Install: templated after tiling, set and sealed; the framed door is deleted from the contract."], schedule: "No change. The glass is templated in week 13 and set in week 15." },
    { id: "CO-03", title: "Relocate laundry to the new floor", amount: 6900, status: "pending", when: addDays(today, -2), text: "The Owner asked whether the laundry could move from the basement to the new floor. It can, in the hall closet, if the rough-in is done before the walls close.",
      scope: ["Plumbing: hot and cold supply and a 2 in. drain with standpipe run to the hall closet, tied into the new bathroom stack.", "Electrical: one dedicated 30 A dryer circuit and one 20 A washer circuit from the panel.", "Venting: 4 in. rigid dryer vent through the rear wall with a hooded cap.", "Finish: closet floor pan, bifold doors deleted and replaced with a pair of louvered doors; washer and dryer supplied by the Owner."], schedule: "Adds one working day to week 8 (rough-ins) and one to week 15 (fixtures). Must be signed before the plumbing rough-in on Wednesday of week 8." },
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

  // ---------------- who is on the paper ----------------
  // Office address as published on the site. The homeowner is made up.
  const PSI = { name: "PSI Construction, LLC", lines: ["190 Wyoming St.", "Wilkes-Barre, PA 18705", "(570) 338-8774", "PA HIC Reg. #213035"], phone: "(570) 338-8774", web: "www.psiconstructionpa.com", email: "info@psiconstructionpa.com" };
  const OWNER = { name: "Sample Client", lines: ["Sample project address", "Kingston, PA 18704"] };
  const PROJECT = "Second-storey addition & first-floor renovation";

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
    return { done: Array.from(DONE_AT_START), decided: {}, changes: {}, signatures: {}, paid: {}, messages: [], tab: "overview", week: CUR_WEEK };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.done) { s.signatures = s.signatures || {}; return s; } } catch (e) { /* fine */ }
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
            ${co ? h`<li><div><strong>Sign Change Order No. ${CHANGES.indexOf(co) + 1}: ${esc(co.title)}</strong><br><small>${money(co.amount)} · <button type="button" class="linklike" data-modal="co:${co.id}">review &amp; sign</button></small></div><span class="when"><strong>Before week 8</strong>rough-ins</span></li>` : ""}
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
          <p class="card__title">Next three days on site</p>
          ${renderDays(3)}
          <p class="card__link"><button type="button" data-tab-go="schedule">Full 16-week schedule &rarr;</button></p>
        </div>
        <div class="card card--4">
          <p class="card__title">Money</p>
          <ul class="plain">
            <li><span>Contract</span><span class="doc__amt">${money(CONTRACT.total)}</span></li>
            <li><span>Signed change orders</span><span class="doc__amt">+${money(approvedChangesTotal())}</span></li>
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

  // Today and the next working days, each with everything planned for it.
  function renderDays(count) {
    const days = [];
    let d = today;
    while (days.length < count) { if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d); d = addDays(d, 1); }
    return h`<div class="sch__week sch__week--${count}">${days.map((date) => {
      const week = weekOf(date), di = Math.round((date - monday(date)) / DAY);
      const items = (SCHEDULE[week] || []).filter((it) => it[0] === di);
      const cls = date.getTime() === today.getTime() ? "is-today" : "";
      return h`<div class="sch__day ${cls}"><p class="sch__dayname">${esc(fmt(date, { weekday: "long" }))}<b>${esc(fmt(date, { month: "short", day: "numeric" }))}</b></p>${items.length ? items.map((it) => h`<p class="sch__item ${kind(it[2])}">${esc(it[1])}</p>`).join("") : '<p class="sch__none">No work scheduled</p>'}</div>`;
    }).join("")}</div>`;
  }
  const kind = (k) => k === "done" ? "sch__item--done" : k === "insp" ? "sch__item--insp" : k === "you" ? "sch__item--you" : k === "up" ? "sch__item--up" : "";

  function renderWeek(week, compact) {
    const mon = addDays(START, (week - 1) * 7);
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const items = SCHEDULE[week] || [];
    return h`<div class="sch__week">${names.map((n, d) => {
      const date = addDays(mon, d);
      const cls = date.getTime() === today.getTime() ? "is-today" : date < today ? "is-past" : "";
      return h`<div class="sch__day ${cls}"><p class="sch__dayname">${n}<b>${date.getDate()}</b></p>${items.filter((it) => it[0] === d).map((it) => h`<p class="sch__item ${kind(it[2])}">${esc(it[1])}</p>`).join("")}</div>`;
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
          ${CHANGES.map((c, n) => { const st = state.changes[c.id] || c.status; return h`<div class="doc__row"><div><strong>No. ${n + 1} · ${esc(c.title)}</strong><small>${st === "pending" ? "Waiting on your signature" : st === "declined" ? "Declined" : "Signed " + esc(fmt(state.signatures[c.id] ? new Date(state.signatures[c.id].when) : c.when))} · ${money2(c.amount)}</small></div><span class="doc__amt">${st === "declined" ? "—" : "+" + money2(c.amount)}</span><div class="doc__actions">${st === "pending" ? h`<button type="button" class="doc__btn doc__btn--go" data-modal="co:${c.id}">Review &amp; sign</button>` : h`<span class="pill ${st === "approved" ? "pill--ok" : ""}">${st === "approved" ? "Signed" : "Declined"}</span><button type="button" class="doc__btn" data-modal="co:${c.id}">View</button>`}</div></div>`; }).join("")}
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

  const money2 = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isPaid = (i) => i.status === "paid" || !!state.paid[i.id];
  const paidDate = (i) => i.paidOn || new Date(state.paid[i.id]);
  const contractValue = () => CONTRACT.total + approvedChangesTotal();

  VIEWS.invoices = () => {
    const total = contractValue(), paid = paidTotal(), pctPaid = Math.round(100 * paid / total);
    return h`
    <div class="pp__head">
      <div><h2 class="pp__title">Invoices &amp; receipts</h2><p class="pp__sub">Each invoice is tied to the milestone it covers. Every payment gets a receipt. Open either, or print it.</p></div>
    </div>
    <div class="pay__summary">
      <div class="pay__figs">
        <div><span>Contract</span><strong>${money2(total)}</strong></div>
        <div><span>Paid</span><strong class="is-paid">${money2(paid)}</strong></div>
        <div><span>Balance</span><strong>${money2(total - paid)}</strong></div>
      </div>
      <div class="pay__bar"><i style="width:${pctPaid}%"></i></div>
      <p class="pay__pct">${pctPaid}% paid</p>
    </div>
    <div class="pay__list">
      <p class="pay__list-head">Payment schedule</p>
      ${INVOICES.map((i) => { const st = isPaid(i) ? "paid" : i.status; return h`<div class="pay__row">
        <div class="pay__row-main">
          <strong>${esc(i.title)}</strong>
          <small>${st === "paid" ? "Paid " + esc(fmt(paidDate(i), { month: "short", day: "numeric" })) : st === "due" ? "Due " + esc(fmtLong(i.due)) + " · " + dueWord(i.due) : "Due " + esc(fmtLong(i.due))}</small>
          <div class="pay__links">${st === "paid" ? h`<button type="button" class="linklike" data-modal="inv:${i.id}">Invoice</button><button type="button" class="linklike" data-modal="rcpt:${i.id}">Receipt</button>` : st === "due" ? h`<button type="button" class="linklike" data-modal="inv:${i.id}">Invoice</button><button type="button" class="doc__btn doc__btn--go" data-pay="${i.id}">Pay ${money2(i.amount)}</button>` : ""}</div>
        </div>
        <div class="pay__row-side"><strong>${money2(i.amount)}</strong>${st === "paid" ? '<span class="pill pill--ok">Paid</span>' : st === "due" ? '<span class="pill pill--due">Due</span>' : ""}</div>
      </div>`; }).join("")}
    </div>
    <p class="pay__note">Payment may be made by ACH, wire transfer, Zelle, check (payable to PSI Construction, LLC) or cash with a written receipt. Questions? Call ${esc(PSI.phone)}.</p>
    <div class="pay__list" style="margin-top:22px">
      <p class="pay__list-head">Materials bought for your job</p>
      ${RECEIPTS.slice().sort((a, b) => b.when - a.when).map((r) => h`<div class="pay__row">
        <div class="pay__row-main"><strong>${esc(r.vendor)} — ${esc(r.what)}</strong><small>${esc(fmt(r.when, { month: "short", day: "numeric" }))} · filed under ${esc(r.invoice)}</small><div class="pay__links"><button type="button" class="linklike" data-modal="mat:${r.id}">Receipt</button></div></div>
        <div class="pay__row-side"><strong>${money2(r.amount)}</strong></div>
      </div>`).join("")}
    </div>`;
  };

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
  function openModal(html) { mbody.innerHTML = html; modal.querySelector(".pmodal__box").classList.toggle("pmodal__box--paper", html.indexOf('class="paper"') >= 0); modal.classList.add("is-open"); modal.scrollTop = 0; modal.querySelector(".pmodal__box").scrollTop = 0; modal.querySelector(".pmodal__close").focus(); armSigPad(); }
  function closeModal() { modal.classList.remove("is-open"); }
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".pmodal__close")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeLightbox(); } });

  // Paper documents, laid out like the ones PSI's own portal issues.
  const docHead = () => h`<div class="paper__head"><img src="assets/logo/psi-logo.png" alt="PSI Construction" width="900" height="456"><div class="paper__co"><strong>${esc(PSI.name)}</strong><span>Pennsylvania</span><span>${esc(PSI.phone)}</span><span>${esc(PSI.web)}</span></div></div>`;
  const docParties = (rightLabel) => h`<div class="paper__parties"><div><p class="paper__lbl">From</p><strong>${esc(PSI.name)}</strong>${PSI.lines.map((l) => h`<span>${esc(l)}</span>`).join("")}</div><div><p class="paper__lbl">${rightLabel}</p><strong>${esc(OWNER.name)}</strong>${OWNER.lines.map((l) => h`<span>${esc(l)}</span>`).join("")}</div></div>`;
  const docFoot = (ref) => h`<p class="paper__thanks">Thank you for your business.</p><p class="paper__foot">${esc(PSI.name)} · PA HIC Reg. #213035 · ${esc(ref)} · ${esc(PROJECT)}</p>`;
  const printBtn = () => '<button type="button" class="doc__btn doc__btn--dark" data-print>Print / Save PDF</button>';
  const paidBefore = (i) => INVOICES.filter((x) => isPaid(x) && x.due < i.due).reduce((a, x) => a + x.amount, 0);
  const schedNote = (i) => INVOICES.filter((x) => x.due > i.due).map((x) => esc(x.title) + " " + money2(x.amount)).join("; ");

  function modalFor(key) {
    if (key === "contract") return h`<div class="paper">${docHead()}<div class="paper__body"><h3 class="paper__title">Home Improvement Contract</h3>
      <div class="paper__meta"><div><p class="paper__lbl">Contract date</p>${esc(fmt(CONTRACT.signed, { month: "numeric", day: "numeric", year: "numeric" }))}</div><div><p class="paper__lbl">Contract price</p>${money2(CONTRACT.total)}</div><div><p class="paper__lbl">Schedule</p>16 working weeks</div><div><p class="paper__lbl">Project</p>${esc(PROJECT)}</div></div>
      ${docParties("Owner")}
      <p class="paper__sec">Scope of work</p>
      <p>Remove the existing roof; frame, sheathe, roof and side a full second storey with two bedrooms, a bathroom and a hall; extend electrical, plumbing and HVAC; insulate, drywall, tile, paint and floor the new level; renovate the first-floor bath and hall; all permits and inspections.</p>
      <p class="paper__sec">Price and payment</p>
      <p>Fixed price of ${money2(CONTRACT.total)} with the allowances listed in the portal. Deposit on signing, five progress payments at milestones, final on completion. Any change to scope is priced as a change order and signed by the Owner before the work is done.</p>
      <p class="paper__sec">Warranty</p>
      <p>Two years on workmanship; manufacturers' warranties passed through.</p>
      <div class="paper__sign"><div><p class="paper__lbl">Owner</p><div class="paper__sigline paper__sigline--script">Sample Client</div><span>${esc(OWNER.name)}</span><small>Signed · ${esc(fmt(CONTRACT.signed, { month: "long", day: "numeric", year: "numeric" }))}</small></div><div><p class="paper__lbl">PSI Construction, LLC</p><div class="paper__sigline paper__sigline--script">PSI Construction</div><span>PSI Construction, LLC</span><small>${esc(fmt(CONTRACT.signed, { month: "long", day: "numeric", year: "numeric" }))}</small></div></div>
      ${docFoot("Contract")}</div></div><div class="pmodal__foot">${printBtn()}</div>`;

    if (key.startsWith("co:")) {
      const c = CHANGES.find((x) => x.id === key.slice(3)); const n = CHANGES.indexOf(c) + 1; const st = state.changes[c.id] || c.status;
      const sig = state.signatures[c.id]; const when = sig ? new Date(sig.when) : c.when;
      const prev = CONTRACT.total + CHANGES.slice(0, n - 1).reduce((a, x) => a + ((x.status === "approved" || state.changes[x.id] === "approved") ? x.amount : 0), 0);
      return h`<div class="paper">${docHead()}<div class="paper__body">
      ${st === "approved" ? h`<div class="paper__banner">✓ <strong>Signed — thank you.</strong> This is your signed change order. You can come back to it any time, or print a copy.</div>` : ""}
      <h3 class="paper__title paper__title--c">Change Order No. ${n}</h3><p class="paper__subtitle">${esc(c.title)}</p><p class="paper__dateline">${esc(PROJECT)} | ${esc(fmt(c.when, { month: "long", day: "numeric", year: "numeric" }))}</p>
      <div class="paper__box"><p class="paper__box-head">Parties to the Agreement</p><div class="paper__cols"><div><p class="paper__colhead">Owner</p>Name: ${esc(OWNER.name)}<br>Project address: ${esc(OWNER.lines[0])}<br>City, State, ZIP: ${esc(OWNER.lines[1])}</div><div><p class="paper__colhead">Contractor</p>Company: ${esc(PSI.name)}<br>PA HIC Reg. #: PA-213035<br>Address: ${esc(PSI.lines[0])}, ${esc(PSI.lines[1])}<br>Phone: ${esc(PSI.phone)}<br>Email: ${esc(PSI.email)}</div></div></div>
      <p>This change order adds to the Home Improvement Contract dated ${esc(fmt(CONTRACT.signed, { month: "long", day: "numeric", year: "numeric" }))}. ${esc(c.text)}</p>
      <div class="paper__box"><p class="paper__box-head">Scope of Work</p><div class="paper__box-body"><div class="paper__item"><strong>1. ${esc(c.title)}</strong><strong>${money2(c.amount)}</strong></div><ul class="paper__ul">${c.scope.map((x) => h`<li>${esc(x)}</li>`).join("")}</ul></div></div>
      <div class="paper__box"><p class="paper__box-head">Price and Payment</p><div class="paper__box-body"><p>Change Order No. ${n} — ${esc(c.title.toLowerCase())}: ${money2(c.amount)}<br>Previous contract price: ${money2(prev)}<br>Revised contract price: ${money2(prev + c.amount)}</p><p>The ${money2(c.amount)} is a fixed price and is invoiced with the next progress payment. Payment may be made by ACH, wire transfer, Zelle, check (payable to PSI Construction, LLC) or cash with a written receipt.</p></div></div>
      <div class="paper__box"><p class="paper__box-head">Terms</p><div class="paper__box-body"><p>1. Agreement. This change order is part of the Home Improvement Contract dated ${esc(fmt(CONTRACT.signed, { month: "long", day: "numeric", year: "numeric" }))}. All terms and conditions of that contract, including the Owner's right of rescission, apply to this change order. Nothing else in that contract changes.</p><p>2. Schedule. ${esc(c.schedule)}</p></div></div>
      <div class="paper__box"><p class="paper__box-head">Price</p><div class="paper__box-body"><div class="paper__item"><span>Item 1 (fixed)</span><span>${money2(c.amount)}</span></div><div class="paper__item paper__item--total"><strong>Change Order No. ${n} total</strong><strong>${money2(c.amount)}</strong></div></div></div>
      <div class="paper__box"><p class="paper__box-head">Acceptance and Signatures</p><div class="paper__box-body"><p>By signing below, the Owner approves Change Order No. ${n} and the scope above.</p>
        <div class="paper__sign">
          <div><p class="paper__lbl">Owner</p>${st === "approved" ? (sig ? h`<div class="paper__sigline"><img src="${sig.data}" alt="Owner signature"></div>` : h`<div class="paper__sigline paper__sigline--script">Sample Client</div>`) : st === "declined" ? h`<div class="paper__sigline"><em>Declined</em></div>` : h`<div class="sigpad"><canvas id="sigPad" width="520" height="150" aria-label="Sign here"></canvas><p class="sigpad__hint">Sign here with your mouse or finger</p></div>`}<span>${esc(OWNER.name)}</span><small>${st === "approved" ? "Signed in the portal · " + esc(fmt(when, { month: "long", day: "numeric", year: "numeric" })) : ""}</small></div>
          <div><p class="paper__lbl">PSI Construction, LLC</p><div class="paper__sigline paper__sigline--script">PSI Construction</div><span>PSI Construction, LLC</span><small>${esc(fmt(c.when, { month: "long", day: "numeric", year: "numeric" }))}</small></div>
        </div>
        ${st === "pending" ? h`<div class="pmodal__foot pmodal__foot--left"><button type="button" class="doc__btn" data-sig-clear>Clear</button><button type="button" class="doc__btn" data-co="${c.id}" data-set="declined">Decline</button><button type="button" class="doc__btn doc__btn--go" data-sign="${c.id}">Sign and approve</button></div>` : ""}
      </div></div>
      ${docFoot("Change Order No. " + n)}</div></div><div class="pmodal__foot">${printBtn()}</div>`;
    }

    if (key.startsWith("inv:")) {
      const i = INVOICES.find((x) => x.id === key.slice(4)); const paid = isPaid(i); const num = INVOICES.indexOf(i) + 1;
      const invDate = addDays(i.due, -7), total = contractValue();
      return h`<div class="paper">${docHead()}<div class="paper__body"><div class="paper__titlerow"><h3 class="paper__title">Invoice</h3>${paid ? '<span class="paper__stamp">✓ Paid</span>' : ""}</div>
      <div class="paper__meta"><div><p class="paper__lbl">Invoice number</p>INV-2026-${String(num).padStart(3, "0")}</div><div><p class="paper__lbl">Invoice date</p>${esc(fmt(invDate, { month: "numeric", day: "numeric", year: "numeric" }))}</div><div><p class="paper__lbl">Due date</p>${esc(fmt(i.due, { month: "numeric", day: "numeric", year: "numeric" }))}</div><div><p class="paper__lbl">Project</p>${esc(PROJECT)}</div></div>
      ${docParties("Bill to")}
      <p class="paper__sec">Charges</p>
      <table class="paper__tbl"><thead><tr><th>#</th><th>Description</th><th class="num">Amount</th></tr></thead><tbody><tr><td>1</td><td>${esc(PROJECT)} – ${esc(i.title)}<br><em>Total contract price: ${money2(total)} | Paid to date: ${money2(paidBefore(i))}</em></td><td class="num">${money2(i.amount)}</td></tr></tbody></table>
      <div class="paper__totals"><div><span>Subtotal</span><span>${money2(i.amount)}</span></div><div class="paper__due"><span>Total due</span><span>${money2(i.amount)}</span></div></div>
      <p class="paper__sec">Notes</p>
      <p class="paper__small">This payment is due ${i.status === "paid" || i.id === "INV-1001" ? "upon receipt" : "by " + esc(fmt(i.due, { month: "numeric", day: "numeric", year: "numeric" }))}. ${schedNote(i) ? "The remaining balance of " + money2(total - paidBefore(i) - i.amount) + " will be invoiced per the contract payment schedule: " + schedNote(i) + "." : "This is the final payment under the contract."}</p>
      <p class="paper__sec">How to pay</p>
      <p><strong>Payment methods:</strong> ACH, wire transfer, Zelle, check, or cash.</p>
      <div class="paper__pay"><div><p class="paper__colhead">ACH &amp; wire transfer</p><p class="paper__lbl">Bank</p>Sample Bank, N.A.<p class="paper__lbl">Account name</p>${esc(PSI.name)}<p class="paper__lbl">Routing / account</p>Shown on your real invoice</div><div><p class="paper__colhead">Zelle</p><p class="paper__lbl">Recipient</p>${esc(PSI.name)}<p class="paper__lbl">Zelle tag</p>Shown on your real invoice</div><div><p class="paper__colhead">Check &amp; cash</p><p class="paper__lbl">Checks payable to</p>${esc(PSI.name)}<p class="paper__lbl">Mail / deliver to</p>${esc(PSI.lines[0])}, ${esc(PSI.lines[1])}<p class="paper__lbl">Cash</p>Accepted in person — a written receipt is provided</div></div>
      <p><strong>All payments payable to PSI Construction, LLC.</strong></p>
      <p class="paper__small">Please reference Invoice #INV-2026-${String(num).padStart(3, "0")} with your payment. Questions about payment? Call ${esc(PSI.phone)}.</p>
      ${docFoot("Invoice #INV-2026-" + String(num).padStart(3, "0"))}</div></div><div class="pmodal__foot">${paid ? h`<button type="button" class="doc__btn" data-modal="rcpt:${i.id}">View receipt</button>` : h`<button type="button" class="doc__btn doc__btn--go" data-pay="${i.id}">Pay ${money2(i.amount)}</button>`}${printBtn()}</div>`;
    }

    if (key.startsWith("rcpt:")) {
      const i = INVOICES.find((x) => x.id === key.slice(5)); const num = INVOICES.indexOf(i) + 1; const total = contractValue();
      const paidAll = paidTotal(), when = paidDate(i);
      return h`<div class="paper">${docHead()}<div class="paper__body"><div class="paper__titlerow"><h3 class="paper__title">Receipt</h3><span class="paper__stamp">✓ Paid</span></div>
      <div class="paper__meta"><div><p class="paper__lbl">Receipt number</p>REC-2026-${String(num).padStart(3, "0")}</div><div><p class="paper__lbl">Payment date</p>${esc(fmt(when, { month: "numeric", day: "numeric", year: "numeric" }))}</div><div><p class="paper__lbl">Payment method</p>${esc(i.method || "Card (sample)")}</div><div><p class="paper__lbl">Project</p>${esc(PROJECT)}</div></div>
      ${docParties("Received from")}
      <p class="paper__sec">Payment</p>
      <table class="paper__tbl"><thead><tr><th>#</th><th>Description</th><th class="num">Amount</th></tr></thead><tbody><tr><td>1</td><td>Payment – ${esc(PROJECT)} – ${esc(i.title)}<br><em>Total contract price: ${money2(total)} | Paid to date: ${money2(paidBefore(i))}</em></td><td class="num">${money2(i.amount)}</td></tr></tbody></table>
      <div class="paper__totals"><div><span>Subtotal</span><span>${money2(i.amount)}</span></div><div class="paper__paid"><span>Amount paid</span><span>${money2(i.amount)}</span></div><div class="paper__rem"><span>Remaining balance</span><span>${money2(total - paidAll)}</span></div></div>
      <p class="paper__sec">Notes</p>
      <p class="paper__small">Payment received for ${esc(i.title)} (Invoice #INV-2026-${String(num).padStart(3, "0")}). Contract total ${money2(total)}; paid to date ${money2(paidAll)}; remaining balance ${money2(total - paidAll)}.</p>
      <p class="paper__sec">Payment summary</p>
      <table class="paper__tbl paper__tbl--sum"><thead><tr><th>Payment</th><th>Status</th><th class="num">Amount</th></tr></thead><tbody>
        ${INVOICES.map((x) => h`<tr class="${x.id === i.id ? "is-this" : ""}"><td>${esc(x.title)}</td><td>${isPaid(x) ? "Paid " + esc(fmt(paidDate(x), { month: "numeric", day: "numeric", year: "numeric" })) + (x.id === i.id ? " — this receipt" : "") : "Upcoming"}</td><td class="num">${money2(x.amount)}</td></tr>`).join("")}
        <tr class="is-total"><td>Contract total</td><td>Paid to date ${money2(paidAll)}</td><td class="num">${money2(total)}</td></tr>
      </tbody></table>
      <p><strong>Paid by:</strong> ${esc(i.method || "Card (sample)")}</p>
      <p class="paper__small">This receipt confirms payment received by PSI Construction, LLC for Invoice #INV-2026-${String(num).padStart(3, "0")}.</p>
      ${docFoot("Receipt #REC-2026-" + String(num).padStart(3, "0"))}</div></div><div class="pmodal__foot"><button type="button" class="doc__btn" data-modal="inv:${i.id}">View invoice</button>${printBtn()}</div>`;
    }

    if (key.startsWith("mat:")) {
      const r = RECEIPTS.find((x) => x.id === key.slice(4));
      return h`<div class="paper">${docHead()}<div class="paper__body"><div class="paper__titlerow"><h3 class="paper__title">Materials receipt</h3><span class="paper__stamp">✓ Paid by PSI</span></div>
      <div class="paper__meta"><div><p class="paper__lbl">Receipt</p>${esc(r.id)}</div><div><p class="paper__lbl">Date</p>${esc(fmt(r.when, { month: "numeric", day: "numeric", year: "numeric" }))}</div><div><p class="paper__lbl">Vendor</p>${esc(r.vendor)}</div><div><p class="paper__lbl">Filed under</p>${esc(r.invoice)}</div></div>
      <p class="paper__sec">Items</p>
      <table class="paper__tbl"><thead><tr><th>#</th><th>Description</th><th class="num">Amount</th></tr></thead><tbody><tr><td>1</td><td>${esc(r.what)}<br><em>Bought by PSI for ${esc(PROJECT)}; covered by the contract price</em></td><td class="num">${money2(r.amount)}</td></tr></tbody></table>
      <div class="paper__totals"><div class="paper__paid"><span>Amount paid</span><span>${money2(r.amount)}</span></div></div>
      <p class="paper__small">On the real portal the vendor's original receipt is attached here as a scan.</p>
      ${docFoot("Receipt " + r.id)}</div></div><div class="pmodal__foot">${printBtn()}</div>`;
    }
    return "";
  }

  // ---------------- signature pad ----------------
  function armSigPad() {
    const c = document.getElementById("sigPad"); if (!c) return;
    const ctx = c.getContext("2d"); ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#c00000";
    let drawing = false, drew = false;
    const pos = (e) => { const r = c.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return [(p.clientX - r.left) * c.width / r.width, (p.clientY - r.top) * c.height / r.height]; };
    const start = (e) => { drawing = true; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); e.preventDefault(); };
    const move = (e) => { if (!drawing) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); drew = true; c.dataset.drawn = "1"; e.preventDefault(); };
    const end = () => { drawing = false; };
    c.addEventListener("mousedown", start); c.addEventListener("mousemove", move); window.addEventListener("mouseup", end);
    c.addEventListener("touchstart", start, { passive: false }); c.addEventListener("touchmove", move, { passive: false }); c.addEventListener("touchend", end);
    c.clearPad = () => { ctx.clearRect(0, 0, c.width, c.height); drew = false; c.dataset.drawn = ""; };
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
    const sn = t.closest("[data-sign]"); if (sn) {
      const pad = document.getElementById("sigPad");
      if (!pad || !pad.dataset.drawn) { const hint = document.querySelector(".sigpad__hint"); if (hint) { hint.textContent = "Please sign in the box first."; hint.classList.add("is-warn"); } return; }
      state.signatures[sn.dataset.sign] = { data: pad.toDataURL("image/png"), when: Date.now() };
      state.changes[sn.dataset.sign] = "approved"; render(); return openModal(modalFor("co:" + sn.dataset.sign));
    }
    if (t.closest("[data-sig-clear]")) { const pad = document.getElementById("sigPad"); if (pad && pad.clearPad) pad.clearPad(); return; }
    if (t.closest("[data-print]")) return window.print();
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
