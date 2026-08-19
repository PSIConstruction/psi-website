/* ============================================================
   PSI Previous Projects — source data
   Addresses & municipalities: "Kingston-PA-Construction-Property-List"
   (Kingston, PA Construction · submitted by Sadya Liberov, June 9 2026).
   55 Reynolds Street: filed permit set (TGL Engineering) in
   "3D WALKTHROUGH/424-426 Rutter (filed plans).pdf" — filed under the
   property's former address, 424-426 Rutter Avenue, before rezoning.
   Its map pin keeps the Esri PointAddress returned for the Rutter
   address: that is the authoritative rooftop point for this building,
   whereas "55 Reynolds St" resolves only to an interpolated
   StreetAddress.

   Coordinates (Aug 2026) come from the Esri World Geocoder, which
   returned Addr_type=PointAddress — an authoritative parcel/rooftop
   point — at score 99-100 for every address below.

   The previous values were TIGER street-line interpolation via
   Nominatim: OSM publishes almost no real address points in Kingston
   (1 of 32 matched an actual record), so those pins were estimates
   placed along the street, typically 15-50 m out and occasionally far
   worse. 50 Reynolds Street was 141 m off and reported wrong by the
   owner, which is what prompted the re-sourcing.

   Not independently cross-checked: the Census geocoder blocks
   automated requests, and OSM building coverage here is too sparse to
   test the points against footprints. Esri is a single source.
   Photos: PSI photo library (representative PSI portfolio photography).
   ============================================================ */
window.PSI_PROJECTS = [
  {
    name: "55 Reynolds Street",
    city: "Kingston, PA 18704",
    lat: 41.265253, lng: -75.889529,
    id: "corner-new-build",
    type: "New Construction — 3-Story Residence",
    desc: "New three-story residence at the corner of Rutter Avenue and Reynolds Street — 4,752 sq ft, Residential (R-1), built to the 2018 IRC/IBC. Originally addressed 424–426 Rutter Avenue; re-addressed to 55 Reynolds Street on rezoning. Featured in the aerial opener on this page.",
    img: "assets/keyframe-final-hero.png",
    caption: "Three-storey white stucco residence with black-framed windows on a landscaped corner lot",
    plans: "assets/plans/424-426-Rutter-filed-plans.pdf"
  },
  { name: "50 Reynolds Street",  city: "Kingston, PA", lat: 41.2657563, lng: -75.8895245,
    id: "shower-closet-merge",
    type: "Small Shower Enlarged \u2192 Walk-In",
    desc: "A cramped corner shower rebuilt at nearly double the footprint by taking in the closet next door.",
    img: "assets/photos/50-reynolds/50reynolds-after-01-running.jpg",
    caption: "Ceiling-mounted rain head running over charcoal marble-look tile and a penny-round mosaic floor",
    gallery: [
      { src: "assets/photos/50-reynolds/50reynolds-before-shower.jpg", phase: "before", cap: "The original stall \u2014 white square tile, three exposed valves, barely a shoulder wide" },
      { src: "assets/photos/50-reynolds/50reynolds-before-closet.jpg", phase: "before", cap: "The neighbouring closet that was absorbed to gain the width" },
      { src: "assets/photos/50-reynolds/50reynolds-after-01-running.jpg", phase: "after", cap: "Ceiling rain head running, cove lighting washing the charcoal tile" },
      { src: "assets/photos/50-reynolds/50reynolds-after-02-full.jpg", phase: "after", cap: "The full enlarged enclosure \u2014 built-in bench, hand shower, lit niche" },
      { src: "assets/photos/50-reynolds/50reynolds-after-03-niche.jpg", phase: "after", cap: "Penny-round mosaic carried from the niche onto the shower floor" }
    ] },
  { name: "289 Reynolds Street", city: "Kingston, PA", lat: 41.262829, lng: -75.8873066, img: "assets/photos/PSI_Bathroom_MasterSuite_TubAndShower_01.jpg", caption: "Primary bath — tub and shower" },
  { name: "554 Warren Avenue",   city: "Kingston, PA", lat: 41.264622, lng: -75.8840499, img: "assets/photos/PSI_GreatRoom_Chandeliers_01.jpg", caption: "Great room with chandeliers" },
  { name: "453 Warren Avenue",   city: "Kingston, PA", lat: 41.2629624, lng: -75.8861046, img: "assets/photos/PSI_Exterior_Twilight_Facade_Windows_01.jpg", caption: "Twilight facade" },
  { name: "417 Warren Avenue",   city: "Kingston, PA", lat: 41.26234, lng: -75.88709, img: "assets/photos/PSI_Bathroom_FreestandingTub_Marble_01.jpg", caption: "Freestanding tub in marble bath" },
  { name: "505 Warren Avenue",   city: "Kingston, PA", lat: 41.2635724, lng: -75.885076, img: "assets/photos/PSI_Kitchen_Island_Greige_01.jpg", caption: "Greige kitchen island" },
  { name: "192 James Street",    city: "Kingston, PA", lat: 41.2645332, lng: -75.885262,
    id: "porch-to-master-bath",
    type: "Porch Enclosure \u2192 Master Bathroom",
    desc: "An exterior porch off the master bedroom, enclosed and converted into the master bathroom, with heated tile floors.",
    img: "assets/photos/192-james/192james-after-01-overview.jpg",
    caption: "The finished master bathroom",
    gallery: [
      { src: "assets/photos/192-james/192james-before-porch.jpg",   phase: "before", cap: "The original exterior porch off the master bedroom" },
      { src: "assets/photos/192-james/192james-after-01-overview.jpg", phase: "after", cap: "The enclosed space as a full master bathroom" },
      { src: "assets/photos/192-james/192james-after-02-shower.jpg",  phase: "after", cap: "Rainfall shower and hand shower in brushed gold" },
      { src: "assets/photos/192-james/192james-after-03-vanity.jpg",  phase: "after", cap: "Floating vanity and backlit mirror, window retained" },
      { src: "assets/photos/192-james/192james-after-04-doorway.jpg", phase: "after", cap: "Full-height tile carried through to the bedroom doorway" },
      { src: "assets/photos/192-james/192james-after-05-mirror.jpg",  phase: "after", cap: "Quartz top with undermount basin" }
    ] },
  { name: "194 James Street",    city: "Kingston, PA", lat: 41.2644226, lng: -75.8851439, img: "assets/photos/PSI_Exterior_Twilight_FrontCorner_01.jpg", caption: "Twilight exterior — front corner" },
  { name: "145 James Street",    city: "Kingston, PA", lat: 41.2653089, lng: -75.8867047, img: "assets/photos/PSI_Bathroom_GreenTile_WalkInShower_01.jpg", caption: "Green-tile walk-in shower" },
  { name: "225 James Street",    city: "Kingston, PA", lat: 41.263393, lng: -75.8848405, img: "assets/photos/PSI_Exterior_Daytime_FrontFacade_01.jpg", caption: "Front facade, daytime" },
  { name: "378 Rutter Avenue",   city: "Kingston, PA", lat: 41.2641819, lng: -75.8913887, img: "assets/photos/PSI_GreatRoom_Staircase_Evening_01.jpg", caption: "Great room staircase, evening" },
  { name: "580 Rutter Avenue",   city: "Kingston, PA", lat: 41.2675627, lng: -75.8854114, img: "assets/photos/PSI_Bathroom_GoldVeinMarble_Vanity_01.jpg", caption: "Gold-vein marble vanity" },
  { name: "615 Charles Avenue",  city: "Kingston, PA", lat: 41.2684404, lng: -75.8850129, img: "assets/photos/PSI_Exterior_Twilight_HedgeRow_01.jpg", caption: "Twilight hedge row" },
  { name: "610 Charles Avenue",  city: "Kingston, PA", lat: 41.2687324, lng: -75.8855237, img: "assets/photos/PSI_Kitchen_Greige_Island_02.jpg", caption: "Kitchen island detail" },
  { name: "586 Charles Avenue",  city: "Kingston, PA", lat: 41.268337, lng: -75.8861642, img: "assets/photos/PSI_Bathroom_FloatingVanity_BacklitMirror_01.jpg", caption: "Floating vanity, backlit mirror" },
  { name: "549 Charles Avenue",  city: "Kingston, PA", lat: 41.2672893, lng: -75.8870645, img: "assets/photos/PSI_GreatRoom_Sliders_DrumLights_01.jpg", caption: "Great room — sliders and drum lights" },
  { name: "841 Nandy Drive",     city: "Kingston, PA", lat: 41.2673536, lng: -75.8764808, img: "assets/photos/PSI_Exterior_Daytime_RearYard_01.jpg", caption: "Rear yard, daytime" },
  { name: "836 Nandy Drive",     city: "Kingston, PA", lat: 41.2674656, lng: -75.8771667, img: "assets/photos/PSI_Bathroom_NavyVanity_MarbleWall_01.jpg", caption: "Navy vanity, marble wall" },
  { name: "597 Gibson Avenue",   city: "Kingston, PA", lat: 41.2657666, lng: -75.8832229, img: "assets/photos/PSI_Sauna_CedarInterior_01.jpg", caption: "Cedar sauna interior" },
  { name: "663 Gibson Avenue",   city: "Kingston, PA", lat: 41.266847, lng: -75.8812817, img: "assets/photos/PSI_Staircase_RusticTreads_01.jpg", caption: "Rustic-tread staircase" },
  { name: "230 Butler Street",   city: "Kingston, PA", lat: 41.2628665, lng: -75.8851358, img: "assets/photos/PSI_Bathroom_GoldVeinMarble_Tub_01.jpg", caption: "Gold-vein marble tub" },
  { name: "141 Butler Street",   city: "Kingston, PA", lat: 41.2645456, lng: -75.8875422, img: "assets/photos/PSI_Exterior_Detail_SoffitUplight_01.jpg", caption: "Soffit uplight detail" },
  { name: "55 Butler Street",    city: "Kingston, PA", lat: 41.266377, lng: -75.8892908, img: "assets/photos/PSI_Bathroom_GreenTile_TubShower_01.jpg", caption: "Green-tile tub and shower" },
  { name: "790 Market Street",   city: "Kingston, PA", lat: 41.263591, lng: -75.8992154, img: "assets/photos/PSI_Bathroom_MasterSuite_TubAndShower_02.jpg", caption: "Primary suite bath" },
  { name: "59 Parry Street",     city: "Luzerne, PA 18709", lat: 41.285194, lng: -75.898548, img: "assets/photos/PSI_BA-01_Site_AFTER_FinishedTwilight.jpg", caption: "New build complete — twilight" },
  { name: "250 Courtdale Avenue",city: "Courtdale, PA", lat: 41.2796392, lng: -75.9115148, img: "assets/photos/PSI_BA-02_GreatRoom_AFTER_Finished.jpg", caption: "Great room, finished" },
  { name: "139 Third Avenue",    city: "Kingston, PA", lat: 41.256831, lng: -75.886044, img: "assets/photos/PSI_BA-03_Interior_AFTER_LVP_OpenRoom.jpg", caption: "Open room — new LVP flooring" },
  { name: "117 North Gates Avenue", city: "Kingston, PA", lat: 41.2576975, lng: -75.8880323, img: "assets/photos/PSI_Twilight_Front_Driveway_05.jpg", caption: "Twilight driveway" },
  { name: "569 Meadowland Avenue", city: "Kingston, PA", lat: 41.2635766, lng: -75.8827472, img: "assets/photos/PSI_Deck_Railing_View_01.jpg", caption: "Deck and railing" },
  { name: "102 Westminster Street", city: "Wilkes-Barre, PA", lat: 41.235764, lng: -75.904863, img: "assets/photos/PSI_Night_FrontWalkway_01.jpg", caption: "Front walkway at night" },
  { name: "80 North Washington Street", city: "Wilkes-Barre, PA", lat: 41.2458296, lng: -75.8793543, img: "assets/photos/PSI_FrontEntry_Night_TealCanopy_01.jpg", caption: "Front entry at night" },
  { name: "320 Pacific Avenue",  city: "West Pittston, PA", lat: 41.326214, lng: -75.8079539, img: "assets/photos/PSI_Driveway_NewAsphalt_01.jpg", caption: "New asphalt driveway" },
  { name: "110 Barber Street",   city: "Exeter, PA", lat: 41.3198988, lng: -75.8219443, img: "assets/photos/PSI_Twilight_StreetCorner_01.jpg", caption: "Street corner, twilight" }
];

window.PSI_OFFICE = {
  name: "PSI Construction — Office",
  address: "190 Wyoming St, Wilkes-Barre, PA 18705",
  lat: 41.2509280, lng: -75.8684020
};
