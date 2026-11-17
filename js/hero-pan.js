/* ============================================================
   Pan hero — a tall photograph that the page scrolls through.

   The hero section is taller than the screen; its stage sticks to the
   top while the section scrolls past, and --pan runs from 0 to 1 over
   that distance. CSS moves the photograph up (ceiling first, floor last)
   and brings the copy up from the bottom near the end. Without this
   script --pan stays at its CSS default of 1, so the copy is always
   visible and nothing depends on it.
   ============================================================ */
(function () {
  "use strict";
  var nav = document.querySelector(".nav");
  var still = document.querySelector(".svc-hero");
  // Every hero fills the screen below the sticky nav, so the nav's real
  // height (it changes with the logo size and the phone layout) is written
  // where the CSS can read it. 78px is the desktop size, as a fallback.
  function measureNav() {
    var navH = nav ? nav.offsetHeight : 0;
    if (nav && still) still.style.setProperty("--nav-h", navH + "px");
    return navH;
  }
  measureNav();
  window.addEventListener("resize", measureNav);

  var hero = document.querySelector(".svc-hero--pan");
  if (!hero) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var stage = hero.querySelector(".svc-hero__stage");
  var frame = 0;
  function update() {
    frame = 0;
    // The stage sits under the sticky nav, so it is a viewport minus that.
    var navH = measureNav();
    var r = hero.getBoundingClientRect();
    var travel = r.height - (stage ? stage.offsetHeight : window.innerHeight);
    // 0 while the hero's top is still under the nav, 1 as the stage unsticks.
    var p = travel > 0 ? (navH - r.top) / travel : 1;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    hero.style.setProperty("--pan", p.toFixed(4));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
})();
