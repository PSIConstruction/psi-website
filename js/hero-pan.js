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
  var hero = document.querySelector(".svc-hero--pan");
  if (!hero) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var frame = 0;
  function update() {
    frame = 0;
    var r = hero.getBoundingClientRect();
    var travel = r.height - window.innerHeight;
    var p = travel > 0 ? -r.top / travel : 1;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    hero.style.setProperty("--pan", p.toFixed(4));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
})();
