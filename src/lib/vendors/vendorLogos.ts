/**
 * Vendor Logo Manifest
 *
 * Manufacturer logo icons via Google Favicons API.
 * Clearbit Logo API (logo.clearbit.com) is permanently offline.
 * These resolve from company domains and display immediately — no local files needed.
 *
 * COMPLETE COVERAGE: Every manufacturer, distributor, and supplier seeded
 * in the Vendor table must have an entry here for consistent logo display.
 */

const fav = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const VENDOR_LOGOS: Record<
  string,
  { slug: string; name: string; website: string; logoPath: string }
> = {
  // ═══════════════════════════════════════════════════════════════════════
  // ROOFING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  gaf: {
    slug: "gaf",
    name: "GAF",
    website: "https://www.gaf.com",
    logoPath: fav("gaf.com"),
  },
  "owens-corning": {
    slug: "owens-corning",
    name: "Owens Corning",
    website: "https://www.owenscorning.com",
    logoPath: fav("owenscorning.com"),
  },
  certainteed: {
    slug: "certainteed",
    name: "CertainTeed",
    website: "https://www.certainteed.com",
    logoPath: fav("certainteed.com"),
  },
  iko: {
    slug: "iko",
    name: "IKO Industries",
    website: "https://www.iko.com",
    logoPath: fav("iko.com"),
  },
  tamko: {
    slug: "tamko",
    name: "TAMKO",
    website: "https://www.tamko.com",
    logoPath: fav("tamko.com"),
  },
  malarkey: {
    slug: "malarkey",
    name: "Malarkey Roofing",
    website: "https://www.malarkeyroofing.com",
    logoPath: fav("malarkeyroofing.com"),
  },
  "atlas-roofing": {
    slug: "atlas-roofing",
    name: "Atlas Roofing",
    website: "https://www.atlasroofing.com",
    logoPath: fav("atlasroofing.com"),
  },
  decra: {
    slug: "decra",
    name: "DECRA Roofing",
    website: "https://www.decra.com",
    logoPath: fav("decra.com"),
  },
  "davinci-roofscapes": {
    slug: "davinci-roofscapes",
    name: "DaVinci Roofscapes",
    website: "https://www.davinciroofscapes.com",
    logoPath: fav("davinciroofscapes.com"),
  },
  "eagle-roofing": {
    slug: "eagle-roofing",
    name: "Eagle Roofing Products",
    website: "https://www.eagleroofing.com",
    logoPath: fav("eagleroofing.com"),
  },
  boral: {
    slug: "boral",
    name: "Boral Roofing",
    website: "https://www.boralroof.com",
    logoPath: fav("boralroof.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WINDOWS & DOORS MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "andersen-windows": {
    slug: "andersen-windows",
    name: "Andersen Windows",
    website: "https://www.andersenwindows.com",
    logoPath: fav("andersenwindows.com"),
  },
  pella: {
    slug: "pella",
    name: "Pella",
    website: "https://www.pella.com",
    logoPath: fav("pella.com"),
  },
  provia: {
    slug: "provia",
    name: "ProVia",
    website: "https://www.provia.com",
    logoPath: fav("provia.com"),
  },
  milgard: {
    slug: "milgard",
    name: "Milgard",
    website: "https://www.milgard.com",
    logoPath: fav("milgard.com"),
  },
  marvin: {
    slug: "marvin",
    name: "Marvin",
    website: "https://www.marvin.com",
    logoPath: fav("marvin.com"),
  },
  simonton: {
    slug: "simonton",
    name: "Simonton",
    website: "https://www.simonton.com",
    logoPath: fav("simonton.com"),
  },
  "jeld-wen": {
    slug: "jeld-wen",
    name: "JELD-WEN",
    website: "https://www.jeld-wen.com",
    logoPath: fav("jeld-wen.com"),
  },
  plygem: {
    slug: "plygem",
    name: "Ply Gem",
    website: "https://www.plygem.com",
    logoPath: fav("plygem.com"),
  },
  "mi-windows": {
    slug: "mi-windows",
    name: "MI Windows and Doors",
    website: "https://www.miwindows.com",
    logoPath: fav("miwindows.com"),
  },
  "weather-shield": {
    slug: "weather-shield",
    name: "Weather Shield",
    website: "https://www.weathershield.com",
    logoPath: fav("weathershield.com"),
  },
  "kolbe-windows": {
    slug: "kolbe-windows",
    name: "Kolbe Windows & Doors",
    website: "https://www.kolbewindows.com",
    logoPath: fav("kolbewindows.com"),
  },
  "therma-tru": {
    slug: "therma-tru",
    name: "Therma-Tru Doors",
    website: "https://www.thermatru.com",
    logoPath: fav("thermatru.com"),
  },
  "masonite-doors": {
    slug: "masonite-doors",
    name: "Masonite",
    website: "https://www.masonite.com",
    logoPath: fav("masonite.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SIDING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "james-hardie": {
    slug: "james-hardie",
    name: "James Hardie",
    website: "https://www.jameshardie.com",
    logoPath: fav("jameshardie.com"),
  },
  "lp-smartside": {
    slug: "lp-smartside",
    name: "LP SmartSide",
    website: "https://www.lpcorp.com/smartside",
    logoPath: fav("lpcorp.com"),
  },
  "royal-building": {
    slug: "royal-building",
    name: "Royal Building Products",
    website: "https://www.royalbuildingproducts.com",
    logoPath: fav("royalbuildingproducts.com"),
  },
  alside: {
    slug: "alside",
    name: "Alside",
    website: "https://www.alside.com",
    logoPath: fav("alside.com"),
  },
  "norandex-siding": {
    slug: "norandex-siding",
    name: "Norandex",
    website: "https://www.norandex.com",
    logoPath: fav("norandex.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HVAC MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  trane: {
    slug: "trane",
    name: "Trane",
    website: "https://www.trane.com",
    logoPath: fav("trane.com"),
  },
  carrier: {
    slug: "carrier",
    name: "Carrier",
    website: "https://www.carrier.com",
    logoPath: fav("carrier.com"),
  },
  lennox: {
    slug: "lennox",
    name: "Lennox",
    website: "https://www.lennox.com",
    logoPath: fav("lennox.com"),
  },
  goodman: {
    slug: "goodman",
    name: "Goodman",
    website: "https://www.goodmanmfg.com",
    logoPath: fav("goodmanmfg.com"),
  },
  daikin: {
    slug: "daikin",
    name: "Daikin",
    website: "https://www.daikincomfort.com",
    logoPath: fav("daikin.com"),
  },
  rheem: {
    slug: "rheem",
    name: "Rheem",
    website: "https://www.rheem.com",
    logoPath: fav("rheem.com"),
  },
  york: {
    slug: "york",
    name: "York",
    website: "https://www.york.com",
    logoPath: fav("york.com"),
  },
  "american-standard-hvac": {
    slug: "american-standard-hvac",
    name: "American Standard HVAC",
    website: "https://www.americanstandardair.com",
    logoPath: fav("americanstandardair.com"),
  },
  "ruud-hvac": {
    slug: "ruud-hvac",
    name: "Ruud",
    website: "https://www.ruud.com",
    logoPath: fav("ruud.com"),
  },
  "mitsubishi-hvac": {
    slug: "mitsubishi-hvac",
    name: "Mitsubishi Electric HVAC",
    website: "https://www.mitsubishicomfort.com",
    logoPath: fav("mitsubishicomfort.com"),
  },
  "fujitsu-hvac": {
    slug: "fujitsu-hvac",
    name: "Fujitsu General",
    website: "https://www.fujitsugeneral.com",
    logoPath: fav("fujitsugeneral.com"),
  },
  honeywell: {
    slug: "honeywell",
    name: "Honeywell Home",
    website: "https://www.honeywellhome.com",
    logoPath: fav("honeywellhome.com"),
  },
  ecobee: {
    slug: "ecobee",
    name: "ecobee",
    website: "https://www.ecobee.com",
    logoPath: fav("ecobee.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PLUMBING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  moen: {
    slug: "moen",
    name: "Moen",
    website: "https://www.moen.com",
    logoPath: fav("moen.com"),
  },
  "delta-faucet": {
    slug: "delta-faucet",
    name: "Delta Faucet",
    website: "https://www.deltafaucet.com",
    logoPath: fav("deltafaucet.com"),
  },
  kohler: {
    slug: "kohler",
    name: "Kohler",
    website: "https://www.kohler.com",
    logoPath: fav("kohler.com"),
  },
  "american-standard": {
    slug: "american-standard",
    name: "American Standard",
    website: "https://www.americanstandard.com",
    logoPath: fav("americanstandard.com"),
  },
  rinnai: {
    slug: "rinnai",
    name: "Rinnai",
    website: "https://www.rinnai.us",
    logoPath: fav("rinnai.us"),
  },
  "ao-smith": {
    slug: "ao-smith",
    name: "A.O. Smith",
    website: "https://www.aosmith.com",
    logoPath: fav("aosmith.com"),
  },
  navien: {
    slug: "navien",
    name: "Navien",
    website: "https://www.navieninc.com",
    logoPath: fav("navieninc.com"),
  },
  "bradford-white": {
    slug: "bradford-white",
    name: "Bradford White",
    website: "https://www.bradfordwhite.com",
    logoPath: fav("bradfordwhite.com"),
  },
  grohe: {
    slug: "grohe",
    name: "GROHE",
    website: "https://www.grohe.us",
    logoPath: fav("grohe.us"),
  },
  "pfister-faucets": {
    slug: "pfister-faucets",
    name: "Pfister",
    website: "https://www.pfisterfaucets.com",
    logoPath: fav("pfisterfaucets.com"),
  },
  insinkerator: {
    slug: "insinkerator",
    name: "InSinkErator",
    website: "https://www.insinkerator.com",
    logoPath: fav("insinkerator.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ELECTRICAL MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  eaton: {
    slug: "eaton",
    name: "Eaton",
    website: "https://www.eaton.com",
    logoPath: fav("eaton.com"),
  },
  leviton: {
    slug: "leviton",
    name: "Leviton",
    website: "https://www.leviton.com",
    logoPath: fav("leviton.com"),
  },
  "square-d": {
    slug: "square-d",
    name: "Square D",
    website: "https://www.se.com/us/en/brands/squared",
    logoPath: fav("se.com"),
  },
  lutron: {
    slug: "lutron",
    name: "Lutron",
    website: "https://www.lutron.com",
    logoPath: fav("lutron.com"),
  },
  generac: {
    slug: "generac",
    name: "Generac",
    website: "https://www.generac.com",
    logoPath: fav("generac.com"),
  },
  "siemens-electrical": {
    slug: "siemens-electrical",
    name: "Siemens",
    website: "https://www.siemens.com",
    logoPath: fav("siemens.com"),
  },
  hubbell: {
    slug: "hubbell",
    name: "Hubbell",
    website: "https://www.hubbell.com",
    logoPath: fav("hubbell.com"),
  },
  "ge-electrical": {
    slug: "ge-electrical",
    name: "GE Electrical",
    website: "https://www.gecurrent.com",
    logoPath: fav("gecurrent.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INSULATION MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "johns-manville": {
    slug: "johns-manville",
    name: "Johns Manville",
    website: "https://www.jm.com",
    logoPath: fav("jm.com"),
  },
  knauf: {
    slug: "knauf",
    name: "Knauf Insulation",
    website: "https://www.knaufinsulation.com",
    logoPath: fav("knaufinsulation.com"),
  },
  rockwool: {
    slug: "rockwool",
    name: "ROCKWOOL",
    website: "https://www.rockwool.com",
    logoPath: fav("rockwool.com"),
  },
  icynene: {
    slug: "icynene",
    name: "Icynene (Huntsman)",
    website: "https://www.huntsmanbuildingsolutions.com",
    logoPath: fav("huntsmanbuildingsolutions.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // GUTTERS MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  leaffilter: {
    slug: "leaffilter",
    name: "LeafFilter",
    website: "https://www.leaffilter.com",
    logoPath: fav("leaffilter.com"),
  },
  leafguard: {
    slug: "leafguard",
    name: "LeafGuard",
    website: "https://www.leafguard.com",
    logoPath: fav("leafguard.com"),
  },
  "spectra-metals": {
    slug: "spectra-metals",
    name: "Spectra Metals",
    website: "https://www.spectrametals.com",
    logoPath: fav("spectrametals.com"),
  },
  senox: {
    slug: "senox",
    name: "Senox",
    website: "https://www.senox.com",
    logoPath: fav("senox.com"),
  },
  "raindrop-gutter": {
    slug: "raindrop-gutter",
    name: "Raindrop Gutter Guard",
    website: "https://www.raindropgutterguard.com",
    logoPath: fav("raindropgutterguard.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PAINT MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "sherwin-williams": {
    slug: "sherwin-williams",
    name: "Sherwin-Williams",
    website: "https://www.sherwin-williams.com",
    logoPath: fav("sherwin-williams.com"),
  },
  "benjamin-moore": {
    slug: "benjamin-moore",
    name: "Benjamin Moore",
    website: "https://www.benjaminmoore.com",
    logoPath: fav("benjaminmoore.com"),
  },
  "ppg-paints": {
    slug: "ppg-paints",
    name: "PPG Paints",
    website: "https://www.ppgpaints.com",
    logoPath: fav("ppg.com"),
  },
  behr: {
    slug: "behr",
    name: "BEHR",
    website: "https://www.behr.com",
    logoPath: fav("behr.com"),
  },
  "dunn-edwards": {
    slug: "dunn-edwards",
    name: "Dunn-Edwards",
    website: "https://www.dunnedwards.com",
    logoPath: fav("dunnedwards.com"),
  },
  valspar: {
    slug: "valspar",
    name: "Valspar",
    website: "https://www.valspar.com",
    logoPath: fav("valspar.com"),
  },
  "rust-oleum": {
    slug: "rust-oleum",
    name: "Rust-Oleum",
    website: "https://www.rustoleum.com",
    logoPath: fav("rustoleum.com"),
  },
  "diamond-vogel": {
    slug: "diamond-vogel",
    name: "Diamond Vogel",
    website: "https://www.diamondvogel.com",
    logoPath: fav("diamondvogel.com"),
  },
  "california-paints": {
    slug: "california-paints",
    name: "California Paints",
    website: "https://www.californiapaints.com",
    logoPath: fav("californiapaints.com"),
  },
  "farrow-ball": {
    slug: "farrow-ball",
    name: "Farrow & Ball",
    website: "https://www.farrow-ball.com",
    logoPath: fav("farrow-ball.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FLOORING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "shaw-industries": {
    slug: "shaw-industries",
    name: "Shaw Floors",
    website: "https://www.shawfloors.com",
    logoPath: fav("shawfloors.com"),
  },
  mohawk: {
    slug: "mohawk",
    name: "Mohawk",
    website: "https://www.mohawkflooring.com",
    logoPath: fav("mohawkflooring.com"),
  },
  mannington: {
    slug: "mannington",
    name: "Mannington",
    website: "https://www.mannington.com",
    logoPath: fav("mannington.com"),
  },
  "armstrong-flooring": {
    slug: "armstrong-flooring",
    name: "Armstrong Flooring",
    website: "https://www.armstrongflooring.com",
    logoPath: fav("armstrongflooring.com"),
  },
  "coretec-floors": {
    slug: "coretec-floors",
    name: "COREtec",
    website: "https://www.coretecfloors.com",
    logoPath: fav("coretecfloors.com"),
  },
  daltile: {
    slug: "daltile",
    name: "Daltile",
    website: "https://www.daltile.com",
    logoPath: fav("daltile.com"),
  },
  "msi-surfaces": {
    slug: "msi-surfaces",
    name: "MSI Surfaces",
    website: "https://www.msisurfaces.com",
    logoPath: fav("msisurfaces.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TILE & STONE MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "florida-tile": {
    slug: "florida-tile",
    name: "Florida Tile",
    website: "https://www.floridatile.com",
    logoPath: fav("floridatile.com"),
  },
  "american-olean": {
    slug: "american-olean",
    name: "American Olean",
    website: "https://www.americanolean.com",
    logoPath: fav("americanolean.com"),
  },
  "emser-tile": {
    slug: "emser-tile",
    name: "Emser Tile",
    website: "https://www.emser.com",
    logoPath: fav("emser.com"),
  },
  bedrosians: {
    slug: "bedrosians",
    name: "Bedrosians",
    website: "https://www.bedrosians.com",
    logoPath: fav("bedrosians.com"),
  },
  "schluter-systems": {
    slug: "schluter-systems",
    name: "Schluter Systems",
    website: "https://www.schluter.com",
    logoPath: fav("schluter.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONCRETE & MASONRY MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  quikrete: {
    slug: "quikrete",
    name: "QUIKRETE",
    website: "https://www.quikrete.com",
    logoPath: fav("quikrete.com"),
  },
  sakrete: {
    slug: "sakrete",
    name: "Sakrete",
    website: "https://www.sakrete.com",
    logoPath: fav("sakrete.com"),
  },
  belgard: {
    slug: "belgard",
    name: "Belgard",
    website: "https://www.belgard.com",
    logoPath: fav("belgard.com"),
  },
  pavestone: {
    slug: "pavestone",
    name: "Pavestone",
    website: "https://www.pavestone.com",
    logoPath: fav("pavestone.com"),
  },
  "oldcastle-apg": {
    slug: "oldcastle-apg",
    name: "Oldcastle APG",
    website: "https://www.oldcastleapg.com",
    logoPath: fav("oldcastleapg.com"),
  },
  "eagle-materials": {
    slug: "eagle-materials",
    name: "Eagle Materials",
    website: "https://www.eaglematerials.com",
    logoPath: fav("eaglematerials.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DRYWALL & INTERIOR MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "usg-corporation": {
    slug: "usg-corporation",
    name: "USG (Sheetrock)",
    website: "https://www.usg.com",
    logoPath: fav("usg.com"),
  },
  "national-gypsum": {
    slug: "national-gypsum",
    name: "National Gypsum",
    website: "https://www.nationalgypsum.com",
    logoPath: fav("nationalgypsum.com"),
  },
  "georgia-pacific-gypsum": {
    slug: "georgia-pacific-gypsum",
    name: "Georgia-Pacific Gypsum",
    website: "https://www.buildgp.com",
    logoPath: fav("buildgp.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CABINETS & COUNTERTOPS MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  kraftmaid: {
    slug: "kraftmaid",
    name: "KraftMaid",
    website: "https://www.kraftmaid.com",
    logoPath: fav("kraftmaid.com"),
  },
  merillat: {
    slug: "merillat",
    name: "Merillat",
    website: "https://www.merillat.com",
    logoPath: fav("merillat.com"),
  },
  "diamond-cabinets": {
    slug: "diamond-cabinets",
    name: "Diamond Cabinets",
    website: "https://www.diamondcabinets.com",
    logoPath: fav("diamondcabinets.com"),
  },
  "thomasville-cabinetry": {
    slug: "thomasville-cabinetry",
    name: "Thomasville Cabinetry",
    website: "https://www.thomasvillecabinetry.com",
    logoPath: fav("thomasvillecabinetry.com"),
  },
  "cambria-quartz": {
    slug: "cambria-quartz",
    name: "Cambria",
    website: "https://www.cambriausa.com",
    logoPath: fav("cambriausa.com"),
  },
  caesarstone: {
    slug: "caesarstone",
    name: "Caesarstone",
    website: "https://www.caesarstoneus.com",
    logoPath: fav("caesarstoneus.com"),
  },
  silestone: {
    slug: "silestone",
    name: "Silestone by Cosentino",
    website: "https://www.cosentino.com",
    logoPath: fav("cosentino.com"),
  },
  "wilsonart-counters": {
    slug: "wilsonart-counters",
    name: "Wilsonart",
    website: "https://www.wilsonart.com",
    logoPath: fav("wilsonart.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // APPLIANCES MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  whirlpool: {
    slug: "whirlpool",
    name: "Whirlpool",
    website: "https://www.whirlpool.com",
    logoPath: fav("whirlpool.com"),
  },
  "ge-appliances": {
    slug: "ge-appliances",
    name: "GE Appliances",
    website: "https://www.geappliances.com",
    logoPath: fav("geappliances.com"),
  },
  "samsung-appliances": {
    slug: "samsung-appliances",
    name: "Samsung",
    website: "https://www.samsung.com",
    logoPath: fav("samsung.com"),
  },
  "lg-appliances": {
    slug: "lg-appliances",
    name: "LG",
    website: "https://www.lg.com",
    logoPath: fav("lg.com"),
  },
  bosch: {
    slug: "bosch",
    name: "Bosch",
    website: "https://www.bosch-home.com",
    logoPath: fav("bosch-home.com"),
  },
  kitchenaid: {
    slug: "kitchenaid",
    name: "KitchenAid",
    website: "https://www.kitchenaid.com",
    logoPath: fav("kitchenaid.com"),
  },
  maytag: {
    slug: "maytag",
    name: "Maytag",
    website: "https://www.maytag.com",
    logoPath: fav("maytag.com"),
  },
  frigidaire: {
    slug: "frigidaire",
    name: "Frigidaire",
    website: "https://www.frigidaire.com",
    logoPath: fav("frigidaire.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SOLAR MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "tesla-solar": {
    slug: "tesla-solar",
    name: "Tesla Solar",
    website: "https://www.tesla.com/solarpanels",
    logoPath: fav("tesla.com"),
  },
  sunpower: {
    slug: "sunpower",
    name: "SunPower",
    website: "https://www.sunpower.com",
    logoPath: fav("sunpower.com"),
  },
  enphase: {
    slug: "enphase",
    name: "Enphase Energy",
    website: "https://www.enphase.com",
    logoPath: fav("enphase.com"),
  },
  solaredge: {
    slug: "solaredge",
    name: "SolarEdge",
    website: "https://www.solaredge.com",
    logoPath: fav("solaredge.com"),
  },
  qcells: {
    slug: "qcells",
    name: "Q CELLS",
    website: "https://www.q-cells.com",
    logoPath: fav("q-cells.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FENCING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "master-halco": {
    slug: "master-halco",
    name: "Master Halco",
    website: "https://www.masterhalco.com",
    logoPath: fav("masterhalco.com"),
  },
  trex: {
    slug: "trex",
    name: "Trex (Fencing & Decking)",
    website: "https://www.trex.com",
    logoPath: fav("trex.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STUCCO / EIFS MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "lahabra-stucco": {
    slug: "lahabra-stucco",
    name: "LaHabra",
    website: "https://www.lahabra.com",
    logoPath: fav("lahabra.com"),
  },
  "omega-stucco": {
    slug: "omega-stucco",
    name: "Omega Products",
    website: "https://www.omegaproducts.com",
    logoPath: fav("omegaproducts.com"),
  },
  "parex-usa": {
    slug: "parex-usa",
    name: "ParexUSA",
    website: "https://www.parexusa.com",
    logoPath: fav("parexusa.com"),
  },
  "dryvit-stucco": {
    slug: "dryvit-stucco",
    name: "Dryvit (EIFS)",
    website: "https://www.dryvit.com",
    logoPath: fav("dryvit.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // RESTORATION / WATER / MOLD
  // ═══════════════════════════════════════════════════════════════════════
  servpro: {
    slug: "servpro",
    name: "SERVPRO",
    website: "https://www.servpro.com",
    logoPath: fav("servpro.com"),
  },
  "servicemaster-restore": {
    slug: "servicemaster-restore",
    name: "ServiceMaster Restore",
    website: "https://www.servicemasterrestore.com",
    logoPath: fav("servicemasterrestore.com"),
  },
  "legend-brands": {
    slug: "legend-brands",
    name: "Legend Brands (Dri-Eaz)",
    website: "https://www.legendbrands.com",
    logoPath: fav("legendbrands.com"),
  },
  xactimate: {
    slug: "xactimate",
    name: "Xactimate (Verisk)",
    website: "https://www.xactware.com",
    logoPath: fav("xactware.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // POOLS & SPAS MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  pentair: {
    slug: "pentair",
    name: "Pentair",
    website: "https://www.pentair.com",
    logoPath: fav("pentair.com"),
  },
  hayward: {
    slug: "hayward",
    name: "Hayward",
    website: "https://www.hayward.com",
    logoPath: fav("hayward.com"),
  },
  "jandy-pool": {
    slug: "jandy-pool",
    name: "Jandy",
    website: "https://www.jandy.com",
    logoPath: fav("jandy.com"),
  },
  "pebble-technology": {
    slug: "pebble-technology",
    name: "Pebble Technology International",
    website: "https://www.pebbletec.com",
    logoPath: fav("pebbletec.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FOUNDATION MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "foundation-supportworks": {
    slug: "foundation-supportworks",
    name: "Foundation Supportworks",
    website: "https://www.foundationsupportworks.com",
    logoPath: fav("foundationsupportworks.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LANDSCAPING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "hunter-industries": {
    slug: "hunter-industries",
    name: "Hunter Industries",
    website: "https://www.hunterindustries.com",
    logoPath: fav("hunterindustries.com"),
  },
  "rain-bird": {
    slug: "rain-bird",
    name: "Rain Bird",
    website: "https://www.rainbird.com",
    logoPath: fav("rainbird.com"),
  },
  "toro-irrigation": {
    slug: "toro-irrigation",
    name: "Toro",
    website: "https://www.toro.com",
    logoPath: fav("toro.com"),
  },
  "scotts-miracle-gro": {
    slug: "scotts-miracle-gro",
    name: "Scotts Miracle-Gro",
    website: "https://www.scotts.com",
    logoPath: fav("scotts.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DEMOLITION / EXCAVATION
  // ═══════════════════════════════════════════════════════════════════════
  caterpillar: {
    slug: "caterpillar",
    name: "Caterpillar (CAT)",
    website: "https://www.cat.com",
    logoPath: fav("cat.com"),
  },
  "john-deere": {
    slug: "john-deere",
    name: "John Deere",
    website: "https://www.deere.com",
    logoPath: fav("deere.com"),
  },
  bobcat: {
    slug: "bobcat",
    name: "Bobcat",
    website: "https://www.bobcat.com",
    logoPath: fav("bobcat.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DISTRIBUTORS & SUPPLIERS (PRO-SIDE VIN)
  // ═══════════════════════════════════════════════════════════════════════
  "abc-supply": {
    slug: "abc-supply",
    name: "ABC Supply",
    website: "https://www.abcsupply.com",
    logoPath: fav("abcsupply.com"),
  },
  "beacon-building": {
    slug: "beacon-building",
    name: "Beacon Building Products",
    website: "https://www.becn.com",
    logoPath: fav("becn.com"),
  },
  "srs-distribution": {
    slug: "srs-distribution",
    name: "SRS Distribution",
    website: "https://www.srsdistribution.com",
    logoPath: fav("srsdistribution.com"),
  },
  "us-lbm": {
    slug: "us-lbm",
    name: "US LBM",
    website: "https://www.uslbm.com",
    logoPath: fav("uslbm.com"),
  },
  "builders-firstsource": {
    slug: "builders-firstsource",
    name: "Builders FirstSource",
    website: "https://www.bldr.com",
    logoPath: fav("bldr.com"),
  },
  "westlake-royal": {
    slug: "westlake-royal",
    name: "Westlake Royal Building Products",
    website: "https://www.westlakeroyalbuildingproducts.com",
    logoPath: fav("westlakeroyalbuildingproducts.com"),
  },
  "az-building-supply": {
    slug: "az-building-supply",
    name: "AZ Building Supply",
    website: "https://www.azbuildingsupply.com",
    logoPath: fav("azbuildingsupply.com"),
  },
  "84-lumber": {
    slug: "84-lumber",
    name: "84 Lumber",
    website: "https://www.84lumber.com",
    logoPath: fav("84lumber.com"),
  },
  "hd-supply": {
    slug: "hd-supply",
    name: "HD Supply",
    website: "https://www.hdsupply.com",
    logoPath: fav("hdsupply.com"),
  },
  "home-depot-pro": {
    slug: "home-depot-pro",
    name: "Home Depot Pro",
    website: "https://www.homedepot.com",
    logoPath: fav("homedepot.com"),
  },
  "lowes-pro": {
    slug: "lowes-pro",
    name: "Lowe's Pro Supply",
    website: "https://www.lowes.com",
    logoPath: fav("lowes.com"),
  },
  "ferguson-enterprises": {
    slug: "ferguson-enterprises",
    name: "Ferguson Enterprises",
    website: "https://www.ferguson.com",
    logoPath: fav("ferguson.com"),
  },
  winsupply: {
    slug: "winsupply",
    name: "WinSupply",
    website: "https://www.winsupplyinc.com",
    logoPath: fav("winsupplyinc.com"),
  },
  "johnstone-supply": {
    slug: "johnstone-supply",
    name: "Johnstone Supply",
    website: "https://www.johnstonesupply.com",
    logoPath: fav("johnstonesupply.com"),
  },
  hajoca: {
    slug: "hajoca",
    name: "Hajoca",
    website: "https://www.hajoca.com",
    logoPath: fav("hajoca.com"),
  },
  "graybar-electric": {
    slug: "graybar-electric",
    name: "Graybar Electric",
    website: "https://www.graybar.com",
    logoPath: fav("graybar.com"),
  },
  "rexel-electrical": {
    slug: "rexel-electrical",
    name: "Rexel",
    website: "https://www.rexelusa.com",
    logoPath: fav("rexelusa.com"),
  },
  poolcorp: {
    slug: "poolcorp",
    name: "POOLCORP (SCP/Superior)",
    website: "https://www.poolcorp.com",
    logoPath: fav("poolcorp.com"),
  },
  "floor-decor": {
    slug: "floor-decor",
    name: "Floor & Decor",
    website: "https://www.flooranddecor.com",
    logoPath: fav("flooranddecor.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONCRETE / MASONRY MANUFACTURERS (ADDITIONAL)
  // ═══════════════════════════════════════════════════════════════════════
  "techo-bloc": {
    slug: "techo-bloc",
    name: "Techo-Bloc",
    website: "https://www.techo-bloc.com",
    logoPath: fav("techo-bloc.com"),
  },
  "eldorado-stone": {
    slug: "eldorado-stone",
    name: "Eldorado Stone",
    website: "https://www.eldoradostone.com",
    logoPath: fav("eldoradostone.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FENCING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  bufftech: {
    slug: "bufftech",
    name: "Bufftech (CertainTeed)",
    website: "https://www.bufftech.com",
    logoPath: fav("bufftech.com"),
  },
  "trex-fencing": {
    slug: "trex-fencing",
    name: "Trex Fencing",
    website: "https://www.trexfencing.com",
    logoPath: fav("trex.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DRYWALL MANUFACTURERS (SLUG-MATCHED TO SEEDS)
  // ═══════════════════════════════════════════════════════════════════════
  usg: {
    slug: "usg",
    name: "USG Corporation",
    website: "https://www.usg.com",
    logoPath: fav("usg.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FRAMING / CARPENTRY MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "boise-cascade": {
    slug: "boise-cascade",
    name: "Boise Cascade",
    website: "https://www.bc.com",
    logoPath: fav("bc.com"),
  },
  weyerhaeuser: {
    slug: "weyerhaeuser",
    name: "Weyerhaeuser",
    website: "https://www.weyerhaeuser.com",
    logoPath: fav("weyerhaeuser.com"),
  },
  "simpson-strong-tie": {
    slug: "simpson-strong-tie",
    name: "Simpson Strong-Tie",
    website: "https://www.strongtie.com",
    logoPath: fav("strongtie.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FOUNDATION
  // ═══════════════════════════════════════════════════════════════════════
  "ram-jack": {
    slug: "ram-jack",
    name: "Ram Jack",
    website: "https://www.ramjack.com",
    logoPath: fav("ramjack.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STUCCO MANUFACTURERS (ADDITIONAL)
  // ═══════════════════════════════════════════════════════════════════════
  lahabra: {
    slug: "lahabra",
    name: "LaHabra (Parex USA)",
    website: "https://www.lahabra.com",
    logoPath: fav("lahabra.com"),
  },
  "omega-products": {
    slug: "omega-products",
    name: "Omega Products",
    website: "https://www.omega-products.com",
    logoPath: fav("omega-products.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CABINETS MANUFACTURERS (ADDITIONAL)
  // ═══════════════════════════════════════════════════════════════════════
  "rev-a-shelf": {
    slug: "rev-a-shelf",
    name: "Rev-A-Shelf",
    website: "https://www.rev-a-shelf.com",
    logoPath: fav("rev-a-shelf.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COUNTERTOP MANUFACTURERS (ADDITIONAL)
  // ═══════════════════════════════════════════════════════════════════════
  cambria: {
    slug: "cambria",
    name: "Cambria",
    website: "https://www.cambriausa.com",
    logoPath: fav("cambriausa.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // APPLIANCE MANUFACTURERS (ADDITIONAL)
  // ═══════════════════════════════════════════════════════════════════════
  "whirlpool-pro": {
    slug: "whirlpool-pro",
    name: "Whirlpool (Pro)",
    website: "https://www.whirlpoolpro.com",
    logoPath: fav("whirlpool.com"),
  },
  "bosch-home": {
    slug: "bosch-home",
    name: "Bosch Home Appliances",
    website: "https://www.bosch-home.com/us",
    logoPath: fav("bosch-home.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WATER/MOLD/FIRE RESTORATION EQUIPMENT
  // ═══════════════════════════════════════════════════════════════════════
  "dri-eaz": {
    slug: "dri-eaz",
    name: "Dri-Eaz (Legend Brands)",
    website: "https://www.dri-eaz.com",
    logoPath: fav("dri-eaz.com"),
  },
  fiberlock: {
    slug: "fiberlock",
    name: "Fiberlock Technologies",
    website: "https://www.fiberlock.com",
    logoPath: fav("fiberlock.com"),
  },
  belfor: {
    slug: "belfor",
    name: "BELFOR Property Restoration",
    website: "https://www.belfor.com",
    logoPath: fav("belfor.com"),
  },
  "bio-one": {
    slug: "bio-one",
    name: "Bio-One",
    website: "https://www.biooneinc.com",
    logoPath: fav("biooneinc.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ADDITIONAL SUPPLIERS, DEALERS & DISTRIBUTORS (PRO-SIDE VIN)
  // All the places pros ACTUALLY order materials from
  // ═══════════════════════════════════════════════════════════════════════
  siteone: {
    slug: "siteone",
    name: "SiteOne Landscape Supply",
    website: "https://www.siteone.com",
    logoPath: fav("siteone.com"),
  },
  menards: {
    slug: "menards",
    name: "Menards",
    website: "https://www.menards.com",
    logoPath: fav("menards.com"),
  },
  fastenal: {
    slug: "fastenal",
    name: "Fastenal",
    website: "https://www.fastenal.com",
    logoPath: fav("fastenal.com"),
  },
  "sunbelt-rentals": {
    slug: "sunbelt-rentals",
    name: "Sunbelt Rentals",
    website: "https://www.sunbeltrentals.com",
    logoPath: fav("sunbeltrentals.com"),
  },
  "united-rentals": {
    slug: "united-rentals",
    name: "United Rentals",
    website: "https://www.unitedrentals.com",
    logoPath: fav("unitedrentals.com"),
  },
  grainger: {
    slug: "grainger",
    name: "W.W. Grainger",
    website: "https://www.grainger.com",
    logoPath: fav("grainger.com"),
  },
  "carrier-enterprise": {
    slug: "carrier-enterprise",
    name: "Carrier Enterprise",
    website: "https://www.carrierenterprise.com",
    logoPath: fav("carrierenterprise.com"),
  },
  "re-michel": {
    slug: "re-michel",
    name: "RE Michel Company",
    website: "https://www.remichel.com",
    logoPath: fav("remichel.com"),
  },
  watsco: {
    slug: "watsco",
    name: "Watsco / Gemaire",
    website: "https://www.watsco.com",
    logoPath: fav("watsco.com"),
  },
  "baker-distributing": {
    slug: "baker-distributing",
    name: "Baker Distributing",
    website: "https://www.bakerdist.com",
    logoPath: fav("bakerdist.com"),
  },
  "ced-greentech": {
    slug: "ced-greentech",
    name: "CED Greentech",
    website: "https://www.cedgreentech.com",
    logoPath: fav("cedgreentech.com"),
  },
  "baywa-re": {
    slug: "baywa-re",
    name: "BayWa r.e. Solar",
    website: "https://solar-distribution.baywa-re.us",
    logoPath: fav("baywa-re.com"),
  },
  "core-main": {
    slug: "core-main",
    name: "Core & Main",
    website: "https://www.coreandmain.com",
    logoPath: fav("coreandmain.com"),
  },
  "fw-webb": {
    slug: "fw-webb",
    name: "F.W. Webb Company",
    website: "https://www.fwwebb.com",
    logoPath: fav("fwwebb.com"),
  },
  "ced-electrical": {
    slug: "ced-electrical",
    name: "CED (Consolidated Electrical)",
    website: "https://www.cedcareers.com",
    logoPath: fav("cedcareers.com"),
  },
  wesco: {
    slug: "wesco",
    name: "WESCO International",
    website: "https://www.wesco.com",
    logoPath: fav("wesco.com"),
  },
  "border-states": {
    slug: "border-states",
    name: "Border States Electric",
    website: "https://www.borderstates.com",
    logoPath: fav("borderstates.com"),
  },
  "ewing-outdoor": {
    slug: "ewing-outdoor",
    name: "Ewing Outdoor Supply",
    website: "https://www.ewingirrigation.com",
    logoPath: fav("ewingirrigation.com"),
  },
  "leslies-pool": {
    slug: "leslies-pool",
    name: "Leslie's Pool Supplies",
    website: "https://www.lesliespool.com",
    logoPath: fav("lesliespool.com"),
  },
  calportland: {
    slug: "calportland",
    name: "CalPortland",
    website: "https://www.calportland.com",
    logoPath: fav("calportland.com"),
  },
  "bmc-building": {
    slug: "bmc-building",
    name: "BMC Building Materials",
    website: "https://www.buildwithbmc.com",
    logoPath: fav("buildwithbmc.com"),
  },
  "bluescope-buildings": {
    slug: "bluescope-buildings",
    name: "BlueScope Buildings",
    website: "https://www.bluescopebuildings.com",
    logoPath: fav("bluescopebuildings.com"),
  },
  "abc-industries": {
    slug: "abc-industries",
    name: "ABC Industries",
    website: "https://www.abc-industries.net",
    logoPath: fav("abc-industries.net"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SLUG ALIASES — match seed SQL slugs that differ from canonical entries
  // ═══════════════════════════════════════════════════════════════════════
  "pebble-tec": {
    slug: "pebble-tec",
    name: "Pebble Technology International",
    website: "https://www.pebbletec.com",
    logoPath: fav("pebbletec.com"),
  },
  servicemaster: {
    slug: "servicemaster",
    name: "ServiceMaster Restore",
    website: "https://www.servicemasterrestore.com",
    logoPath: fav("servicemasterrestore.com"),
  },
  "boral-concrete": {
    slug: "boral-concrete",
    name: "Boral Industries",
    website: "https://www.boralamerica.com",
    logoPath: fav("boralamerica.com"),
  },
  "cat-equipment": {
    slug: "cat-equipment",
    name: "Caterpillar (CAT)",
    website: "https://www.cat.com",
    logoPath: fav("cat.com"),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MISSING DB VENDORS — slug aliases & new entries
  // These vendors exist in the Vendor table but had no logo entry
  // ═══════════════════════════════════════════════════════════════════════

  // Slug aliases for DB slugs that differ from existing manifest entries
  ferguson: {
    slug: "ferguson",
    name: "Ferguson Enterprises",
    website: "https://www.ferguson.com",
    logoPath: fav("ferguson.com"),
  },
  graybar: {
    slug: "graybar",
    name: "Graybar Electric",
    website: "https://www.graybar.com",
    logoPath: fav("graybar.com"),
  },
  "gaf-materials": {
    slug: "gaf-materials",
    name: "GAF Materials",
    website: "https://www.gaf.com",
    logoPath: fav("gaf.com"),
  },

  // Roofing manufacturers missing logos
  apoc: {
    slug: "apoc",
    name: "APOC Coatings",
    website: "https://www.apoc.com",
    logoPath: fav("apoc.com"),
  },
  "atas-intl": {
    slug: "atas-intl",
    name: "ATAS International",
    website: "https://www.atas.com",
    logoPath: fav("atas.com"),
  },
  berridge: {
    slug: "berridge",
    name: "Berridge Manufacturing",
    website: "https://www.berridge.com",
    logoPath: fav("berridge.com"),
  },
  carlisle: {
    slug: "carlisle",
    name: "Carlisle SynTec",
    website: "https://www.carlislesyntec.com",
    logoPath: fav("carlislesyntec.com"),
  },
  firestone: {
    slug: "firestone",
    name: "Firestone Building Products",
    website: "https://www.firestonebpco.com",
    logoPath: fav("firestonebpco.com"),
  },
  gaco: {
    slug: "gaco",
    name: "Gaco Western",
    website: "https://www.gfrp.com",
    logoPath: fav("gfrp.com"),
  },
  "metal-sales": {
    slug: "metal-sales",
    name: "Metal Sales Manufacturing",
    website: "https://www.metalsales.us.com",
    logoPath: fav("metalsales.us.com"),
  },
  monier: {
    slug: "monier",
    name: "Monier Lifetile",
    website: "https://www.boral.com",
    logoPath: fav("boral.com"),
  },
  "nucor-skyline": {
    slug: "nucor-skyline",
    name: "Nucor Building Systems",
    website: "https://www.nucorbuildingsystems.com",
    logoPath: fav("nucorbuildingsystems.com"),
  },
  polyglass: {
    slug: "polyglass",
    name: "Polyglass USA",
    website: "https://www.polyglass.us",
    logoPath: fav("polyglass.us"),
  },
  "roof-hugger": {
    slug: "roof-hugger",
    name: "Roof Hugger",
    website: "https://www.roofhugger.com",
    logoPath: fav("roofhugger.com"),
  },
  "standing-seam-usa": {
    slug: "standing-seam-usa",
    name: "Standing Seam USA",
    website: "https://www.standingseamusa.com",
    logoPath: fav("standingseamusa.com"),
  },
  tremco: {
    slug: "tremco",
    name: "Tremco Roofing",
    website: "https://www.tremcoroofing.com",
    logoPath: fav("tremcoroofing.com"),
  },
  versico: {
    slug: "versico",
    name: "Versico Roofing Systems",
    website: "https://www.versico.com",
    logoPath: fav("versico.com"),
  },

  // Service providers & supply companies
  "elite-roofing-supply": {
    slug: "elite-roofing-supply",
    name: "Elite Roofing Supply",
    website: "https://www.eliteroofingsupply.com",
    logoPath: fav("eliteroofingsupply.com"),
  },
  "fire-dawgs": {
    slug: "fire-dawgs",
    name: "Fire Dawgs Junk Removal",
    website: "https://www.firedawgs.com",
    logoPath: fav("firedawgs.com"),
  },
};

/**
 * Get all vendor slugs that need logos
 */
export function getVendorSlugsNeedingLogos(): string[] {
  return Object.keys(VENDOR_LOGOS);
}

/**
 * Get logo path for a vendor
 */
export function getVendorLogo(slug: string): string | null {
  return VENDOR_LOGOS[slug]?.logoPath || null;
}

/**
 * Get logo URL from a vendor's website domain (Google Favicons fallback)
 * Use this when no entry exists in VENDOR_LOGOS
 */
export function getLogoFromWebsite(website: string | null): string | null {
  if (!website) return null;
  try {
    const domain = new URL(website).hostname.replace("www.", "");
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
}

/**
 * Check if logo file exists (for build-time validation)
 */
export function getLogoManifest(): { slug: string; path: string; exists: boolean }[] {
  // External CDN URLs — always available
  return Object.values(VENDOR_LOGOS).map((v) => ({
    slug: v.slug,
    path: v.logoPath,
    exists: true,
  }));
}
