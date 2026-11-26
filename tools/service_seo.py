"""Local-search content for the service landing pages: the towns each page
names, and the questions each page answers. Read by build-services.py.

Every answer here states only what PSI already says elsewhere on the site
(fixed price before work starts, permits pulled by us, one contractor for
the whole job, HIC licence) — no prices or durations PSI has not committed to.
"""

# Core service area: roughly 25 miles around Kingston, Scranton included.
TOWNS = [
    "Kingston", "Wilkes-Barre", "Forty Fort", "Wyoming", "West Pittston", "Exeter",
    "Swoyersville", "Luzerne", "Edwardsville", "Plymouth", "Nanticoke", "Plains",
    "Pittston", "Dallas", "Shavertown", "Trucksville", "Mountain Top",
    "Hanover Township", "Scranton",
]

# Larger jobs travel further (about an hour). Named only on the pages for
# work big enough to justify the drive.
FAR = "Lake Wallenpaupack, Hamlin and the Poconos"
TRAVELS = {"new-home-construction", "home-additions", "whole-home-renovation", "design-build"}

LICENCE = "PSI Construction, LLC is a registered Pennsylvania home improvement contractor, PA HIC #213035, and carries insurance for the work we do."

PERMITS = "Yes. We pull the permits, deal with the township and book the inspections as part of the job, so you are not chasing paperwork while the work is running."


def area_answer(slug, noun):
    base = ("Our office is at 190 Wyoming Street in Wilkes-Barre. We take %s work across Luzerne County "
            "and into Lackawanna County — Kingston, Wilkes-Barre, Forty Fort, Wyoming, West Pittston, "
            "Pittston, the Back Mountain, Mountain Top, Nanticoke and Scranton." % noun)
    if slug in TRAVELS:
        base += " For larger projects we travel further, up to about an hour away — %s." % FAR
    return base


FAQ = {
    "new-home-construction": [
        ("Can you build on a lot I already own?",
         "Yes. Most of our new homes go on the owner's own land. We walk the lot first — access, slope, soil, where water and sewer or well and septic will come from — so the site work is in the price rather than a surprise after excavation starts."),
        ("Do I need my own plans?",
         "No. Bring plans if you have them and we will price them as drawn. If you don't, we work with designers and engineers to produce drawings built around your budget, then build them — one company answerable for both."),
        ("How is a new home priced?",
         "You get a written, itemised price once the plans and selections are settled, before ground is broken. Allowances for finishes you haven't chosen yet are listed separately, so you can see exactly what moves the number."),
    ],
    "home-additions": [
        ("Can my house take a second storey?",
         "Often, but it depends on the foundation and the existing framing. We check what the structure can carry and bring in an engineer where it needs one before you commit to a design. We have taken a one-storey house to a full second floor."),
        ("Will the addition match the house?",
         "That is the point of doing it properly. Rooflines, siding, windows, trim and floor heights are planned so the new work reads as original, and the seam inside between old and new is finished so you can't find it."),
        ("Do you handle the plumbing and electrical in an addition?",
         "Yes. Plumbing, electrical and HVAC are extended into the addition as part of the same contract, inspected before the walls close."),
    ],
    "whole-home-renovation": [
        ("Can you renovate a house after a fire or water damage?",
         "Yes. We have rebuilt a house after a fire took the roof structure, and we work on insurance repairs. We strip back to what is sound, correct the structure, and rebuild the systems and finishes as one job."),
        ("Do you work on rental properties and multi-family buildings?",
         "Yes. We renovate rentals, turn duplexes into single-family homes and the other way round, and do turnovers for landlords and property managers."),
        ("How do you keep a big renovation on budget?",
         "Every room is walked and every system assessed before a fixed scope and price are written. Work is sequenced by one team, so trades are not waiting on each other, and anything that changes is priced and agreed in writing before it is done."),
    ],
    "basement-finishing": [
        ("My basement gets damp. Can it still be finished?",
         "Usually, once the moisture is dealt with. We assess the walls, slab and drainage first and fix the cause before anything is framed. Finishing over a wet basement only hides the problem."),
        ("Can you add a bathroom in the basement?",
         "Yes. We cut the slab for drain lines where the bathroom needs them, then build a full bath — tile, shower or tub, vanity — like any other floor of the house."),
        ("Can a basement room be a legal bedroom?",
         "A bedroom below grade needs a code-compliant egress window, among other things. We plan egress where bedrooms are going and pull the permit so the space is legal, not just finished."),
    ],
    "concrete-foundation": [
        ("Do you pour concrete as a standalone job?",
         "Yes. We form and pour concrete for our own builds and as separate jobs — footings, foundation walls, garage and basement slabs, driveways, walkways and patios."),
        ("Do you waterproof foundations?",
         "Yes. New foundation walls get a membrane, footing drain and stone before any backfill."),
        ("Can you replace a cracked or settled slab?",
         "Yes. We break out and haul away the old slab, rebuild the base properly, and pour new — reinforced and sloped to drain the right way."),
    ],
    "design-build": [
        ("What is design-build?",
         "One company is responsible for the drawings and for building them. The design is developed with real construction costs in view, so the budget holds from day one, and there is one contract and one point of responsibility instead of an architect and a builder pointing at each other."),
        ("Are you a licensed general contractor?",
         LICENCE),
        ("Do you do commercial work?",
         "Yes — interior build-outs, restroom and office renovations, and conversions such as a garage into two apartments. We also bid public and institutional work."),
    ],
    "kitchen-remodeling": [
        ("Can we live in the house while you redo the kitchen?",
         "Most clients do. We seal the work area, protect the floors, and plan the order of work around the time you are without a kitchen, so cabinets, stone and appliances arrive when they are needed rather than holding the job up."),
        ("Do you supply cabinets and countertops?",
         "Yes. Cabinets, quartz or stone, tile and lighting are selected with you and ordered by us to lead times, then installed by the same team that does the demolition and rough-in."),
        ("Can you move plumbing or take out a wall?",
         "Yes. Plumbing and electrical are moved to the new layout and inspected; where a wall comes out we size the beam and get it engineered if it is bearing."),
    ],
    "bathroom-remodeling": [
        ("Can you turn a tub into a walk-in shower?",
         "Yes. It is one of the most common jobs we do. The tub comes out, the floor and walls are rebuilt and waterproofed, and the shower is built with a pre-sloped pan, a proper drain, and a niche or bench if you want one."),
        ("How do you stop a new shower from leaking?",
         "Cement board, a waterproofing membrane over every wall and the floor, every seam and corner sealed, and the shower pan flood-tested before any tile is set. It is the slowest stage of the job on purpose."),
        ("Do you handle the plumbing and electrical?",
         "Yes. Supply and drain lines, the shower valve, lighting, the exhaust fan and a heated floor if you want one are all part of the same contract, inspected before the walls close."),
    ],
    "roofing": [
        ("Do you replace rotted roof decking?",
         "Yes. Once the old roof is off, the decking is checked board by board, and soft or rotted sheathing is replaced before anything goes over it."),
        ("What goes under the shingles?",
         "Ice-and-water shield at the eaves and valleys, synthetic underlayment everywhere else, and new flashing at every chimney, vent and wall. That layer is what keeps the water out."),
        ("Do you clean up after a roof job?",
         "Yes. Old roofing is hauled away and the yard and driveway are swept with a magnet for nails before we leave."),
    ],
}


def faqs(slug, noun):
    """The page's questions: its own, then permits, area and licence."""
    out = list(FAQ[slug])
    out.append(("Do you pull the permits?", PERMITS))
    out.append(("What areas do you serve?", area_answer(slug, noun)))
    if not any(q.startswith("Are you a licensed") for q, _ in out):
        out.append(("Are you licensed and insured?", LICENCE))
    return out
