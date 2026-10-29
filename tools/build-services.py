#!/usr/bin/env python3
"""Generate the nine service landing pages, their hero images, the What We
Build grid on the home page, and the sitemap — from one definition.

    python3 tools/build-services.py

Each page is the destination for one Google Ads group, so each gets its own
URL, title, description and H1 built from that group's keywords, and its
quote form opens straight onto the matching trade (quote.js reads data-flow).

Photographs are the site's own job photos; nothing is stock. Where a trade
has no clean "after" of its own (roofing), the closest real PSI frame is used
and said so in the alt text rather than borrowing a picture of someone
else's work.

Run tools/stamp-assets.py afterwards; it covers services/*/index.html too.
"""

import os
import re
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PH = "assets/photos"
DOMAIN = "https://psiconstructionpa.com"

# ---------------------------------------------------------------------------
# The nine ad groups. Order here is the order on the home page.
# ---------------------------------------------------------------------------
SERVICES = [
    {
        "slug": "new-home-construction",
        "process_title": "How we build a new home",
        "noun": "new home",
        "flow": "newhome",
        "short": "New homes & custom building",
        "h1": "Custom Home Builders in Kingston & Wilkes-Barre, PA",
        "title": "Custom Home Builder · Wilkes-Barre & Kingston PA | PSI Construction",
        "description": "New home construction contractor for Luzerne County. PSI builds custom homes from empty lot to keys — design, permits, foundation, framing and finish under one roof.",
        "keywords": ["custom home builder", "home builders near me", "new home construction contractor"],
        "intro": "A new home is the one project where every decision is yours. We take it from a bare corner lot to a finished, landscaped house — plans, permits, excavation, foundation, framing and every finish — with one team answerable for all of it.",
        "hero": (f"{PH}/55-reynolds/55reynolds-45-612c0de4.jpg", "A newly completed three-storey home with black-framed windows, finished landscaping and a fenced yard"),
        "steps": [
            ("Plan & permit", "Drawings and engineering settled, permits filed, budget agreed before a shovel moves."),
            ("Site & foundation", "Lot cleared, excavation to the drawings, footings below frost line and walls up square."),
            ("Framing", "Floors, walls and roof structure go up a storey at a time, inspected as we go."),
            ("Close in & rough-in", "Roof, windows and doors seal the shell; plumbing, electrical and HVAC run before anything is covered."),
            ("Insulate & board", "Insulated, vapour-sealed and drywalled — the house becomes rooms."),
            ("Finish & hand over", "Floors, kitchen, baths, trim, paint. Punch list closed, keys handed over."),
        ],
        "strip": [
            (f"{PH}/55-reynolds/55reynolds-01-baa15124.jpg", "The corner lot before work"),
            (f"{PH}/55-reynolds/55reynolds-03-524232cb.jpg", "Precast foundation walls set, stone base inside"),
            (f"{PH}/55-reynolds/55reynolds-08-577bfb8b.jpg", "Upper floor framed, windows in"),
            (f"{PH}/55-reynolds/55reynolds-14-d229e3c2.jpg", "Stucco on the three-storey shell"),
            (f"{PH}/55-reynolds/55reynolds-22-9e709c49.jpg", "The kitchen — island, pendants, range and hood"),
            (f"{PH}/55-reynolds/55reynolds-44-3e65b0cf.jpg", "The finished corner at dusk"),
        ],
        "cap_blurb": "Single-family builds, foundation through final finishes.",
    },
    {
        "slug": "home-additions",
        "process_title": "How we build an addition",
        "noun": "home addition",
        "flow": "addition",
        "short": "Additions",
        "h1": "Home Addition Contractor — Second Storeys, Bump-Outs & In-Law Suites",
        "title": "Home Addition Contractor · Kingston & Wilkes-Barre PA | PSI Construction",
        "description": "Room additions, second-storey additions, dormers and in-law suites across Luzerne County. PSI designs, permits and builds the addition — tied into your house, not bolted onto it.",
        "keywords": ["home addition contractor", "second story addition", "room addition contractor", "in law suite addition"],
        "intro": "An addition has to look like it was always there and work like it was planned from the start. We handle the structural tie-in, the roofline, the services, and the finishes — a one-storey house gaining a full second floor is a job we have done, start to finish.",
        "hero": (f"{PH}/417-warren/417warren-27.jpg", "A house with a newly built second-storey addition, siding complete and trimmed"),
        "steps": [
            ("Feasibility & design", "What the structure can carry, what zoning allows, and drawings that make the new work read as original."),
            ("Permits & engineering", "Stamped plans and the permit in hand before demolition."),
            ("Structure", "Foundation or bearing points, then the new floor and walls framed onto the existing house."),
            ("Roof & weather-tight", "Roof structure, sheathing, wrap — the addition closed in before the house is opened to it."),
            ("Systems & finishes", "Plumbing, electrical and HVAC extended; insulation, drywall, floors and trim matched through."),
            ("Tie-in & handover", "The seam between old and new finished so you can't find it."),
        ],
        "strip": [
            (f"{PH}/417-warren/417warren-06.jpg", "From the street — a one-storey house gaining a floor"),
            (f"{PH}/417-warren/417warren-07.jpg", "Roof sheathing going on"),
            (f"{PH}/417-warren/417warren-11.jpg", "The wrapped second storey from the street"),
            (f"{PH}/225-james/225james-01.jpg", "A new room framed and roofed, still open to the yard"),
            (f"{PH}/225-james/225james-08.jpg", "The finished room — white walls and new wood floor"),
            (f"{PH}/417-warren/417warren-28.jpg", "Built-in cabinetry and new flooring in the addition"),
        ],
        "cap_blurb": "Full additions including plumbing and electrical.",
    },
    {
        "slug": "whole-home-renovation",
        "process_title": "How we run a whole-home renovation",
        "noun": "whole-home renovation",
        "flow": "whole",
        "short": "Whole-home renovation",
        "h1": "Whole-House Renovation Contractor in Luzerne County, PA",
        "title": "Whole House Renovation Contractor · Kingston & Wilkes-Barre | PSI Construction",
        "description": "Complete home renovation and gut remodels in Kingston, Wilkes-Barre and across Luzerne County. PSI takes a house back to the structure and rebuilds it as one coordinated job.",
        "keywords": ["whole house renovation contractor", "gut renovation contractor", "full house remodel contractor", "complete home renovation"],
        "intro": "A whole-house renovation is a hundred small jobs that have to happen in the right order. We run them as one — demolition, structure, systems, finishes — so the house comes back together without the gaps that happen when five trades are each waiting on the others.",
        "hero": (f"{PH}/378-rutter/378rutter-01.jpg", "A rebuilt front room — new floors, trim and windows throughout"),
        "steps": [
            ("Survey & scope", "Every room walked, every system assessed. A fixed scope and a sequenced plan before anything comes out."),
            ("Strip out", "Back to the framing where it needs to be, no further than it has to be."),
            ("Structure & re-frame", "Load paths corrected, openings moved, new walls laid out for the new plan."),
            ("Systems", "Plumbing, electrical and HVAC run new through the open framing, inspected before close-up."),
            ("Board, tile & floor", "Drywall, bathrooms tiled, kitchens set, floors laid."),
            ("Finish & move back in", "Paint, trim, fixtures, hardware. One punch list, one handover."),
        ],
        "strip": [
            (f"{PH}/378-rutter/378rutter-early-02-23a44b8f.jpg", "After the fire — rafters charred through, new subfloor going down"),
            (f"{PH}/378-rutter/378rutter-early-05-c92fea12.jpg", "New stud walls going up against the old"),
            (f"{PH}/580-rutter/580rutter-05.jpg", "Back to bare studs and brick, ready to be re-framed"),
            (f"{PH}/378-rutter/378rutter-06.jpg", "The new stair — white balusters against stained treads"),
            (f"{PH}/580-rutter/580rutter-16.jpg", "Checkerboard tile set through the hall"),
            (f"{PH}/378-rutter/378rutter-08.jpg", "New kitchen, cabinets and counters set"),
        ],
        "cap_blurb": "Gut and finish work on existing houses.",
    },
    {
        "slug": "basement-finishing",
        "process_title": "How we finish a basement",
        "noun": "basement",
        "flow": "basement",
        "short": "Basement finishing",
        "h1": "Basement Finishing Contractor — Bedrooms, Baths & Living Space Below Grade",
        "title": "Basement Finishing Contractor · Kingston & Wilkes-Barre PA | PSI Construction",
        "description": "Basement build-outs and finishing across Luzerne County: egress, framing, full bathrooms, flooring and lighting. PSI turns unfinished lower levels into real living space.",
        "keywords": ["basement finishing contractor", "basement remodeling contractor", "finish basement contractor", "basement build out contractor"],
        "intro": "A finished basement is the cheapest square footage you will ever add — if it's done right. Moisture handled first, egress to code, a real bathroom, proper insulation and lighting. We've turned bare block-and-joist basements into bedrooms, baths and living rooms people forget are downstairs.",
        "hero": (f"{PH}/554-warren/554warren-07-5a667f25.jpg", "A new stair descending into a finished basement with plank flooring and recessed lighting"),
        "steps": [
            ("Moisture & egress check", "Walls, slab and drainage assessed; egress windows planned where bedrooms are going."),
            ("Layout & permits", "Rooms laid out around the structure and services that can't move. Permit filed."),
            ("Framing & rough-in", "Stud walls up, drain lines cut into the slab where a bathroom needs them, electrical and HVAC run."),
            ("Insulate & board", "Insulated against the block, vapour-controlled, drywalled and taped."),
            ("Bathroom & floors", "Tile, tub or shower, vanity; flooring run wall to wall."),
            ("Light, paint, hand over", "Recessed lighting, paint, doors and trim. A floor you'd never call a basement."),
        ],
        "strip": [
            (f"{PH}/554-warren/554warren-01-488f33f4.jpg", "Before — bare concrete walls and exposed joists"),
            (f"{PH}/841-nandy/841nandy-12.jpg", "The full basement framed, room by room"),
            (f"{PH}/841-nandy/841nandy-15.jpg", "Drain lines cut into the slab for the new bathroom"),
            (f"{PH}/554-warren/554warren-05-b0278efc.jpg", "Vertical green tile the full height of the tub surround"),
            (f"{PH}/841-nandy/841nandy-34.jpg", "The open basement living area, finished end to end"),
            (f"{PH}/569-meadowland/569meadowland-08.jpg", "The finished basement, shelving in and floor laid"),
        ],
        "cap_blurb": "Converting unfinished lower levels into fully usable living space.",
    },
    {
        "slug": "concrete-foundation",
        "process_title": "How we form, pour and finish concrete",
        "noun": "concrete",
        "flow": "concrete",
        "short": "Concrete & foundation work",
        "h1": "Concrete & Foundation Contractor — Slabs, Driveways, Footings & Walls",
        "title": "Concrete & Foundation Contractor · Kingston & Wilkes-Barre PA | PSI Construction",
        "description": "Foundations, footings, basement walls, garage slabs, driveways and patios in Luzerne County. PSI forms, pours and finishes concrete as part of the build or on its own.",
        "keywords": ["concrete contractor", "foundation contractor", "concrete driveway contractor", "foundation repair near me"],
        "intro": "Everything else sits on the concrete. We dig to the drawings, set footings below frost line, stand foundation walls square and level, and pour slabs that drain the right way — for our own builds and as standalone jobs.",
        "hero": (f"{PH}/55-reynolds/55reynolds-03-524232cb.jpg", "Precast foundation walls set on a stone base, ready for the first floor"),
        "steps": [
            ("Layout & excavation", "Lines set, excavation to depth, stone base compacted."),
            ("Footings", "Formed and poured below frost line, reinforced as the engineer specifies."),
            ("Walls", "Poured or precast foundation walls stood square, level and braced."),
            ("Waterproof & drain", "Membrane, footing drain and stone before any backfill."),
            ("Slabs & flatwork", "Vapour barrier, reinforcement, pour, finish — broom, trowel or decorative."),
            ("Cure & hand off", "Cured to strength and inspected before the next trade stands on it."),
        ],
        "strip": [
            (f"{PH}/55-reynolds/55reynolds-03-524232cb.jpg", "Precast foundation walls set, stone base inside"),
            (f"{PH}/55-reynolds/55reynolds-05-09252989.jpg", "Steel basement walls and the first partitions"),
            (f"{PH}/586-charles/586charles-05.jpg", "An old slab broken out and hauled away"),
            (f"{PH}/586-charles/586charles-06.jpg", "Stripped to bare block, new stone base down"),
            (f"{PH}/841-nandy/841nandy-15.jpg", "Drain lines cut into the slab"),
            (f"{PH}/55-reynolds/55reynolds-04-f4e736d3.jpg", "The first floor framed over the new foundation"),
        ],
        "cap_blurb": "Footings, walls, slabs and flatwork — formed, poured and finished.",
    },
    {
        "slug": "design-build",
        "process_title": "How design–build works",
        "noun": "design–build",
        "flow": "designbuild",
        "short": "Design–build & general contracting",
        "h1": "Design–Build Contractor & Licensed General Contractor — Luzerne County, PA",
        "title": "Design-Build General Contractor · Wilkes-Barre, Kingston & Back Mountain | PSI Construction",
        "description": "Licensed general contractor and design-build firm serving Wilkes-Barre, Kingston and the Back Mountain. One contract, one team, from drawings to keys.",
        "keywords": ["design build contractor", "licensed general contractor near me", "general contractor Wilkes-Barre", "general contractor Kingston PA"],
        "intro": "Design-build means one company is responsible for the drawings and for building them — so the budget is real from day one and nobody is pointing at anybody else. We've taken a garage to two apartments and a duplex to a single-family home that way.",
        "hero": (f"{PH}/586-charles/586charles-18.jpg", "An open-plan kitchen and living space, newly finished inside a converted garage"),
        "steps": [
            ("Brief & budget", "What you need, what it should cost, and what the building will allow — settled together."),
            ("Design & engineering", "Drawings developed with the build in mind, engineered and stamped."),
            ("Permits", "Filed, chased, and in hand before work starts."),
            ("Build", "One site team, one schedule, every trade sequenced by us."),
            ("Inspections", "Rough-in and final, booked and passed as part of the job."),
            ("Handover", "Walkthrough, punch list closed, documentation handed over."),
        ],
        "strip": [
            (f"{PH}/586-charles/586charles-01.jpg", "The garage as found"),
            (f"{PH}/586-charles/586charles-07.jpg", "First stud walls dividing the shell into two units"),
            (f"{PH}/586-charles/586charles-11.jpg", "The building rendered and re-trimmed outside"),
            (f"{PH}/586-charles/586charles-28.jpg", "Unit two — kitchen and living, finished"),
            (f"{PH}/580-rutter/580rutter-01.jpg", "A duplex before its conversion to single-family"),
            (f"{PH}/580-rutter/580rutter-13.jpg", "The same house — new kitchen, uppers hung and island in"),
        ],
        "cap_blurb": "Drawings, permits and construction under one contract.",
    },
    {
        "slug": "kitchen-remodeling",
        "process_title": "How we build a kitchen",
        "noun": "kitchen",
        "flow": "kitchen",
        "short": "Kitchens",
        "h1": "Kitchen Remodel Contractor — Full Gut Renovations to Custom Kitchens",
        "title": "Kitchen Remodel Contractor · Kingston & Wilkes-Barre PA | PSI Construction",
        "description": "Kitchen renovation contractor for Luzerne County: gut renovations, custom cabinetry, islands, quartz and tile. PSI runs the whole kitchen — demolition, services, cabinets, counters, finish.",
        "keywords": ["kitchen remodel contractor", "kitchen renovation contractor", "custom kitchen remodel", "kitchen remodeling near me"],
        "intro": "A kitchen is plumbing, electrical, cabinetry, stone, tile and lighting all landing in one room in the right order. We take it from the first drawing to the last pull on the last drawer — including the weeks you're living around it.",
        "hero": (f"{PH}/55-reynolds/55reynolds-22-9e709c49.jpg", "A finished kitchen — long island with pendants, range under a custom hood, tile to the ceiling"),
        "steps": [
            ("Design & layout", "Work triangle, storage, appliances and lighting planned on paper before anything is ordered."),
            ("Order & schedule", "Cabinets, stone and appliances ordered to lead times so nothing waits on anything."),
            ("Demolition", "Old kitchen out, services capped, floor protected."),
            ("Rough-in", "Plumbing and electrical moved to the new plan, inspected, then closed."),
            ("Cabinets & counters", "Cabinets set level and true, template made, stone cut and installed."),
            ("Tile, lighting, hardware", "Backsplash, pendants, pulls — and the first meal."),
        ],
        "strip": [
            (f"{PH}/55-reynolds/55reynolds-13-89dc6c57.jpg", "Kitchen cabinets going in"),
            (f"{PH}/55-reynolds/55reynolds-23-eb66b1b3.jpg", "Prep sink in the island, tall cabinets behind"),
            (f"{PH}/580-rutter/580rutter-13.jpg", "Uppers hung and island in"),
            (f"{PH}/586-charles/586charles-19.jpg", "A finished kitchen, appliances in"),
            (f"{PH}/289-reynolds/289reynolds-18-05691a24.jpg", "Island and pendants over new tile"),
            (f"{PH}/378-rutter/378rutter-08.jpg", "New kitchen, cabinets and counters set"),
        ],
        "cap_blurb": "Design, demolition, cabinets, counters and finish as one job.",
    },
    {
        "slug": "bathroom-remodeling",
        "process_title": "How we build a bathroom",
        "noun": "bathroom",
        "flow": "bathroom",
        "short": "Bathrooms",
        "h1": "Bathroom Remodeling Contractor — Full Baths, Walk-In Showers & Primary Suites",
        "title": "Bathroom Remodeling Contractor · Kingston & Wilkes-Barre PA | PSI Construction",
        "description": "Full bathroom remodels, walk-in showers and primary bath additions in Luzerne County. PSI handles waterproofing, tile, plumbing and finish — one contractor, no handoffs.",
        "keywords": ["bathroom remodeling contractors", "full bathroom remodel", "bathroom renovation contractors", "master bathroom renovation"],
        "intro": "Bathrooms fail at the waterproofing, years later, where you can't see it. So that is where we spend the care — substrate, membrane, slope — before a single tile goes on. The finish is the part you see; the part you don't is why it lasts.",
        "hero": (f"{PH}/50-reynolds/50reynolds-after-02-full.jpg", "An enlarged walk-in shower — built-in bench, hand shower, lit niche and charcoal tile"),
        "steps": [
            ("Plan & select", "Layout, fixtures, tile and lighting chosen together so they fit each other and the room."),
            ("Demolition", "Down to the studs where needed; the floor rebuilt from the structure if it has to carry tile."),
            ("Rough-in", "Supply, drain and electrical moved to the new plan, inspected."),
            ("Waterproof", "Cement board, membrane, every seam and corner sealed before tile."),
            ("Tile & set", "Floor, walls, niche, shower base pitched to the drain. Tub or shower set."),
            ("Fixtures & finish", "Vanity, glass, fixtures, mirror, lighting, paint."),
        ],
        "strip": [
            (f"{PH}/50-reynolds/50reynolds-before-shower.jpg", "The original stall before work"),
            (f"{PH}/139-third/139third-10.jpg", "Every seam sealed with waterproofing membrane before tile"),
            (f"{PH}/50-reynolds/50reynolds-after-01-running.jpg", "Rain head running, cove lighting on the charcoal tile"),
            (f"{PH}/549-charles/549charles-14.jpg", "Tub and surround with brushed gold fixtures"),
            (f"{PH}/139-third/139third-15.jpg", "Walk-in shower — frameless glass, pebble floor"),
            (f"{PH}/55-reynolds/55reynolds-27-1b8b3b91.jpg", "Freestanding tub beside a glass shower"),
        ],
        "cap_blurb": "Waterproofing, tile, plumbing and finish under one contract.",
    },
    {
        "slug": "roofing",
        "process_title": "How we replace a roof",
        "noun": "roofing",
        "flow": "roofing",
        "short": "Shingle roofing",
        "h1": "Shingle Roofing Contractor — Replacement & New Roofs in Luzerne County",
        "title": "Roofing Contractor · Shingle Roof Replacement, Kingston & Wilkes-Barre PA | PSI Construction",
        "description": "Asphalt shingle roof replacement and new roofs in Kingston, Wilkes-Barre and across Luzerne County. Decking, underlayment, flashing and shingles installed by the same crew that builds the house beneath them.",
        "keywords": ["roofing contractor", "shingle roof replacement", "roof replacement near me", "new roof contractor"],
        "intro": "We roof the houses we build, and we re-roof the ones we don't. Decking checked and replaced where it's gone, ice-and-water at the eaves and valleys, flashing done properly at every penetration — then the shingles. The part that keeps the water out is underneath.",
        "hero": (f"{PH}/378-rutter/378rutter-early-10-dc5e901c.jpg", "A newly completed shingle roof seen from above, on a PSI rebuild"),
        "steps": [
            ("Inspect & quote", "Decking, flashing, ventilation and the age of what's there. A fixed price, not an estimate."),
            ("Tear-off", "Old roofing stripped, decking exposed and checked board by board."),
            ("Deck repair", "Soft or rotted sheathing replaced before anything goes over it."),
            ("Underlayment & flashing", "Ice-and-water shield at eaves and valleys, synthetic underlayment, new flashing at every penetration."),
            ("Shingles & ventilation", "Architectural shingles laid to the manufacturer's spec; ridge vent and intake balanced."),
            ("Clean up & warranty", "Magnet sweep, haul-away, warranty paperwork in your hand."),
        ],
        "strip": [
            (f"{PH}/417-warren/417warren-07.jpg", "Roof sheathing going on"),
            (f"{PH}/417-warren/417warren-08.jpg", "Roof decked and ready for underlayment"),
            (f"{PH}/378-rutter/378rutter-early-09-4d34a6d9.jpg", "The new roof on"),
            (f"{PH}/378-rutter/378rutter-early-10-dc5e901c.jpg", "The finished roofline from above"),
            (f"{PH}/378-rutter/378rutter-15.jpg", "The top floor finished under the new roofline"),
            (f"{PH}/55-reynolds/55reynolds-45-612c0de4.jpg", "A completed new build, roof and all"),
        ],
        "cap_blurb": "Tear-off, decking, flashing and shingles — done properly underneath.",
    },
]

# ---------------------------------------------------------------------------
# Shared chrome. Paths are relative; pages live two levels down.
# ---------------------------------------------------------------------------
NAV = """    <nav class="nav nav--solid" id="topNav" aria-label="Primary">
      <a class="nav__brand" href="{R}index.html" aria-label="PSI Construction home">
        <img class="nav__logo nav__logo--onhero" src="{R}assets/logo/psi-logo-white.png" alt="PSI Construction" width="900" height="456" />
        <img class="nav__logo nav__logo--onsolid" src="{R}assets/logo/psi-logo.png" alt="" aria-hidden="true" width="900" height="456" />
      </a>
      <a class="nav__call" href="tel:5703388774" aria-label="Call PSI Construction">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1z"/></svg>
      </a>
      <button class="nav__toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="Open menu">
        <span class="nav__bars" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>
      <div class="nav__links" id="navLinks">
        <a href="{R}index.html#process">Our Process</a>
        <a href="{R}index.html#capabilities">Services</a>
        <a href="{R}index.html#projects">Previous Projects</a>
        <a href="{R}index.html#reviews">Reviews</a>
        <a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>
        <a class="nav__cta" href="#quote">Get a Quote</a>
      </div>
      <div class="nav__scrim" id="navScrim" hidden></div>
    </nav>
"""

FOOTER = """    <footer class="footer" id="contact">
      <div class="footer__inner">
        <div>
          <img class="footer__logo" src="{R}assets/logo/psi-logo-white.png" alt="PSI Construction" width="900" height="456" />
          <p class="footer__tagline">Built With Attention. Managed With Precision.</p>
        </div>
        <div class="footer__col">
          <p class="eyebrow">Office</p>
          190 Wyoming St, Wilkes-Barre, PA 18705<br />
          Visits available upon request
        </div>
        <div class="footer__col">
          <p class="eyebrow">Contact</p>
          <a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a><br />
          <a href="mailto:info@psiconstructionpa.com">info@psiconstructionpa.com</a><br />
          <a href="#quote">Get a Quote &rarr;</a>
        </div>
      </div>
    </footer>
"""

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
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "{short}",
      "serviceType": "{short}",
      "description": "{description}",
      "url": "{canonical}",
      "image": "{DOMAIN}/{hero_src}",
      "areaServed": [
        {{ "@type": "City", "name": "Kingston, PA" }},
        {{ "@type": "City", "name": "Wilkes-Barre, PA" }},
        {{ "@type": "AdministrativeArea", "name": "Luzerne County, PA" }}
      ],
      "provider": {{
        "@type": "GeneralContractor",
        "@id": "{DOMAIN}/#business",
        "name": "PSI Construction, LLC",
        "telephone": "+1-570-338-8774",
        "url": "{DOMAIN}/"
      }}
    }}
    </script>
  </head>
  <body class="svc-page">
{nav}
    <main>
      <!-- Hero: one real photograph of our work, the trade named plainly. -->
      <section class="svc-hero" aria-labelledby="svcTitle">
        <img class="svc-hero__img" src="{R}{hero_src}" alt="{hero_alt}" width="1600" height="1200" fetchpriority="high" decoding="async" />
        <div class="svc-hero__scrim" aria-hidden="true"></div>
        <div class="svc-hero__body section__inner">
          <p class="eyebrow svc-hero__eyebrow">PSI Construction · Kingston &amp; Wilkes-Barre, PA</p>
          <h1 class="svc-hero__title" id="svcTitle">{h1}</h1>
          <p class="svc-hero__lede">{intro}</p>
          <div class="svc-hero__actions">
            <a class="btn" href="#quote">Get a {noun} quote</a>
            <a class="svc-hero__phone" href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>
          </div>
        </div>
      </section>

      <!-- The process for this trade. Same shape as How We Build on the home
           page, written for this kind of job. -->
      <section class="section svc-process" id="process" aria-labelledby="svcProcessTitle">
        <div class="section__inner">
          <p class="eyebrow">How it goes</p>
          <h2 class="section__title" id="svcProcessTitle">{process_title}</h2>
          <ol class="svc-steps">
{steps}
          </ol>
        </div>
      </section>

      <!-- Our own photographs of this kind of work. -->
      <section class="section svc-work" aria-labelledby="svcWorkTitle">
        <div class="section__inner">
          <p class="eyebrow">From our jobs</p>
          <h2 class="section__title" id="svcWorkTitle">{short} we have built</h2>
          <p class="lede">Every photograph here is a PSI job in Luzerne County. <a href="{R}index.html#projects">See all 290+ photographs on the map &rarr;</a></p>
        </div>
        <div class="svc-strip" role="list">
{strip}
        </div>
      </section>

      <!-- The quote form, opened straight onto this trade. -->
      <section class="section svc-quote" id="quote" aria-labelledby="svcQuoteTitle">
        <div class="section__inner">
          <p class="eyebrow">Get a quote</p>
          <h2 class="section__title" id="svcQuoteTitle">Tell us about your {noun} project</h2>
          <p class="lede">A few multiple-choice questions so we show up already knowing the job. Every one has a &ldquo;not sure yet&rdquo; option. Or call &mdash; <a href="tel:5703388774">570-338-8<span class="tel-psi">PSI</span> (774)</a>.</p>
          <div class="contact-box svc-quote__box">
            <div id="quoteApp" data-flow="{flow}"></div>
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
  </body>
</html>
"""

STEP = """            <li class="svc-step">
              <p class="svc-step__n">{n}</p>
              <div>
                <h3>{t}</h3>
                <p class="svc-step__d">{d}</p>
              </div>
            </li>"""

SHOT = """          <figure class="svc-shot" role="listitem">
            <img src="{R}{src}" alt="{alt}" loading="lazy" decoding="async" />
            <figcaption>{alt}</figcaption>
          </figure>"""

CAP = """      <li class="cap{featured}">
        <a class="cap__link" href="services/{slug}/">
          <img class="cap__img" src="assets/services/svc-{n:02d}.jpg" alt="{alt}" loading="{loading}"{prio} decoding="async" />
          <div class="cap__scrim"></div>
          <div class="cap__body">
            <span class="cap__num">{n}</span>
            <h3>{short}</h3>
            <p>{blurb}</p>
            <span class="cap__more">See the work &rarr;</span>
          </div>
        </a>
      </li>"""


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;")


def build_pages():
    R = "../../"
    for i, s in enumerate(SERVICES, 1):
        hero_src, hero_alt = s["hero"]
        steps = "\n".join(STEP.format(n=n, t=esc(t), d=esc(d)) for n, (t, d) in enumerate(s["steps"], 1))
        strip = "\n".join(SHOT.format(R=R, src=src, alt=esc(alt)) for src, alt in s["strip"])
        html = PAGE.format(
            R=R, DOMAIN=DOMAIN,
            title=esc(s["title"]), description=esc(s["description"]),
            canonical=f"{DOMAIN}/services/{s['slug']}/",
            hero_src=hero_src, hero_alt=esc(hero_alt),
            short=esc(s["short"]), short_lc=esc(s["short"].lower()), noun=esc(s["noun"]), process_title=esc(s["process_title"]),
            h1=esc(s["h1"]), intro=esc(s["intro"]), flow=s["flow"],
            steps=steps, strip=strip,
            nav=NAV.format(R=R), footer=FOOTER.format(R=R),
        )
        out = os.path.join(ROOT, "services", s["slug"])
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, "index.html"), "w") as fh:
            fh.write(html)
        print("page  services/%s/" % s["slug"])


def build_cap_images():
    """One 1500px JPEG per service for the home-page grid, cut from its hero."""
    out = os.path.join(ROOT, "assets", "services")
    os.makedirs(out, exist_ok=True)
    for i, s in enumerate(SERVICES, 1):
        src = os.path.join(ROOT, s["hero"][0])
        dst = os.path.join(out, "svc-%02d.jpg" % i)
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82",
                        "-Z", "1500", src, "--out", dst],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("images assets/services/svc-01..%02d.jpg" % len(SERVICES))


def build_home_grid():
    p = os.path.join(ROOT, "index.html")
    s = open(p).read()
    items = []
    for i, svc in enumerate(SERVICES, 1):
        items.append(CAP.format(
            featured=" cap--featured" if i == 1 else "",
            slug=svc["slug"], n=i, alt=esc(svc["hero"][1]),
            loading="eager" if i == 1 else "lazy",
            prio=' fetchpriority="high"' if i == 1 else "",
            short=esc(svc["short"]), blurb=esc(svc["cap_blurb"]),
        ))
    grid = '<ol class="caps__grid">\n' + "\n".join(items) + "\n      </ol>"
    new, n = re.subn(r'<ol class="caps__grid">.*?</ol>', lambda m: grid, s, count=1, flags=re.S)
    assert n == 1, "caps grid not found on index.html"
    open(p, "w").write(new)
    print("home  What We Build grid rewritten with %d linked items" % len(SERVICES))


def build_sitemap():
    today = "2026-10-29"
    urls = [f"""  <url>
    <loc>{DOMAIN}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{DOMAIN}/contact.html</loc>
    <lastmod>{today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
  </url>"""]
    for s in SERVICES:
        urls.append(f"""  <url>
    <loc>{DOMAIN}/services/{s['slug']}/</loc>
    <lastmod>{today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>""")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<!-- The home page, the quote page, and one landing page per service.\n'
           '     The redirect stubs for the old site\'s addresses are deliberately\n'
           '     absent: they exist only to hand a visitor onward. -->\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(urls) + "\n</urlset>\n")
    open(os.path.join(ROOT, "sitemap.xml"), "w").write(xml)
    print("sitemap %d urls" % (len(SERVICES) + 2))


if __name__ == "__main__":
    for s in SERVICES:
        for src in [s["hero"][0]] + [x[0] for x in s["strip"]]:
            if not os.path.exists(os.path.join(ROOT, src)):
                sys.exit("missing photograph: " + src)
    build_cap_images()
    build_pages()
    build_home_grid()
    build_sitemap()
