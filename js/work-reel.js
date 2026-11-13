/* ============================================================
   Work reel — every photograph from our documented jobs, in one
   horizontal strip at the foot of each service page.

   Every slide is the same height; a landscape shot simply runs wider.
   The slide nearest the middle is full size and the ones either side
   shrink and dim with distance, so one photograph is always "the one"
   and its neighbours peek in from the edges. The strip is an ordinary
   scroll container with snap points, so on a phone it feels like
   flicking through a stack of prints, and the browser does the physics.

   Tapping the middle photograph opens that whole job in the full-screen
   viewer (same look as the viewer on the home page). Tapping a
   neighbour just brings it to the middle.

   Data comes from data/work-reel.js (generated from data/projects.js by
   tools/build-work-reel.py). No client address is in it.
   ============================================================ */
(function () {
  "use strict";
  const root = document.getElementById("workReel");
  const D = window.PSI_REEL;
  if (!root || !D || !D.photos || !D.photos.length) return;

  const projects = D.projects;
  const label = (pi) => projects[pi].title || "Previous project";

  // ---- order: this page's own kind of work first, then everything else ----
  // data-lead carries project ids; the rest keep their file order.
  const lead = (root.dataset.lead || "").split(",").map((s) => s.trim()).filter(Boolean);
  const rank = (pi) => {
    const k = lead.indexOf(projects[pi].id);
    return k < 0 ? lead.length : k;
  };
  const order = D.photos.map((_, k) => k)
    .sort((a, b) => rank(D.photos[a][0]) - rank(D.photos[b][0]) || a - b);

  // ---- markup ----
  root.classList.add("reel");
  root.innerHTML = `
    <div class="reel__rail" tabindex="0" aria-label="Photographs from our jobs — scroll sideways"></div>
    <button class="reel__arrow reel__arrow--prev" data-step="-1" aria-label="Previous photo">&larr;</button>
    <button class="reel__arrow reel__arrow--next" data-step="1" aria-label="Next photo">&rarr;</button>
    <div class="reel__foot">
      <p class="reel__cap"><strong class="reel__job"></strong><span class="reel__text"></span></p>
      <p class="reel__meta"><span class="reel__count"></span><button type="button" class="reel__open" data-open>See this job &rarr;</button></p>
    </div>`;
  const rail = root.querySelector(".reel__rail");
  const capJob = root.querySelector(".reel__job");
  const capText = root.querySelector(".reel__text");
  const count = root.querySelector(".reel__count");

  // Slides are sized from the photograph's pixel ratio, so the strip has its
  // final layout before a single image has loaded and nothing shifts.
  const slides = order.map((k, n) => {
    const ph = D.photos[k];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "reel__slide";
    b.dataset.n = n;
    b.style.setProperty("--ar", ph[2] + " / " + ph[3]);
    b.innerHTML = `<img src="${D.dir}${ph[1]}" alt="${(ph[5] || label(ph[0])).replace(/"/g, "&quot;")}" `
      + `loading="${n < 6 ? "eager" : "lazy"}" decoding="async" width="${ph[2]}" height="${ph[3]}">`
      + (ph[4] ? `<span class="reel__phase reel__phase--${ph[4]}">${ph[4]}</span>` : "");
    rail.appendChild(b);
    return b;
  });
  const N = slides.length;
  const photoAt = (n) => D.photos[order[n]];

  // ---- geometry ----
  // Centres are measured once per layout and reused on every scroll frame:
  // 292 getBoundingClientRect calls a frame would be the one thing that could
  // make this stutter on a phone.
  let centres = [];
  let railW = 0;
  function measure() {
    railW = rail.clientWidth;
    // Pad the ends so the first and last photograph can sit in the middle.
    const first = slides[0].offsetWidth;
    const last = slides[N - 1].offsetWidth;
    rail.style.paddingLeft = Math.max(0, (railW - first) / 2) + "px";
    rail.style.paddingRight = Math.max(0, (railW - last) / 2) + "px";
    centres = slides.map((s) => s.offsetLeft + s.offsetWidth / 2);
  }

  // Scale and dim by distance from the middle. Everything within a viewport
  // width is updated each frame; anything further sits at the resting size.
  let current = -1;
  let frame = 0;
  const FAR = 0.78;      // resting scale at one viewport-width away
  function paint() {
    frame = 0;
    if (!railW) return;
    const mid = rail.scrollLeft + railW / 2;
    let best = 0, bestD = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(centres[i] - mid);
      if (d < bestD) { bestD = d; best = i; }
      const t = Math.min(1, d / railW);          // 0 in the middle … 1 a screen away
      const s = slides[i];
      if (t >= 1) {
        if (s.dataset.far !== "1") { s.dataset.far = "1"; s.style.transform = ""; s.style.opacity = ""; }
        continue;
      }
      s.dataset.far = "0";
      const ease = 1 - Math.pow(1 - t, 2);        // settle quickly away from the middle
      s.style.transform = "scale(" + (1 - (1 - FAR) * ease).toFixed(4) + ")";
      s.style.opacity = (1 - 0.45 * ease).toFixed(3);
    }
    if (best !== current) {
      if (current >= 0) slides[current].classList.remove("is-on");
      current = best;
      slides[best].classList.add("is-on");
      const ph = photoAt(best);
      capJob.textContent = label(ph[0]);
      capText.textContent = ph[5] || "";
      count.textContent = (best + 1) + " / " + N;
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

  function goTo(n, smooth) {
    n = Math.max(0, Math.min(N - 1, n));
    rail.scrollTo({ left: centres[n] - railW / 2, behavior: smooth === false ? "auto" : "smooth" });
  }

  rail.addEventListener("scroll", schedule, { passive: true });
  // Re-measure whenever the strip's own width changes — a rotated phone, a
  // resized window, or a strip that was laid out while hidden at zero width.
  let resizeT = 0;
  const relayout = () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const keep = Math.max(0, current);
      measure();
      goTo(keep, false);
      schedule();
    }, 80);
  };
  if ("ResizeObserver" in window) {
    let lastW = -1;
    new ResizeObserver(() => {
      if (rail.clientWidth !== lastW) { lastW = rail.clientWidth; relayout(); }
    }).observe(rail);
  } else {
    window.addEventListener("resize", relayout);
  }
  measure();
  goTo(0, false);
  paint();

  // ---- choosing ----
  // A tap that turns into a swipe is scrolling, not choosing. Without this,
  // flicking the strip on a phone opened whichever job was under the thumb.
  let touch = null, moved = false;
  rail.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touch = t ? { x: t.clientX, y: t.clientY } : null;
    moved = false;
  }, { passive: true });
  rail.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (!touch || !t) return;
    if (Math.abs(t.clientX - touch.x) > 10 || Math.abs(t.clientY - touch.y) > 10) moved = true;
  }, { passive: true });

  rail.addEventListener("click", (e) => {
    if (moved) { moved = false; return; }
    const s = e.target.closest(".reel__slide");
    if (!s) return;
    const n = +s.dataset.n;
    if (n === current) openViewer(n);
    else goTo(n);
  });
  root.addEventListener("click", (e) => {
    const st = e.target.closest("[data-step]");
    if (st) return goTo(current + +st.dataset.step);
    if (e.target.closest("[data-open]")) openViewer(current);
  });
  rail.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(current); }
  });

  // ---- the full-screen viewer: the whole job the photograph belongs to ----
  // Same chrome as the viewer beside the map on the home page (css/site.css
  // .viewer), opened on the photograph that was tapped.
  const viewer = document.createElement("div");
  viewer.className = "viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-hidden", "true");
  viewer.innerHTML = `
    <button class="viewer__close" data-vclose aria-label="Close">&times;</button>
    <div class="viewer__head">
      <p class="viewer__eyebrow"></p>
      <h2 class="viewer__title"></h2>
      <p class="viewer__desc"></p>
    </div>
    <button class="viewer__arrow viewer__arrow--prev" data-vstep="-1" aria-label="Previous photo">&larr;</button>
    <div class="viewer__rail"></div>
    <button class="viewer__arrow viewer__arrow--next" data-vstep="1" aria-label="Next photo">&rarr;</button>`;
  document.body.appendChild(viewer);
  const vRail = viewer.querySelector(".viewer__rail");
  const vEyebrow = viewer.querySelector(".viewer__eyebrow");
  const V_PAD = 24;
  let vPos = 0, vReturn = null, vHistory = false, vList = [];
  let vPi = -1;

  function openViewer(n) {
    const ph = photoAt(n);
    const pi = ph[0];
    vPi = pi;
    vList = D.photos.filter((x) => x[0] === pi);
    const startAt = Math.max(0, vList.indexOf(ph));
    vReturn = document.activeElement;
    viewer.querySelector(".viewer__title").textContent = label(pi);
    viewer.querySelector(".viewer__desc").textContent = projects[pi].desc || "";
    vRail.innerHTML = vList.map((g) => `
      <figure class="viewer__fig">
        <div class="viewer__imgwrap">
          <img src="${g[6]}" alt="${(g[5] || label(pi)).replace(/"/g, "&quot;")}" loading="lazy">
          ${g[4] ? `<span class="viewer__phase viewer__phase--${g[4]}">${g[4]}</span>` : ""}
          ${g[5] ? `<figcaption class="viewer__cap">${g[5]}</figcaption>` : ""}
        </div>
      </figure>`).join("");
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-lock");
    vPos = startAt;
    vCount();
    requestAnimationFrame(() => {
      const fig = vRail.children[vPos];
      if (fig) vRail.scrollLeft = Math.max(0, fig.offsetLeft - V_PAD);
    });
    viewer.querySelector(".viewer__close").focus();
    // One history entry so the phone's back gesture closes the viewer
    // instead of leaving the page.
    if (!vHistory) {
      try { history.pushState({ psiReelViewer: true }, ""); vHistory = true; }
      catch (e) { vHistory = false; }
    }
  }
  function vCount() {
    const p = projects[vPi];
    vEyebrow.textContent = (p.city || "Previous project") + "  ·  " + (vPos + 1) + " / " + vList.length;
  }
  function closeViewer(fromPop) {
    if (vHistory && !fromPop) { vHistory = false; history.back(); }
    else if (fromPop) vHistory = false;
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("viewer-lock");
    if (vReturn && vReturn.focus) vReturn.focus();
  }
  window.addEventListener("popstate", () => {
    if (viewer.classList.contains("is-open")) closeViewer(true);
  });
  function goViewer(k) {
    const figs = vRail.children;
    if (!figs.length) return;
    vPos = ((k % figs.length) + figs.length) % figs.length;
    vRail.scrollTo({ left: Math.max(0, figs[vPos].offsetLeft - V_PAD), behavior: "smooth" });
    vCount();
  }
  // Keep the counter honest when the rail is swiped rather than stepped.
  let vFrame = 0;
  vRail.addEventListener("scroll", () => {
    if (vFrame) return;
    vFrame = requestAnimationFrame(() => {
      vFrame = 0;
      const figs = vRail.children;
      let best = 0, bestD = Infinity;
      for (let i = 0; i < figs.length; i++) {
        const d = Math.abs(figs[i].offsetLeft - V_PAD - vRail.scrollLeft);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best !== vPos) { vPos = best; vCount(); }
    });
  }, { passive: true });

  viewer.addEventListener("click", (e) => {
    if (e.target.closest("[data-vclose]")) return closeViewer();
    const st = e.target.closest("[data-vstep]");
    if (st) return goViewer(vPos + +st.dataset.vstep);
    if (e.target === viewer) closeViewer();
  });
  document.addEventListener("keydown", (e) => {
    if (!viewer.classList.contains("is-open")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") goViewer(vPos + 1);
    if (e.key === "ArrowLeft") goViewer(vPos - 1);
  });
})();
