/* ============================================================
   PSI Construction — homepage behaviour
   - Nav: transparent over hero, solid after
   - Previous Projects: Leaflet map + list + carousel, synchronized
   - Google Reviews carousel
   ============================================================ */
(() => {
  "use strict";

  // ---------------- Nav ----------------
  const nav = document.getElementById("topNav");
  const onScroll = () => {
    const heroEl = document.getElementById("hero");
    const threshold = heroEl ? heroEl.offsetHeight - window.innerHeight * 0.5 : 40;
    nav.classList.toggle("nav--solid", window.scrollY > threshold);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------- Previous Projects ----------------
  const projects = window.PSI_PROJECTS || [];
  const office = window.PSI_OFFICE;
  const mapEl = document.getElementById("projectMap");
  if (!mapEl || !projects.length || typeof L === "undefined") return;

  const map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // A project is a "case study" once it has a photo gallery attached.
  // Those pins are styled differently and open a detail view.
  const hasCase = (p) => Array.isArray(p.gallery) && p.gallery.length > 0;

  const pinIcon = (active, isCase) => L.divIcon({
    className: "",
    html: `<div class="pin${active ? " pin--active" : ""}${isCase ? " pin--case" : ""}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 16]
  });

  // Office marker (distinct, not part of the sync set)
  if (office) {
    L.marker([office.lat, office.lng], {
      icon: L.divIcon({ className: "", html: '<div class="pin pin--office"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
    }).addTo(map).bindPopup(`<strong>${office.name}</strong><br>${office.address}<br><em>Visits available upon request</em>`);
  }

  const markers = projects.map((p, i) => {
    const m = L.marker([p.lat, p.lng], { icon: pinIcon(false, hasCase(p)) }).addTo(map);
    m.bindPopup(hasCase(p)
      ? `<strong>${p.name}</strong><br>` +
        (p.type ? `<em style="color:#d60000;font-style:normal;font-weight:600">${p.type}</em><br>` : "") +
        `${p.city}` +
        (p.desc ? `<span style="display:block;margin-top:6px;max-width:240px">${p.desc}</span>` : "") +
        `<button class="case__open" data-project="${i}">See these photos &rarr;</button>`
      : `<strong>${p.name}</strong><br>${p.city}`);
    m.on("click", () => select(i, "map"));
    return m;
  });

  // Popups are re-created by Leaflet, so delegate instead of binding per popup.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-project]");   // slides carry the id too
    if (!btn) return;
    enterProject(+btn.dataset.project);
    document.getElementById("projectCarousel").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  const allBounds = L.latLngBounds(projects.map(p => [p.lat, p.lng])).pad(0.08);
  map.fitBounds(allBounds);

  // If the map booted inside a hidden/zero-size container (collapsed panel,
  // background tab), Leaflet's sizing is wrong — refit once real layout lands.
  let fitted = mapEl.clientWidth > 0 && mapEl.clientHeight > 0;
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      if (!fitted && mapEl.clientWidth > 0 && mapEl.clientHeight > 0) {
        fitted = true;
        map.fitBounds(allBounds);
      }
    });
    ro.observe(mapEl);
  }

  // List
  const listEl = document.getElementById("projectList");
  const rows = projects.map((p, i) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "project-list__row";
    row.setAttribute("role", "option");
    row.innerHTML = `
      <span class="project-list__idx">${String(i + 1).padStart(2, "0")}</span>
      <span class="project-list__name">${p.name}</span>
      <span class="project-list__city">${p.city}</span>
      ${p.type ? `<span class="project-list__type">${p.type}</span>` : ""}`;
    row.addEventListener("click", () => select(i, "list"));
    listEl.appendChild(row);
    return row;
  });

  // Carousel — only projects that actually have photography appear here.
  // Every project still gets a map pin and a list row.
  const track = document.getElementById("carouselTrack");
  const counter = document.getElementById("carouselCounter");

  // One entry per PHOTOGRAPH, not per project. A project with a gallery
  // contributes all of its shots; anything else contributes its single image.
  const shots = [];
  projects.forEach((p, i) => {
    if (Array.isArray(p.gallery) && p.gallery.length) {
      p.gallery.forEach((g) => shots.push({ i, p, src: g.src, cap: g.cap, phase: g.phase }));
    } else if (p.img) {
      shots.push({ i, p, src: p.img, cap: p.caption, phase: null });
    }
  });
  const shotsOf = new Map();
  shots.forEach((sh, k) => {
    if (!shotsOf.has(sh.i)) shotsOf.set(sh.i, []);
    shotsOf.get(sh.i).push(k);
  });

  const shuffled = () => {
    const a = shots.map((_, k) => k);
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [a[k], a[j]] = [a[j], a[k]];
    }
    return a;
  };

  let order = shuffled();   // current running order (indices into `shots`)
  let pos = 0;              // where we are within `order`
  let projectMode = -1;     // project index while showing one job, else -1

  const slideHTML = (sh) => {
    const title = sh.p.type || sh.p.city;
    const line  = sh.cap || sh.p.desc || "";
    return `
      <div class="carousel__media">
        <div class="carousel__img">
          <img loading="lazy" src="${sh.src}" alt="${line || title}">
          ${sh.phase ? `<span class="carousel__phase carousel__phase--${sh.phase}">${sh.phase}</span>` : ""}
          <div class="carousel__overlay">
            <p class="carousel__overlay-title">${title}</p>
            ${line ? `<p class="carousel__overlay-cap">${line}</p>` : ""}
          </div>
        </div>
      </div>
      <div class="carousel__info">
        <p class="eyebrow eyebrow--accent">${sh.phase ? sh.phase : "Previous Project"}</p>
        <h3>${title}</h3>
        <p class="carousel__loc">${sh.p.city}</p>
        ${line ? `<p class="carousel__desc">${line}</p>` : ""}
        ${sh.p.desc && sh.cap ? `<p class="carousel__caption">${sh.p.desc}</p>` : ""}
        ${sh.p.plans ? `<a class="carousel__plans" href="${sh.p.plans}" target="_blank" rel="noopener">View filed plans (PDF) &rarr;</a>` : ""}
      </div>`;
  };

  function renderTrack() {
    track.innerHTML = "";
    order.forEach((k) => {
      const sh = shots[k];
      const slide = document.createElement("div");
      slide.className = "carousel__slide";
      slide.dataset.project = sh.p.id || "";
      slide.innerHTML = slideHTML(sh);
      const im = slide.querySelector("img");
      if (im) im.addEventListener("load", () => { if (track.children[pos] === slide) fitHeight(); });
      track.appendChild(slide);
    });
  }

  // The stage height follows the photo on screen: a wide shot gets a short
  // stage, a tall shot a tall one. Without this, one shape or the other sits
  // in a band of empty background.
  const wrap = track.parentElement;
  function fitHeight() {
    const slide = track.children[pos];
    if (!slide) return;
    const img = slide.querySelector("img");
    const media = slide.querySelector(".carousel__media");
    if (!img || !media) return;
    const cap = Math.min(window.innerHeight * 0.82, 900);
    const w = media.clientWidth || track.clientWidth;
    let h = cap;
    if (img.naturalWidth && img.naturalHeight) {
      h = Math.min(cap, (w * img.naturalHeight) / img.naturalWidth);
    }
    wrap.style.height = Math.max(300, Math.round(h)) + "px";
  }
  window.addEventListener("resize", fitHeight, { passive: true });

  let syncing = false;
  function showPos(p2, sync) {
    if (!order.length) return;
    pos = (p2 + order.length) % order.length;
    track.style.transform = `translateX(-${pos * 100}%)`;
    fitHeight();
    const sh = shots[order[pos]];
    counter.textContent = projectMode >= 0
      ? `${pos + 1} / ${order.length} — ${sh.p.type || sh.p.city}`
      : `${sh.p.type || sh.p.city}`;
    if (sync && sh.i !== current) {
      syncing = true;
      select(sh.i, "carousel");
      syncing = false;
    }
  }

  // Show only one job's photographs, in order.
  function enterProject(i) {
    const ks = shotsOf.get(i);
    if (!ks || !ks.length) return false;
    projectMode = i;
    order = ks.slice();
    renderTrack();
    showPos(0, false);
    return true;
  }

  // Back to everything, freshly shuffled.
  function exitToShuffle() {
    projectMode = -1;
    order = shuffled();
    renderTrack();
    showPos(0, true);
  }

  let current = -1;

  function select(i, source) {
    if (i === current) {
      // Re-clicking the job that happens to be selected must still open its
      // photo set — otherwise the row goes dead once the shuffle lands on it.
      if (source === "list" || source === "map") enterProject(i);
      if (source === "list" || source === "carousel") focusPin(i);
      return;
    }
    if (current >= 0) {
      markers[current].setIcon(pinIcon(false, hasCase(projects[current])));
      rows[current].classList.remove("is-active");
    }
    current = i;
    const p = projects[i];

    // Pin
    markers[i].setIcon(pinIcon(true, hasCase(p)));
    if (source !== "map" && source !== "init") focusPin(i);
    if (source !== "init") markers[i].openPopup();

    // List row
    rows[i].classList.add("is-active");
    rows[i].scrollIntoView({ block: "nearest", behavior: "smooth" });

    // Carousel: clicking a pin or row shows just that job's photographs.
    // Skipped when the carousel itself drove the change, or on first paint.
    if (!syncing && source !== "init") enterProject(i);
  }

  function focusPin(i) {
    const p = projects[i];
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 16), { duration: 0.7 });
  }

  const stepCarousel = (delta) => {
    if (!order.length) return;
    // Walking off the end of one job's photos returns to the shuffle.
    if (projectMode >= 0 && delta > 0 && pos === order.length - 1) { exitToShuffle(); return; }
    if (projectMode >= 0 && delta < 0 && pos === 0) { exitToShuffle(); return; }
    showPos(pos + delta, true);
  };
  document.getElementById("carouselPrev").addEventListener("click", () => stepCarousel(-1));
  document.getElementById("carouselNext").addEventListener("click", () => stepCarousel(1));

  renderTrack();
  if (shots.length) { showPos(0, false); select(shots[order[0]].i, "init"); }

  // ---------------- Google Reviews carousel ----------------
  const reviews = [
    { author: "Yossi Lasker", stars: 5, html: `We couldn&rsquo;t be happier with our experience working with PSI Construction. They handled a full home remodel and finished our basement, and the results are absolutely fantastic. The team was professional, efficient, and respectful of our home. The project moved along quickly, and the pricing was by far the best we found. <strong>If you&rsquo;re looking for quality work at an honest price, PSI Construction is the way to go.</strong>` },
    { author: "Mendel Erlenwein", stars: 5, html: `Unbelievable work, could not recommend enough! As always, things come up in projects, new design ideas, etc and they came through on every single detail without constantly trying to up the estimate. <strong>Everything was meticulously planned out and executed to perfection,</strong> Great folks to work with and most of all, honest and stand behind their work!` },
    { author: "Moshe Dahan", stars: 5, html: `Had these guys do my guest/office bathroom over in my house. <strong>The job was done and bathroom was usable in three days.</strong> The bosses are super professional and detailed with what goes into each job. Great communication and great work. They quoted me on window replacement and another bathroom remodel and I&rsquo;m going with them for both jobs. Worth every penny working with these guys.` },
    { author: "Ben Berkovitz", stars: 5, html: `PSI Construction did an amazing job on our renovation plus new build project. <strong>They were very patient, transparent, communicative and very professional throughout our entire project.</strong> Their pricing was very competitive, and they completed the project within the expected timeline they gave us. Whenever something came up, they provided us with all the different options we could choose from. I highly recommend them and would hire them again for future projects.` },
    { author: "Mikaela", stars: 4, html: `Great price. PSI came referred to us through friends in the NEPA area. They renovated our guest bath for us in a matter of a few weeks. They were communicative and worked with us to achieve an on-time completion date and <strong>we were extremely impressed with the tile work for the tub area!</strong>` },
    { author: "Mushkie Schaeffer", stars: 5, html: `We had a seamless experience working with PSI on our custom home sauna. Although this was their first sauna project, they proved confidence and execution in their build. <strong>The finished sauna is both functional and spa-like,</strong> due to their research in providing us with the best materials for performance and visuals. We highly recommend them to anyone looking for an in-home sauna room that looks crafted and state-of-the-art!` },
    { author: "Miguel Andres Contreras", stars: 5, html: `<strong>Couldn&rsquo;t be happier with the work, honesty and professionalism.</strong>` }
  ];

  const rTrack = document.getElementById("reviewsTrack");
  reviews.forEach((r) => {
    const card = document.createElement("article");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-card__stars" aria-label="${r.stars} out of 5 stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p class="review-card__text">&ldquo;${r.html}&rdquo;</p>
      <p class="review-card__author">${r.author}<small>${r.stars} Stars &middot; Google Review</small></p>`;
    rTrack.appendChild(card);
  });

  let rIndex = 0;
  function reviewStep() {
    const card = rTrack.querySelector(".review-card");
    if (!card) return 0;
    return card.getBoundingClientRect().width + 20;
  }
  function maxIndex() {
    const wrap = rTrack.parentElement.getBoundingClientRect().width;
    const visible = Math.max(1, Math.floor(wrap / reviewStep()));
    return Math.max(0, reviews.length - visible);
  }
  function renderReviews() {
    rIndex = Math.min(Math.max(0, rIndex), maxIndex());
    rTrack.style.transform = `translateX(-${rIndex * reviewStep()}px)`;
  }
  document.getElementById("reviewsPrev").addEventListener("click", () => { rIndex--; renderReviews(); });
  document.getElementById("reviewsNext").addEventListener("click", () => { rIndex++; renderReviews(); });
  window.addEventListener("resize", renderReviews, { passive: true });
})();
