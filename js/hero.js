/* ============================================================
   Scroll-scrubbed hero sequence
   - Deterministic mapping: scroll progress -> frame index
   - Canvas cover-rendering with focal-point protection
   - Prioritised progressive preloading (poster first, then
     coarse-to-fine so early scrubbing never hits a gap)
   - requestAnimationFrame render loop, decoupled from scroll
   - prefers-reduced-motion: static final architectural frame
   ============================================================ */

(() => {
  "use strict";

  // ------------------------------------------------------------------
  // Configuration (kept in one place; frame data injected at build time)
  // ------------------------------------------------------------------
  const CONFIG = {
    frameCount: window.HERO_FRAME_COUNT || 0, // set by frames-manifest.js
    framePath: (i) =>
      `assets/hero-sequence/frame-${String(i + 1).padStart(4, "0")}.webp`,
    scrollLengthVh: 340, // virtual scroll runway for the pinned hero
    settleTailPct: 0.06, // last 6% of scroll holds the final frame
    // Normalised focal point of the house in the source frames.
    // Cover-cropping keeps this point sensibly placed at any aspect.
    focalX: 0.5,
    focalY: 0.42,
    // Frame-scrub smoothing: how quickly the drawn frame chases the
    // scroll-mapped target. High enough to feel direct, low enough to
    // absorb discrete wheel steps. (~0 lag at trackpad speeds)
    smoothing: 14, // higher = snappier (units: 1/s)
  };

  const hero = document.getElementById("hero");
  // The sticky child is the pinned window the frames are drawn into. Its
  // height is the runway's divisor, and unlike window.innerHeight it does not
  // move when a phone collapses its address bar.
  const viewportEl = hero
    ? hero.querySelector(".hero__viewport")
    : null;
  const canvas = document.getElementById("heroCanvas");
  const poster = document.getElementById("heroPoster");
  const loader = document.getElementById("heroLoader");
  const loaderBar = document.getElementById("heroLoaderBar");
  if (!hero || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });

  // ------------------------------------------------------------------
  // One hero, two frame sets. This used to return early on a portrait
  // phone and show a single sunset photograph instead — which meant the
  // 24-frame portrait sequence prepared below could never run, and the
  // hero on a phone was a still picture sitting there while every other
  // image on the page moved. The mobile frames exist in
  // assets/hero-mobile-seq, pre-cropped to 3:4 around the building, so
  // the phone now scrubs its own sequence rather than opting out.
  // ------------------------------------------------------------------
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ------------------------------------------------------------------
  // Reduced motion: shortest respectful path — show the finished
  // architectural composition, no scrub, no pin.
  // ------------------------------------------------------------------
  if (reducedMotion.matches) {
    hero.style.height = "100svh";
    if (
      window.matchMedia("(max-width: 760px) and (orientation: portrait)")
        .matches
    ) {
      poster.src = "assets/hero-mobile-seq/final.jpg";
    } else if (CONFIG.frameCount > 0) {
      poster.src = CONFIG.framePath(CONFIG.frameCount - 1);
      poster.style.objectPosition = "50% 50%";
    }
    if (loader) loader.remove();
    return;
  }

  // ------------------------------------------------------------------
  // Phones get a different hero on purpose. The sequence is 193 landscape
  // frames (25MB) cover-cropped to the viewport: on a portrait screen that
  // throws away most of the frame and the house with it. Here the markup's
  // portrait source stands on its own, nothing is scrubbed, and the
  // sequence is never requested.
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // Sequence variants. The desktop set is 193 landscape stills; on a
  // portrait phone, cover-cropping them throws away the house. The
  // mobile set is 24 frames pre-cropped to 3:4 around the building.
  // The choice keys on ORIENTATION, not width: a landscape phone is a
  // wide, short viewport and the 16:9 set is the right one for it.
  // ------------------------------------------------------------------
  const portraitPhone = window.matchMedia(
    "(max-width: 760px) and (orientation: portrait)",
  );
  const startedPortrait = portraitPhone.matches;
  if (startedPortrait) {
    CONFIG.frameCount = 24;
    CONFIG.framePath = (i) =>
      `assets/hero-mobile-seq/m-${String(i + 1).padStart(3, "0")}.jpg`;
    CONFIG.scrollLengthVh = 200; // a shorter runway suits a thumb
    CONFIG.focalX = 0.5;
    CONFIG.focalY = 0.5; // frames are already composed; no bias needed
    hero.classList.add("hero--phone");
  } else if (window.matchMedia("(max-width: 900px)").matches) {
    // small landscape viewports keep the 16:9 frames but a shorter runway
    CONFIG.scrollLengthVh = 220;
  }

  // The engine can always retreat to a correct still: right sequence's
  // final frame, full-viewport, no scrub. Used on any runtime failure
  // and when a rotation crosses the portrait/landscape boundary, where
  // the loaded frames stop matching the viewport they were cut for.
  let dead = false;
  const retreat = () => {
    if (dead) return;
    dead = true;
    hero.classList.add("hero--still");
    hero.style.height = "100svh";
    canvas.style.display = "none";
    if (poster) {
      // The still must match the viewport it retreats into, not the
      // orientation the page happened to load in.
      const still = portraitPhone.matches
        ? "assets/hero-mobile-seq/final.jpg"
        : "assets/hero-sequence/frame-0193.webp";
      // Inside a <picture>, a matching <source> beats img.src outright, so
      // setting src alone did nothing on a portrait phone — the browser kept
      // painting whatever the portrait <source> pointed at. Update the source
      // too, or this fallback is silently dead exactly where it is needed.
      const pic = poster.parentElement;
      if (pic && pic.tagName === "PICTURE") {
        pic.querySelectorAll("source").forEach((sourceEl) => {
          sourceEl.srcset = still;
        });
      }
      poster.src = still;
      poster.style.display = "";
    }
    if (loader) loader.remove();
  };

  if (portraitPhone.addEventListener) {
    portraitPhone.addEventListener("change", () => {
      if (portraitPhone.matches === startedPortrait) return;
      // The two orientations use different frame sets — 24 stills cropped 3:4
      // for a portrait phone, 193 landscape ones otherwise — and the count is
      // captured when this module boots, so the loaded frames stop matching
      // the viewport the moment the boundary is crossed.
      //
      // This used to call retreat(), which sets dead = true permanently: the
      // canvas was hidden and the scrub never came back, so rotating a phone
      // or dragging a split-view divider left the hero inert until a manual
      // reload. Re-loading the page is heavier than a live swap but it is
      // always correct, and a wrong-aspect or dead hero is worse. Guarded so
      // a media query that fires twice cannot loop.
      if (window.__psiHeroReloading) return;
      window.__psiHeroReloading = true;
      window.location.reload();
    });
  }

  hero.style.setProperty("--hero-scroll-length", CONFIG.scrollLengthVh + "vh");
  document.documentElement.style.setProperty(
    "--hero-scroll-length",
    CONFIG.scrollLengthVh + "vh",
  );

  // ------------------------------------------------------------------
  // Frame store + progressive loader
  // ------------------------------------------------------------------
  const N = CONFIG.frameCount;
  const frames = new Array(N).fill(null); // ImageBitmap | HTMLImageElement
  const loadState = new Array(N).fill(0); // 0 idle, 1 loading, 2 ready
  let readyCount = 0;
  let firstFrameReady = false;

  const supportsBitmap = "createImageBitmap" in window;

  function loadFrame(i, priority) {
    if (i < 0 || i >= N || loadState[i] !== 0) return Promise.resolve();
    loadState[i] = 1;
    return fetch(CONFIG.framePath(i), { priority: priority || "auto" })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      })
      .then((blob) =>
        supportsBitmap
          ? createImageBitmap(blob)
          : new Promise((res, rej) => {
              const img = new Image();
              img.onload = () => res(img);
              img.onerror = rej;
              img.src = URL.createObjectURL(blob);
            }),
      )
      .then((bmp) => {
        frames[i] = bmp;
        loadState[i] = 2;
        readyCount++;
        if (i === 0) firstFrameReady = true;
        onFrameArrived(i);
      })
      .catch(() => {
        loadState[i] = 0;
      }); // transient failure -> retryable
  }

  // Coarse-to-fine order: frame 0, last frame, then successive halvings.
  // Any scroll position finds a nearby loaded frame long before the
  // full set arrives.
  function coarseToFineOrder(n) {
    const order = [];
    const seen = new Uint8Array(n);
    const push = (i) => {
      if (i >= 0 && i < n && !seen[i]) {
        seen[i] = 1;
        order.push(i);
      }
    };
    push(0);
    push(n - 1);
    let step = Math.max(1, Math.floor(n / 2));
    while (step >= 1) {
      for (let i = 0; i < n; i += step) push(i);
      if (step === 1) break;
      step = Math.floor(step / 2);
    }
    return order;
  }

  // Two sequences, two sensible load orders.
  //
  // Coarse-to-fine is right for the 193-frame desktop set: 25MB will not all
  // arrive soon, so having *some* frame near any scroll position matters more
  // than having them in order. It is wrong for the 24-frame phone set, which
  // is 1.8MB and lands in a moment. There, out-of-order arrival is the glitch:
  // nearestReady() would answer frame 0, then 12, then 6, so an early scroll
  // hopped between completely different camera positions. Loading in order and
  // refusing to draw ahead of what has arrived turns that into plain motion
  // that catches up, which is what it looks like once the frames are cached —
  // and why it seemed to fix itself on later visits.
  const sequential = startedPortrait;
  const loadOrder = sequential
    ? Array.from({ length: N }, (_, i) => i)
    : coarseToFineOrder(N);

  // Highest index whose whole run from 0 has arrived. -1 until frame 0 lands.
  let readyPrefix = -1;
  function growReadyPrefix() {
    while (readyPrefix + 1 < N && loadState[readyPrefix + 1] === 2) readyPrefix++;
  }
  let orderCursor = 0;
  const MAX_INFLIGHT = 6;
  let inflight = 0;

  let retrySweeps = 0;
  function pump() {
    while (inflight < MAX_INFLIGHT && orderCursor < loadOrder.length) {
      const i = loadOrder[orderCursor++];
      if (loadState[i] !== 0) continue;
      inflight++;
      loadFrame(i).finally(() => {
        inflight--;
        pump();
      });
    }
    // Transient fetch failures were marked retryable; sweep the order a
    // few more times so one bad response cannot strand the loader.
    if (
      inflight === 0 &&
      orderCursor >= loadOrder.length &&
      readyCount < N &&
      retrySweeps < 3
    ) {
      retrySweeps++;
      setTimeout(() => {
        orderCursor = 0;
        pump();
      }, 1500 * retrySweeps);
    }
  }

  // Nearest loaded frame at or around the requested index.
  function nearestReady(target) {
    if (loadState[target] === 2) return target;
    for (let d = 1; d < N; d++) {
      if (target - d >= 0 && loadState[target - d] === 2) return target - d;
      if (target + d < N && loadState[target + d] === 2) return target + d;
    }
    return -1;
  }

  // ------------------------------------------------------------------
  // Canvas sizing (devicePixelRatio-aware, memory-capped)
  // ------------------------------------------------------------------
  let cw = 0,
    ch = 0,
    dpr = 1;

  function resize() {
    // Cap backing store: sequence frames are 1920px wide, so >2x their
    // density buys nothing and costs memory on Retina displays.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth;
    ch = canvas.clientHeight;
    const bw = Math.round(cw * dpr);
    const bh = Math.round(ch * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      // Only a real size change needs a repaint. Resetting this on every
      // resize event meant an address bar sliding away — which fires resize
      // repeatedly through the first scroll — forced a full redraw each time,
      // on top of whatever the scrub was already doing.
      drawnFrame = -1;
    }
  }

  // Cover-draw with focal-point bias.
  function draw(idx) {
    const img = frames[idx];
    if (!img) return;
    const iw = img.width,
      ih = img.height;
    const scale = Math.max((cw * dpr) / iw, (ch * dpr) / ih);
    const dw = iw * scale,
      dh = ih * scale;
    const maxX = dw - cw * dpr,
      maxY = dh - ch * dpr;
    const dx = -Math.min(
      maxX,
      Math.max(0, CONFIG.focalX * dw - (cw * dpr) / 2),
    );
    const dy = -Math.min(
      maxY,
      Math.max(0, CONFIG.focalY * dh - (ch * dpr) / 2),
    );
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ------------------------------------------------------------------
  // Scroll mapping + render loop
  // ------------------------------------------------------------------
  let targetFloat = 0; // scroll-mapped fractional frame
  let currentFloat = 0; // smoothed fractional frame actually drawn
  let drawnFrame = -1;

  // No landing still.
  //
  // The hero used to dissolve into assets/hero-mobile-seq/final.jpg over the
  // last fifth of the scroll. That file is the whole house *outpainted* to
  // portrait — the building sits much smaller inside the frame than it does in
  // the scrub frames, because a 3:4 crop of a 16:9 source is only 810px wide
  // while the building itself spans about 1000px, so the wide framing had to be
  // painted rather than cropped. Cross-fading two different framings of the
  // same subject reads as the house changing size and shape right at the end,
  // which is what it was: the camera flew in, then popped back out.
  //
  // The sequence now ends where the camera actually lands. One distance, no
  // dissolve, nothing to mismatch. (final.jpg is still the right single image
  // for the reduced-motion and failure paths, which show no motion at all.)
  let progressNow = 0;
  let lastT = performance.now();
  let canvasLive = false;

  // The pinned height, measured from layout rather than the window.
  //
  // This used to divide by window.innerHeight, which is the one number on a
  // phone that changes while you scroll: the address bar collapses, innerHeight
  // grows by ~60-100px, and the runway silently gets shorter. Progress is
  // -top/runway, so the same scroll position suddenly mapped to a different
  // frame and the sequence lurched — every time, on the first scroll of a fresh
  // load, which is exactly when the bar is still expanded. The sticky child is
  // sized in svh and holds still, so it is the honest divisor.
  function pinnedHeight() {
    if (viewportEl && viewportEl.offsetHeight > 0) return viewportEl.offsetHeight;
    return window.innerHeight;
  }

  function scrollProgress() {
    const rect = hero.getBoundingClientRect();
    const runway = hero.offsetHeight - pinnedHeight();
    if (runway <= 0) return 1;
    const p = -rect.top / runway;
    return Math.min(1, Math.max(0, p));
  }

  function frameForProgress(p) {
    // Hold the final frame through the settle tail so the pin releases
    // on a stationary image (no snap into the next section).
    const usable = 1 - CONFIG.settleTailPct;
    const q = Math.min(1, p / usable);
    return q * (N - 1);
  }

  function onFrameArrived(i) {
    growReadyPrefix();
    if (loaderBar) {
      loaderBar.style.width = ((readyCount / N) * 100).toFixed(1) + "%";
    }
    if (readyCount === N) hero.classList.add("hero--loaded");
    // If the frame that just arrived is what the viewer is waiting on,
    // repaint immediately.
    if (Math.abs(i - targetFloat) < 1.5) drawnFrame = -1;
  }

  function stepOnce(dt) {
    const p = scrollProgress();
    progressNow = p;
    hero.style.setProperty("--hero-progress", p.toFixed(4));
    targetFloat = frameForProgress(p);
    // Hold at the edge of what has actually loaded rather than skipping onto a
    // distant frame that happens to be ready.
    if (sequential && readyPrefix >= 0 && targetFloat > readyPrefix) {
      targetFloat = readyPrefix;
    }

    // Exponential chase: framerate-independent, sub-frame accurate.
    const k = 1 - Math.exp(-CONFIG.smoothing * dt);
    currentFloat += (targetFloat - currentFloat) * k;
    if (Math.abs(targetFloat - currentFloat) < 0.02) currentFloat = targetFloat;

    const want = Math.round(currentFloat);
    const idx = sequential
      ? Math.min(readyPrefix, Math.max(0, want)) // -1 while nothing has arrived
      : nearestReady(want);

    if (idx >= 0) {
      if (!canvasLive && firstFrameReady) {
        canvasLive = true;
        hero.classList.add("hero--canvas-live");
      }
      if (idx !== drawnFrame) {
        draw(idx);
        drawnFrame = idx;
      }
    }
  }

  function tick(now) {
    if (dead) return;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    stepOnce(dt);
    requestAnimationFrame(tick);
  }

  // ------------------------------------------------------------------
  // Boot
  // ------------------------------------------------------------------
  if (N === 0) {
    // Manifest missing — leave the poster; nothing else to do.
    if (loader) loader.remove();
    return;
  }

  // Debug/QA hook (read-only introspection; no runtime cost).
  Object.defineProperty(window, "__hero", {
    value: {
      get progress() {
        return scrollProgress();
      },
      get target() {
        return targetFloat;
      },
      get current() {
        return currentFloat;
      },
      get drawn() {
        return drawnFrame;
      },
      get ready() {
        return readyCount;
      },
      get total() {
        return N;
      },
      step(dt) {
        stepOnce(dt || 1 / 60);
      },
    },
  });

  window.addEventListener("resize", resize, { passive: true });
  resize();
  pump();
  try {
    requestAnimationFrame((t) => {
      if (dead) return;
      resize();
      requestAnimationFrame(tick);
    });
  } catch (e) {
    retreat();
  }
})();
