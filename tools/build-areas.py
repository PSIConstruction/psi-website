#!/usr/bin/env python3
"""Generate the location pages: Kingston, Wilkes-Barre, and the wider
service area (NEPA, and how far we travel for what).

    python3 tools/build-areas.py

Rules these pages keep, so they stay real pages and not doorways:
  * Every job shown is a real PSI job, labelled with the town it was
    actually built in (from data/projects.js). No street addresses — those
    stay out of the published site, same as the map.
  * Each page says something true about that place that no other page
    says: Kingston is where most of the documented work is; Wilkes-Barre
    is where the office is; the service-area page is how far we go and
    for which jobs.
  * A town gets its own page only once there is real work there to show.

Run tools/stamp-assets.py afterwards.
"""

import importlib.util
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))
DOMAIN = "https://psiconstructionpa.com"

_spec = importlib.util.spec_from_file_location("build_services", os.path.join(HERE, "build-services.py"))
bs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bs)
esc = bs.esc


def load_projects():
    """Documented jobs from data/projects.js, via node (the file is JS)."""
    js = ("global.window={};require(%r);"
          "console.log(JSON.stringify(window.PSI_PROJECTS))") % os.path.join(ROOT, "data", "projects.js")
    out = subprocess.run(["node", "-e", js], check=True, capture_output=True, text=True).stdout
    return json.loads(out)


def town_of(p):
    return p.get("city", "").split(",")[0].strip()


# ---------------------------------------------------------------------------
# Page content
# ---------------------------------------------------------------------------
PAGES = [
    {
        "path": "areas/kingston-pa",
        "town": "Kingston",
        "title": "General Contractor in Kingston, PA · Renovations, Additions & New Homes | PSI Construction",
        "description": "Kingston, PA general contractor with more than two dozen jobs in the borough — new homes, second-storey additions, fire and water rebuilds, basements, kitchens and bathrooms. Office just across the river in Wilkes-Barre.",
        "eyebrow": "PSI Construction · Kingston, PA",
        "h1": "Kingston, PA General Contractor",
        "intro": "Kingston is where most of our work has been. More than two dozen PSI jobs are in the borough — new homes, additions, whole-house rebuilds, basements, kitchens and bathrooms — and our office is just across the river.",
        "hero": ("assets/photos/55-reynolds/55reynolds-45-612c0de4.jpg",
                 "A newly completed three-storey home PSI built on a corner lot in Kingston"),
        "body_title": "Building in Kingston",
        "body": [
            "Most of the houses we work on in Kingston are older homes on tight lots, and that shapes the job. Opening a wall means finding out what earlier owners did behind it, so the survey and the scope come first and anything that changes is priced and agreed in writing before it is done.",
            "The jobs below are all in Kingston. They include a new three-storey house on a corner lot, a full second storey added to a single-storey house, a house rebuilt after a fire, another taken back to framing after water damage, a duplex turned back into a single-family home, and a detached garage rebuilt as two apartments.",
            "Our office is at 190 Wyoming Street in Wilkes-Barre, a few minutes away. Being this close, we take single-room jobs in Kingston — a bathroom, a basement, a kitchen — as well as whole houses.",
        ],
        "jobs_title": "Our Kingston jobs",
        "jobs_town": "Kingston",
        "faq_title": "Working with PSI in Kingston",
        "faq": [
            ("How much work have you done in Kingston?",
             "More than two dozen jobs so far, from single bathrooms to a new three-storey home. The photos on this page are all from Kingston jobs."),
            ("Do you take smaller jobs in Kingston?",
             "Yes. Because we are close, we take single-room work — a bathroom, a basement, a kitchen — as well as additions, whole-house renovations and new homes."),
            ("Do you also work in Forty Fort, Edwardsville and Kingston Township?",
             "Yes. The same crews work across the West Side — Forty Fort, Wyoming, Edwardsville, Swoyersville, Luzerne and Kingston Township — and on into the Back Mountain."),
            ("Can I meet you in person?",
             "Yes. Our office is at 190 Wyoming Street in Wilkes-Barre, just across the river. Visits are by appointment — call 570-338-8PSI (774)."),
        ],
        "link_town_pages": ["areas/wilkes-barre-pa", "service-area"],
    },
    {
        "path": "areas/wilkes-barre-pa",
        "town": "Wilkes-Barre",
        "title": "General Contractor in Wilkes-Barre, PA · Office on Wyoming Street | PSI Construction",
        "description": "Wilkes-Barre general contractor with an office at 190 Wyoming Street. Renovations, additions, new homes, rental and multi-family work, and commercial interiors across the city.",
        "eyebrow": "PSI Construction · Wilkes-Barre, PA",
        "h1": "Wilkes-Barre General Contractor — Our Office Is on Wyoming Street",
        "intro": "PSI's office is at 190 Wyoming Street in Wilkes-Barre. It is where clients come to meet us, look at plans and sign off on selections — and it puts us minutes from any job in the city.",
        "hero": ("assets/photos/378-rutter/378rutter-done-entry-35c34c53.jpg",
                 "A rebuilt entry and stair from a PSI whole-house rebuild in Kingston, across the river from our Wilkes-Barre office"),
        "body_title": "Working in Wilkes-Barre",
        "body": [
            "Wilkes-Barre has a lot of older housing — double-blocks, multi-family rentals and large early-twentieth-century houses — and much of our work suits it: gut renovations, duplex conversions, rental turnovers for landlords and property managers, kitchens, bathrooms and basements.",
            "We also take commercial interior work in the city — restroom and office renovations and build-outs — and we bid public and institutional projects.",
            "To be straight about the photographs: most of our documented jobs so far are across the river in Kingston, and every photo on this site is labelled with the town it was built in. The office, the crews and the way we run a job are the same on either side of the river.",
        ],
        "jobs_title": "Recent work, a few minutes from the office",
        "jobs_town": None,          # no Wilkes-Barre job is documented with photos yet
        "faq_title": "Working with PSI in Wilkes-Barre",
        "faq": [
            ("Where is your office?",
             "190 Wyoming Street, Wilkes-Barre, PA 18705. Clients meet us there to go over plans and selections. Visits are by appointment — call 570-338-8PSI (774)."),
            ("Do you work for landlords and property managers in Wilkes-Barre?",
             "Yes. Turnovers between tenants, plumbing and electrical repairs, drywall and finish work, flooring, doors and hardware, and full gut renovations of rental units and multi-family buildings."),
            ("Do you do commercial work in Wilkes-Barre?",
             "Yes — interior renovations and build-outs, restroom and office refreshes, and conversions. We also bid public and institutional work."),
            ("Do you work in Plains, Hanover Township and the rest of the Valley?",
             "Yes. From the office we cover Wilkes-Barre and the towns around it — Plains, Hanover Township, Ashley, Nanticoke, Pittston and across the river to Kingston and the West Side."),
        ],
        "link_town_pages": ["areas/kingston-pa", "service-area"],
    },
    {
        "path": "service-area",
        "town": None,
        "title": "Service Area · General Contractor for Northeastern Pennsylvania | PSI Construction",
        "description": "Where PSI Construction works: every kind of job within about 25 miles of Kingston and Wilkes-Barre, including Scranton, and larger builds up to about an hour away — Hazleton, Bloomsburg, Tunkhannock, Lake Wallenpaupack and the Poconos.",
        "eyebrow": "PSI Construction · Northeastern Pennsylvania",
        "h1": "Where We Work in Northeastern Pennsylvania",
        "intro": "We're based in Wilkes-Barre and do most of our work within about 25 miles. For new homes, additions and whole-house renovations, we travel further — up to about an hour.",
        "hero": ("assets/photos/55-reynolds/55reynolds-kitchen-front-67e14c64.jpg",
                 "The kitchen of a PSI new build in Kingston — slatted island with cooktop and sink, range under a white hood, double wall ovens and French-door fridge"),
        "body_title": None,
        "body": [],
        "zones": [
            ("Close to home — every kind of job",
             "Within about 25 miles of Kingston and Wilkes-Barre we take everything from a single bathroom or basement to a new house.",
             [("Luzerne County", ["Kingston", "Wilkes-Barre", "Forty Fort", "Wyoming", "West Pittston", "Exeter",
                                  "Swoyersville", "Luzerne", "Edwardsville", "Plymouth", "Nanticoke", "Plains",
                                  "Pittston", "Hanover Township", "Ashley", "Dallas", "Shavertown", "Trucksville",
                                  "Mountain Top"]),
              ("Lackawanna County", ["Scranton", "Moosic", "Old Forge", "Taylor", "Dunmore"])]),
            ("Further out — larger projects, up to about an hour",
             "New homes, additions, whole-house and gut renovations, and insurance rebuilds. We are running a water-damage insurance rebuild in Hawley right now.",
             [("Within about an hour", ["Hazleton", "Bloomsburg", "Berwick", "Tunkhannock", "Clarks Summit",
                                        "Honesdale", "Hawley", "Lake Wallenpaupack", "Hamlin", "Stroudsburg",
                                        "the Poconos"])]),
        ],
        "travel_note": "What we don't travel for: single bathrooms, small repairs and other short jobs more than about 25 miles out. The drive would cost you more than it's worth, and we would rather say so up front and point you to someone closer.",
        "jobs_title": None,
        "jobs_town": None,
        "faq_title": "Service area questions",
        "faq": [
            ("Do you work in Scranton?",
             "Yes. Scranton and the nearby Lackawanna County towns are within our regular area, about 25 minutes up 81 from the office, and we take every kind of job there."),
            ("How far will you travel for a new home or a big renovation?",
             "Up to about an hour from Wilkes-Barre — Hazleton, Bloomsburg, Tunkhannock, Honesdale, Lake Wallenpaupack, Hamlin and the Poconos. Larger jobs justify the drive, and the same team runs the job as it would in Kingston."),
            ("Will you come out for a small job outside your area?",
             "Usually not beyond about 25 miles. For a single bathroom or a repair that far out, the travel would add more to your cost than the job is worth — we will tell you that straight away rather than quote high."),
            ("Do you do insurance repair work outside the Valley?",
             "Yes, for jobs of a size that justifies the trip. We are running a water-damage insurance rebuild in Hawley right now."),
        ],
        "link_town_pages": ["areas/kingston-pa", "areas/wilkes-barre-pa"],
    },
]

TOWN_PAGE_LABEL = {
    "areas/kingston-pa": "Kingston, PA",
    "areas/wilkes-barre-pa": "Wilkes-Barre, PA",
    "service-area": "Our full service area",
}

# ---------------------------------------------------------------------------
# Markup
# ---------------------------------------------------------------------------
PAGE = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <link rel="canonical" href="{canonical}" />
    <link rel="icon" href="{R}favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="192x192" href="{R}assets/logo/icon-192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="{R}assets/logo/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{DOMAIN}/{hero_src}" />
    <meta property="og:url" content="{canonical}" />
    <link rel="preload" as="image" href="{R}{hero_src}" fetchpriority="high" />
    <link rel="stylesheet" href="{R}css/site.css" />
    <link rel="stylesheet" href="{R}css/services.css" />
    <script src="{R}js/hero-pan.js" defer></script>
    <script type="application/ld+json">
{page_schema}
    </script>
    <script type="application/ld+json">
{faq_schema}
    </script>
  </head>
  <body class="svc-page area-page">
{nav}
    <main>
      <section class="svc-hero svc-hero--reveal{tone_class}" aria-labelledby="svcTitle">
        <div class="svc-hero__stage">
        <img class="svc-hero__img" src="{R}{hero_src}" alt="{hero_alt}" width="1600" height="1200" fetchpriority="high" decoding="async" />
          <div class="svc-hero__scrim" aria-hidden="true"></div>
          <div class="svc-hero__body section__inner">
            <p class="eyebrow svc-hero__eyebrow">{eyebrow}</p>
            <h1 class="svc-hero__title" id="svcTitle">{h1}</h1>
            <p class="svc-hero__lede">{intro}</p>
            <div class="svc-hero__actions">
              <a class="btn" href="#quote">Get a quote</a>
              <a class="svc-hero__phone" href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>
            </div>
          </div>
          <p class="svc-hero__cue" aria-hidden="true">Scroll</p>
        </div>
      </section>
{body_section}{zones_section}{jobs_section}
      <section class="section section--white faq" id="faq" aria-labelledby="areaFaqTitle">
        <div class="section__inner">
          <div class="faq__grid">
            <div class="faq__lead">
              <h2 class="section__title" id="areaFaqTitle">{faq_title}</h2>
              <p class="faq__note">Something not covered here? Call and ask.</p>
              <a class="faq__phone" href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>
            </div>
            <div class="faq__list">
{faq_items}
            </div>
          </div>
        </div>
      </section>

      <nav class="section svc-more" aria-labelledby="areaMoreTitle">
        <div class="section__inner">
          <p class="eyebrow">What we build</p>
          <h2 class="section__title" id="areaMoreTitle">Our services</h2>
          <ul class="svc-more__list">
{service_links}
          </ul>
          <p class="area-also">Also: {town_links}</p>
        </div>
      </nav>

      <section class="section svc-quote" id="quote" aria-labelledby="areaQuoteTitle">
        <div class="section__inner">
          <p class="eyebrow">Get a quote</p>
          <h2 class="section__title" id="areaQuoteTitle">Tell us about your project</h2>
          <p class="lede">A few multiple-choice questions so we show up already knowing the job. Every one has a &ldquo;not sure yet&rdquo; option. Or call &mdash; <a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>.</p>
          <div class="contact-box svc-quote__box">
            <div id="quoteApp"></div>
          </div>
        </div>
      </section>
    </main>
{footer}
    <script>
      // Web3Forms relay key. Public by design: it only permits posting to the
      // address the key was issued for, and carries no account access.
      window.PSI_FORM_KEY = "daad9802-57e0-45fe-9b97-53206b0c17c6";
    </script>
    <script src="{R}js/main.js" defer></script>
    <script src="{R}js/quote-data.js" defer></script>
    <script src="{R}js/quote.js" defer></script>
{reel_scripts}    <script src="{R}js/psi-tracking.js" defer></script>
  </body>
</html>
"""

BODY = """
      <section class="section area-body" aria-labelledby="areaBodyTitle">
        <div class="section__inner area-body__inner">
          <h2 class="section__title" id="areaBodyTitle">{title}</h2>
{paras}
        </div>
      </section>
"""

ZONES = """
      <section class="section area-zones" aria-labelledby="areaZonesTitle">
        <div class="section__inner">
          <h2 class="section__title visually-hidden" id="areaZonesTitle">Towns we work in</h2>
{zones}
          <p class="area-note">{note}</p>
        </div>
      </section>
"""

JOBS = """
      <section class="section area-jobs" aria-labelledby="areaJobsTitle">
        <div class="section__inner">
          <p class="eyebrow">Work we&rsquo;ve done</p>
          <h2 class="section__title" id="areaJobsTitle">{title}</h2>
          <ul class="area-jobs__grid">
{cards}
          </ul>
        </div>
      </section>

      <section class="section section--navy svc-reel" id="work" aria-labelledby="areaReelTitle">
        <div class="section__inner">
          <p class="eyebrow">Every photograph</p>
          <h2 class="section__title" id="areaReelTitle">Start to finish</h2>
          <p class="lede">Swipe through the photographs. Tap one to see the whole job &mdash; each is labelled with the town it was built in.</p>
        </div>
        <div id="workReel" data-lead="{lead}"></div>
      </section>
"""

CARD = """            <li class="area-job">
              <img class="area-job__img" src="{R}{img}" alt="{alt}" loading="lazy" decoding="async" />
              <div class="area-job__body">
                <p class="area-job__town">{town}</p>
                <h3 class="area-job__title">{title}</h3>
                <p class="area-job__desc">{desc}</p>
              </div>
            </li>"""


def page_schema(pg, canonical):
    data = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pg["h1"],
        "url": canonical,
        "description": pg["description"],
        "about": {"@id": DOMAIN + "/#business"},
    }
    if pg["town"]:
        data["contentLocation"] = {"@type": "City", "name": pg["town"] + ", PA"}
    else:
        places = []
        for _, _, groups in pg["zones"]:
            for _, towns in groups:
                places += [{"@type": "Place", "name": t + ", PA"} for t in towns if not t.startswith("the ")]
        data["mainEntity"] = {"@type": "GeneralContractor", "@id": DOMAIN + "/#business",
                              "name": "PSI Construction, LLC", "areaServed": places}
    return "\n".join("    " + l for l in json.dumps(data, ensure_ascii=False, indent=2).splitlines())


def faq_schema(qa):
    data = {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q,
                            "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in qa]}
    return "\n".join("    " + l for l in json.dumps(data, ensure_ascii=False, indent=2).splitlines())


def build():
    projects = [p for p in load_projects() if p.get("id") and p.get("img")]
    for pg in PAGES:
        depth = pg["path"].count("/") + 1
        R = "../" * depth
        canonical = "%s/%s/" % (DOMAIN, pg["path"])

        body_section = ""
        if pg["body"]:
            paras = "\n".join('          <p class="lede">%s</p>' % esc(p) for p in pg["body"])
            body_section = BODY.format(title=esc(pg["body_title"]), paras=paras)

        zones_section = ""
        if pg.get("zones"):
            blocks = []
            for title, blurb, groups in pg["zones"]:
                lists = "\n".join(
                    '            <div class="area-zone__group"><p class="eyebrow">%s</p><p>%s</p></div>'
                    % (esc(g), esc(", ".join(towns))) for g, towns in groups)
                blocks.append('          <div class="area-zone">\n            <h3>%s</h3>\n            <p class="lede">%s</p>\n%s\n          </div>'
                              % (esc(title), esc(blurb), lists))
            zones_section = ZONES.format(zones="\n".join(blocks), note=esc(pg["travel_note"]))

        jobs_section, reel_scripts = "", ""
        if pg.get("jobs_title"):
            if pg["jobs_town"]:
                chosen = [p for p in projects if town_of(p) == pg["jobs_town"]]
            else:
                # No documented jobs in this town yet: show recent work nearby,
                # each card naming the town it is actually in.
                chosen = projects[:6]
            cards = "\n".join(CARD.format(
                R=R, img=p["img"].replace(DOMAIN + "/", ""),
                alt=esc("%s — %s" % (p.get("caption") or p["type"], p["city"])),
                town=esc(p["city"].split(" 1")[0]), title=esc(p["type"]), desc=esc(p["desc"].split(" Featured in")[0]))
                for p in chosen)
            jobs_section = JOBS.format(title=esc(pg["jobs_title"]), cards=cards,
                                       lead=",".join(p["id"] for p in chosen))
            reel_scripts = ('    <script src="{R}data/work-reel.js" defer></script>\n'
                            '    <script src="{R}js/work-reel.js" defer></script>\n').format(R=R)

        faq_items = "\n".join(bs.FAQ_ITEM.format(q=esc(q), a=esc(a)) for q, a in pg["faq"])
        service_links = "\n".join(
            '            <li><a href="%sservices/%s/">%s&nbsp;<span aria-hidden="true">&rarr;</span></a></li>'
            % (R, s["slug"], esc(s["short"])) for s in bs.SERVICES)
        town_links = " · ".join('<a href="%s%s/">%s</a>' % (R, p, esc(TOWN_PAGE_LABEL[p]))
                                for p in pg["link_town_pages"])

        html = PAGE.format(
            R=R, DOMAIN=DOMAIN, canonical=canonical,
            title=esc(pg["title"]), description=esc(pg["description"]),
            hero_src=pg["hero"][0], hero_alt=esc(pg["hero"][1]),
            tone_class=" svc-hero--light" if pg.get("hero_tone") == "light" else "",
            eyebrow=esc(pg["eyebrow"]), h1=esc(pg["h1"]), intro=esc(pg["intro"]),
            page_schema=page_schema(pg, canonical), faq_schema=faq_schema(pg["faq"]),
            body_section=body_section, zones_section=zones_section, jobs_section=jobs_section,
            faq_title=esc(pg["faq_title"]), faq_items=faq_items,
            service_links=service_links, town_links=town_links,
            nav=bs.NAV.format(R=R).replace('service-area/">Where We Work', 'service-area/" aria-current="page">Where We Work')
                if pg["path"] == "service-area" else bs.NAV.format(R=R),
            footer=bs.FOOTER.format(R=R, footer_services=bs.footer_services(R), footer_areas=bs.footer_areas(R, pg["path"])),
            reel_scripts=reel_scripts,
        )
        out = os.path.join(ROOT, pg["path"])
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, "index.html"), "w") as fh:
            fh.write(html)
        print("page  %s/" % pg["path"])


if __name__ == "__main__":
    build()
