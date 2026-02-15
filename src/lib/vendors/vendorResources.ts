/**
 * Vendor Resources Registry
 *
 * Centralized typed registry for vendor downloadable resources (PDFs, catalogs, spec sheets).
 * These resources are displayed on individual vendor pages.
 */

export interface VendorResource {
  id: string;
  title: string;
  description?: string;
  category:
    | "brochure"
    | "spec_sheet"
    | "data_sheet"
    | "catalog"
    | "sds"
    | "literature"
    | "warranty"
    | "installation_guide";
  url: string;
  fileSize?: string;
  format?: string;
}

/**
 * Official vendor resources pulled directly from manufacturer websites.
 * External URLs are used to ensure content is always current.
 */
export const VENDOR_RESOURCES: Record<string, VendorResource[]> = {
  /**
   * GAF - Official PDFs from gaf.com/document-library
   * All resources link directly to manufacturer-hosted content.
   */
  gaf: [
    {
      id: "gaf-commercial-catalog",
      title: "Commercial Roofing Products Catalog",
      description: "Comprehensive catalog of GAF commercial roofing solutions",
      category: "catalog",
      url: "https://www.gaf.com/en-us/for-professionals/commercial-roofing",
      format: "Web",
    },
    {
      id: "gaf-timberline-hdz-spec",
      title: "Timberline HDZ Shingles",
      description: "Technical specifications for Timberline HDZ asphalt shingles",
      category: "spec_sheet",
      url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles/timberline-hdz-shingles",
      format: "Web",
    },
    {
      id: "gaf-timberline-hdz-sell-sheet",
      title: "Timberline HDZ Product Page",
      description: "Product overview and key features of Timberline HDZ shingles",
      category: "data_sheet",
      url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles/timberline-hdz-shingles",
      format: "Web",
    },
    {
      id: "gaf-timberline-hdz-brochure",
      title: "Timberline HDZ Overview",
      description: "Full product details with design options and benefits",
      category: "brochure",
      url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles/timberline-hdz-shingles",
      format: "Web",
    },
    {
      id: "gaf-layerlock-tech",
      title: "LayerLock Technology",
      description: "Technical details on GAF's LayerLock adhesive technology",
      category: "data_sheet",
      url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles",
      format: "Web",
    },
    {
      id: "gaf-laminated-shingles-sds",
      title: "Safety Data Sheets",
      description: "Safety Data Sheets for GAF roofing products",
      category: "sds",
      url: "https://www.gaf.com/en-us/for-professionals/resources/product-documentation",
      format: "Web",
    },
    {
      id: "gaf-ecodark-granules",
      title: "Shingle Technology & Innovation",
      description: "Information on GAF's solar reflective and granule technology",
      category: "data_sheet",
      url: "https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles",
      format: "Web",
    },
    {
      id: "gaf-duragrip-windproven",
      title: "WindProven Limited Wind Warranty",
      description: "Details on GAF's wind-resistant shingle technology",
      category: "data_sheet",
      url: "https://www.gaf.com/en-us/for-homeowners/warranties/windproven-limited-wind-warranty",
      format: "Web",
    },
    {
      id: "gaf-algae-protection",
      title: "StainGuard Plus Algae Protection",
      description: "Information on GAF's StainGuard algae-resistant shingles",
      category: "literature",
      url: "https://www.gaf.com/en-us/for-homeowners/warranties/stainguard-plus-algae-protection-limited-warranty",
      format: "Web",
    },
  ],

  /**
   * ABC Supply - Distributor resources
   * Note: ABC Supply is a distributor, linking to their capabilities
   */
  "abc-supply": [
    {
      id: "abc-roofing-catalog",
      title: "Roofing Products Overview",
      description:
        "Complete overview of roofing materials and accessories distributed by ABC Supply",
      category: "catalog",
      url: "https://www.abcsupply.com/products/roofing/",
      format: "WEB",
    },
    {
      id: "abc-siding-catalog",
      title: "Siding & Exteriors Catalog",
      description: "Vinyl, fiber cement, and engineered siding products",
      category: "catalog",
      url: "https://www.abcsupply.com/products/siding/",
      format: "WEB",
    },
    {
      id: "abc-contractor-program",
      title: "ABC Contractor Rewards Program",
      description: "Details on the ABC Supply contractor loyalty program",
      category: "literature",
      url: "https://www.abcsupply.com/contractor-rewards/",
      format: "WEB",
    },
  ],

  /**
   * SRS Distribution
   */
  "srs-distribution": [
    {
      id: "srs-product-guide",
      title: "Product Line Guide",
      description: "Complete guide to SRS distributed products",
      category: "catalog",
      url: "https://www.srsdistribution.com/products/",
      format: "WEB",
    },
  ],

  /**
   * Owens Corning - Shingle Manufacturer
   * PDFs available at owenscorning.com/roofing/resources
   */
  "owens-corning": [
    {
      id: "oc-duration-series",
      title: "Duration Series Shingles Brochure",
      description: "Product brochure for Owens Corning Duration shingle line",
      category: "brochure",
      url: "https://www.owenscorning.com/en-us/roofing/documents/duration-shingles-brochure.pdf",
      format: "PDF",
    },
    {
      id: "oc-warranty-guide",
      title: "Roofing Warranty Guide",
      description: "Comprehensive warranty information for Owens Corning products",
      category: "warranty",
      url: "https://www.owenscorning.com/en-us/roofing/documents/roofing-warranty-brochure.pdf",
      format: "PDF",
    },
    {
      id: "oc-trudefinition",
      title: "TruDefinition Duration Spec Sheet",
      description: "Technical specifications for TruDefinition Duration shingles",
      category: "spec_sheet",
      url: "https://www.owenscorning.com/en-us/roofing/documents/trudefinition-duration-spec-sheet.pdf",
      format: "PDF",
    },
    {
      id: "oc-color-guide",
      title: "Shingle Color Collection",
      description: "Complete color palette guide for Owens Corning shingles",
      category: "literature",
      url: "https://www.owenscorning.com/en-us/roofing/shingles/colors",
      format: "WEB",
    },
    {
      id: "oc-insulation-catalog",
      title: "Insulation Product Catalog",
      description: "PINK Fiberglas, FOAMULAR XPS, and blown-in insulation",
      category: "catalog",
      url: "https://www.owenscorning.com/en-us/insulation",
      format: "WEB",
    },
  ],

  /**
   * CertainTeed - Shingle Manufacturer
   * Resources at certainteed.com/resources
   */
  certainteed: [
    {
      id: "ct-landmark-brochure",
      title: "Landmark Shingles Brochure",
      description: "Complete product guide for Landmark series shingles",
      category: "brochure",
      url: "https://www.certainteed.com/resources/CertainTeed-Residential-Roofing-Brochure.pdf",
      format: "PDF",
    },
    {
      id: "ct-warranty-guide",
      title: "Roofing Warranty Information",
      description: "Warranty coverage and registration details",
      category: "warranty",
      url: "https://www.certainteed.com/resources/Roofing-Warranty-Guide.pdf",
      format: "PDF",
    },
    {
      id: "ct-color-selector",
      title: "Shingle Color Selection Guide",
      description: "Complete color palette for CertainTeed shingles",
      category: "literature",
      url: "https://www.certainteed.com/residential-roofing/color-selector/",
      format: "WEB",
    },
    {
      id: "ct-installation-manual",
      title: "Shingle Installation Manual",
      description: "Complete installation guide for CertainTeed shingles",
      category: "installation_guide",
      url: "https://www.certainteed.com/resources/Shingle-Installation-Manual.pdf",
      format: "PDF",
    },
  ],

  /**
   * TAMKO - Shingle Manufacturer
   * Resources at tamko.com/resources
   */
  tamko: [
    {
      id: "tamko-heritage-brochure",
      title: "Heritage Shingles Brochure",
      description: "Product information for Heritage laminated shingles",
      category: "brochure",
      url: "https://www.tamko.com/wp-content/uploads/documents/Heritage-Brochure.pdf",
      format: "PDF",
    },
    {
      id: "tamko-elite-glass-seal",
      title: "Elite Glass-Seal Spec Sheet",
      description: "Technical specifications for Elite Glass-Seal shingles",
      category: "spec_sheet",
      url: "https://www.tamko.com/wp-content/uploads/documents/Elite-Glass-Seal-Spec-Sheet.pdf",
      format: "PDF",
    },
    {
      id: "tamko-warranty",
      title: "Limited Warranty Information",
      description: "Warranty coverage for TAMKO roofing products",
      category: "warranty",
      url: "https://www.tamko.com/wp-content/uploads/documents/TAMKO-Warranty-Guide.pdf",
      format: "PDF",
    },
  ],

  /**
   * Malarkey - Shingle Manufacturer
   * Malarkey has excellent PDF resources at malarkeyroofing.com/resources
   */
  malarkey: [
    {
      id: "malarkey-vista-brochure",
      title: "Vista Shingles Brochure",
      description: "Product guide for Vista architectural shingles with Scotchgard Protector",
      category: "brochure",
      url: "https://www.malarkeyroofing.com/wp-content/uploads/Vista-Brochure.pdf",
      format: "PDF",
    },
    {
      id: "malarkey-sustainability",
      title: "Sustainability Report",
      description:
        "Environmental impact and recycled content information - Malarkey leads in sustainable roofing",
      category: "literature",
      url: "https://www.malarkeyroofing.com/sustainability/",
      format: "WEB",
    },
    {
      id: "malarkey-legacy-brochure",
      title: "Legacy Shingles Brochure",
      description: "Product guide for Legacy designer shingles",
      category: "brochure",
      url: "https://www.malarkeyroofing.com/wp-content/uploads/Legacy-Brochure.pdf",
      format: "PDF",
    },
    {
      id: "malarkey-warranty",
      title: "Warranty Information",
      description: "Complete warranty coverage for Malarkey roofing products",
      category: "warranty",
      url: "https://www.malarkeyroofing.com/wp-content/uploads/Malarkey-Warranty-Guide.pdf",
      format: "PDF",
    },
  ],

  /**
   * IKO Industries - Shingle Manufacturer
   * IKO has document library at iko.com/resources
   */
  iko: [
    {
      id: "iko-cambridge-brochure",
      title: "Cambridge Shingles Brochure",
      description: "Product information for Cambridge architectural shingles with ArmourZone",
      category: "brochure",
      url: "https://www.iko.com/app/uploads/2023/Cambridge-Brochure.pdf",
      format: "PDF",
    },
    {
      id: "iko-dynasty-spec",
      title: "Dynasty Performance Spec Sheet",
      description: "Technical specifications for Dynasty performance shingles",
      category: "spec_sheet",
      url: "https://www.iko.com/app/uploads/2023/Dynasty-Spec-Sheet.pdf",
      format: "PDF",
    },
    {
      id: "iko-warranty",
      title: "IKO Warranty Guide",
      description: "Complete warranty coverage information",
      category: "warranty",
      url: "https://www.iko.com/app/uploads/2023/IKO-Warranty-Guide.pdf",
      format: "PDF",
    },
    {
      id: "iko-installation",
      title: "Installation Instructions",
      description: "Complete shingle installation guide",
      category: "installation_guide",
      url: "https://www.iko.com/app/uploads/2023/IKO-Installation-Manual.pdf",
      format: "PDF",
    },
  ],

  /**
   * Carlisle SynTec - Commercial/TPO
   * Carlisle has excellent technical library at carlislesyntec.com/resources
   */
  carlisle: [
    {
      id: "carlisle-tpo-guide",
      title: "TPO Roofing Systems Guide",
      description: "Complete guide to Carlisle Sure-Weld TPO membrane systems",
      category: "catalog",
      url: "https://www.carlislesyntec.com/getmedia/TPO-Systems-Guide.pdf",
      format: "PDF",
    },
    {
      id: "carlisle-epdm-brochure",
      title: "EPDM Roofing Brochure",
      description: "Product information for Sure-Seal EPDM systems",
      category: "brochure",
      url: "https://www.carlislesyntec.com/getmedia/EPDM-Systems-Brochure.pdf",
      format: "PDF",
    },
    {
      id: "carlisle-warranty",
      title: "Commercial Warranty Guide",
      description: "Warranty coverage for commercial roofing systems",
      category: "warranty",
      url: "https://www.carlislesyntec.com/getmedia/Warranty-Guide.pdf",
      format: "PDF",
    },
    {
      id: "carlisle-installation",
      title: "TPO Installation Manual",
      description: "Complete installation guide for Carlisle TPO systems",
      category: "installation_guide",
      url: "https://www.carlislesyntec.com/getmedia/TPO-Installation-Manual.pdf",
      format: "PDF",
    },
  ],

  /**
   * Firestone Building Products - Commercial/TPO
   * Now part of Holcim Building Envelope
   */
  firestone: [
    {
      id: "firestone-tpo-catalog",
      title: "UltraPly TPO Systems Catalog",
      description: "Complete product catalog for UltraPly TPO systems",
      category: "catalog",
      url: "https://www.holcim.com/sites/holcim/files/documents/ultraply-tpo-brochure.pdf",
      format: "PDF",
    },
    {
      id: "firestone-rubbergard",
      title: "RubberGard EPDM Brochure",
      description: "Product guide for RubberGard EPDM membrane systems",
      category: "brochure",
      url: "https://www.holcim.com/sites/holcim/files/documents/rubbergard-epdm-brochure.pdf",
      format: "PDF",
    },
    {
      id: "firestone-warranty",
      title: "Warranty Information",
      description: "Warranty coverage for Firestone roofing systems",
      category: "warranty",
      url: "https://www.holcim.com/building-envelope/warranty",
      format: "WEB",
    },
  ],

  /**
   * Johns Manville - Commercial/TPO
   * JM has robust document library
   */
  "johns-manville": [
    {
      id: "jm-tpo-brochure",
      title: "TPO Roofing Systems Brochure",
      description: "Product information for JM TPO membrane systems",
      category: "brochure",
      url: "https://www.jm.com/content/dam/jm/roofing/tpo-brochure.pdf",
      format: "PDF",
    },
    {
      id: "jm-pvc-guide",
      title: "PVC Roofing Guide",
      description: "Technical guide for JM PVC roofing systems",
      category: "catalog",
      url: "https://www.jm.com/content/dam/jm/roofing/pvc-systems-guide.pdf",
      format: "PDF",
    },
    {
      id: "jm-warranty",
      title: "Warranty Information",
      description: "Commercial roofing warranty coverage",
      category: "warranty",
      url: "https://www.jm.com/content/dam/jm/roofing/warranty-guide.pdf",
      format: "PDF",
    },
    {
      id: "jm-insulation-catalog",
      title: "Building Insulation Catalog",
      description: "Fiberglass, spray foam, and mineral wool insulation products",
      category: "catalog",
      url: "https://www.jm.com/en/building-insulation/",
      format: "WEB",
    },
  ],

  /**
   * Versico Roofing - Commercial/TPO
   */
  versico: [
    {
      id: "versico-tpo-catalog",
      title: "VersiWeld TPO Catalog",
      description: "Complete catalog for VersiWeld TPO systems",
      category: "catalog",
      url: "https://www.versico.com/products/tpo/",
      format: "WEB",
    },
    {
      id: "versico-warranty",
      title: "Warranty Information",
      description: "Commercial roofing warranty coverage details",
      category: "warranty",
      url: "https://www.versico.com/warranty/",
      format: "WEB",
    },
  ],

  /**
   * Polyglass USA - Commercial/TPO
   */
  polyglass: [
    {
      id: "polyglass-modified-bitumen",
      title: "Modified Bitumen Systems",
      description: "Complete guide to Polyglass modified bitumen roofing",
      category: "catalog",
      url: "https://www.polyglass.us/products/modified-bitumen/",
      format: "WEB",
    },
  ],

  /**
   * Boral Roofing - Tile Manufacturer
   */
  boral: [
    {
      id: "boral-tile-catalog",
      title: "Concrete Tile Catalog",
      description: "Complete catalog of Boral concrete roof tiles",
      category: "catalog",
      url: "https://www.boralroof.com/products/concrete-tile/",
      format: "WEB",
    },
    {
      id: "boral-installation",
      title: "Tile Installation Guide",
      description: "Installation instructions for Boral roof tiles",
      category: "installation_guide",
      url: "https://www.boralroof.com/resources/installation/",
      format: "WEB",
    },
  ],

  /**
   * Eagle Roofing - Tile Manufacturer
   */
  "eagle-roofing": [
    {
      id: "eagle-concrete-tile",
      title: "Concrete Tile Catalog",
      description: "Complete catalog of Eagle concrete roof tiles",
      category: "catalog",
      url: "https://www.eagleroofing.com/products/",
      format: "WEB",
    },
    {
      id: "eagle-color-guide",
      title: "Color Selection Guide",
      description: "Complete color palette for Eagle roof tiles",
      category: "literature",
      url: "https://www.eagleroofing.com/colors/",
      format: "WEB",
    },
  ],

  /**
   * Monier Lifetile - Tile Manufacturer
   */
  monier: [
    {
      id: "monier-tile-catalog",
      title: "Tile Product Catalog",
      description: "Complete catalog of Monier roof tiles",
      category: "catalog",
      url: "https://www.monierlifetile.com/products/",
      format: "WEB",
    },
  ],

  /**
   * Metal Manufacturers
   */
  berridge: [
    {
      id: "berridge-metal-catalog",
      title: "Metal Roofing Catalog",
      description: "Complete catalog of Berridge metal roofing panels",
      category: "catalog",
      url: "https://www.berridge.com/products/",
      format: "WEB",
    },
    {
      id: "berridge-color-chart",
      title: "Color Chart",
      description: "Available finishes and colors for metal panels",
      category: "literature",
      url: "https://www.berridge.com/colors/",
      format: "WEB",
    },
  ],

  "atas-intl": [
    {
      id: "atas-panel-guide",
      title: "Metal Panel Guide",
      description: "Complete guide to ATAS metal roofing and wall panels",
      category: "catalog",
      url: "https://www.atas.com/products/",
      format: "WEB",
    },
  ],

  decra: [
    {
      id: "decra-stone-coated",
      title: "Stone Coated Steel Brochure",
      description: "Product information for DECRA stone coated steel roofing",
      category: "brochure",
      url: "https://www.decra.com/products/",
      format: "WEB",
    },
    {
      id: "decra-warranty",
      title: "Lifetime Warranty Information",
      description: "Warranty coverage for DECRA roofing products",
      category: "warranty",
      url: "https://www.decra.com/warranty/",
      format: "WEB",
    },
  ],

  "metal-sales": [
    {
      id: "metal-sales-catalog",
      title: "Metal Roofing Catalog",
      description: "Complete catalog of metal roofing and siding panels",
      category: "catalog",
      url: "https://www.metalsales.us.com/products/",
      format: "WEB",
    },
  ],

  "nucor-skyline": [
    {
      id: "nucor-building-systems",
      title: "Building Systems Catalog",
      description: "Complete guide to Nucor metal building systems",
      category: "catalog",
      url: "https://www.nucorbuildingsystems.com/products/",
      format: "WEB",
    },
  ],

  "roof-hugger": [
    {
      id: "roof-hugger-retrofit",
      title: "Metal Roof Retrofit System",
      description: "Guide to Roof Hugger retrofit sub-purlin systems",
      category: "brochure",
      url: "https://www.roofhugger.com/products/",
      format: "WEB",
    },
    {
      id: "roof-hugger-installation",
      title: "Installation Guide",
      description: "Installation instructions for Roof Hugger systems",
      category: "installation_guide",
      url: "https://www.roofhugger.com/installation/",
      format: "WEB",
    },
  ],

  "standing-seam-usa": [
    {
      id: "standing-seam-catalog",
      title: "Standing Seam Panel Catalog",
      description: "Complete catalog of standing seam metal panels",
      category: "catalog",
      url: "https://www.standingseamusa.com/products/",
      format: "WEB",
    },
  ],

  /**
   * Coatings Manufacturers
   */
  apoc: [
    {
      id: "apoc-coatings-catalog",
      title: "Roof Coatings Catalog",
      description: "Complete catalog of APOC roof coatings and sealants",
      category: "catalog",
      url: "https://www.apoc.com/products/",
      format: "WEB",
    },
    {
      id: "apoc-application-guide",
      title: "Application Guide",
      description: "Application instructions for APOC coating systems",
      category: "installation_guide",
      url: "https://www.apoc.com/resources/",
      format: "WEB",
    },
  ],

  gaco: [
    {
      id: "gaco-silicone-catalog",
      title: "Silicone Roof Coatings Catalog",
      description: "Complete guide to Gaco silicone coating systems",
      category: "catalog",
      url: "https://www.gaco.com/products/roof-coatings/",
      format: "WEB",
    },
    {
      id: "gaco-warranty",
      title: "Warranty Information",
      description: "Warranty coverage for Gaco coating systems",
      category: "warranty",
      url: "https://www.gaco.com/warranty/",
      format: "WEB",
    },
  ],

  tremco: [
    {
      id: "tremco-roofing-catalog",
      title: "Roofing Systems Catalog",
      description: "Complete catalog of Tremco roofing and waterproofing",
      category: "catalog",
      url: "https://www.tremcoroofing.com/products/",
      format: "WEB",
    },
    {
      id: "tremco-restoration",
      title: "Roof Restoration Guide",
      description: "Guide to Tremco roof restoration systems",
      category: "brochure",
      url: "https://www.tremcoroofing.com/restoration/",
      format: "WEB",
    },
  ],

  /**
   * Multi-Category
   */
  "westlake-royal": [
    {
      id: "westlake-roofing-catalog",
      title: "Roofing Products Catalog",
      description: "Complete catalog of Westlake Royal roofing products",
      category: "catalog",
      url: "https://www.westlakeroyalbuildingproducts.com/roofing/",
      format: "WEB",
    },
    {
      id: "westlake-stone-coated",
      title: "Stone Coated Steel Brochure",
      description: "Product information for stone coated steel roofing",
      category: "brochure",
      url: "https://www.westlakeroyalbuildingproducts.com/products/",
      format: "WEB",
    },
  ],

  /**
   * Elite Roofing Supply - Distributor
   */
  "elite-roofing-supply": [
    {
      id: "elite-product-catalog",
      title: "Product Catalog",
      description: "Complete catalog of distributed roofing products",
      category: "catalog",
      url: "https://www.eliteroofingsupply.com/products/",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // WINDOWS & DOORS MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "andersen-windows": [
    {
      id: "andersen-product-catalog",
      title: "Windows & Doors Product Catalog",
      description: "Complete catalog of Andersen window and door products",
      category: "catalog",
      url: "https://www.andersenwindows.com/windows-and-doors/",
      format: "WEB",
    },
    {
      id: "andersen-warranty",
      title: "Warranty Information",
      description: "Andersen owner-to-owner transferable limited warranty",
      category: "warranty",
      url: "https://www.andersenwindows.com/support/warranty/",
      format: "WEB",
    },
    {
      id: "andersen-architectural-guide",
      title: "Architectural Detail Guide",
      description: "Installation and architectural detail specifications",
      category: "spec_sheet",
      url: "https://www.andersenwindows.com/for-professionals/architectural-detail/",
      format: "WEB",
    },
  ],
  pella: [
    {
      id: "pella-product-catalog",
      title: "Windows & Doors Catalog",
      description: "Full product line including Lifestyle, Architect, and Defender series",
      category: "catalog",
      url: "https://www.pella.com/windows/",
      format: "WEB",
    },
    {
      id: "pella-installation",
      title: "Installation Guide",
      description: "Professional installation resources and specifications",
      category: "installation_guide",
      url: "https://professionals.pella.com/resources/",
      format: "WEB",
    },
  ],
  marvin: [
    {
      id: "marvin-catalog",
      title: "Windows & Doors Catalog",
      description: "Signature, Modern, and Essential product lines",
      category: "catalog",
      url: "https://www.marvin.com/windows",
      format: "WEB",
    },
    {
      id: "marvin-spec-library",
      title: "Specifications Library",
      description: "Complete architectural specifications and CAD details",
      category: "spec_sheet",
      url: "https://www.marvin.com/for-professionals/specifications",
      format: "WEB",
    },
  ],
  "james-hardie": [
    {
      id: "jh-siding-catalog",
      title: "Fiber Cement Siding & Trim Catalog",
      description: "HardiePlank, HardieShingle, HardieTrim product catalog",
      category: "catalog",
      url: "https://www.jameshardie.com/products",
      format: "WEB",
    },
    {
      id: "jh-color-guide",
      title: "ColorPlus Technology Color Guide",
      description: "Pre-finished color options for James Hardie siding",
      category: "literature",
      url: "https://www.jameshardie.com/color-and-design",
      format: "WEB",
    },
    {
      id: "jh-installation",
      title: "Installation & Technical Guide",
      description: "Best practices for fiber cement installation",
      category: "installation_guide",
      url: "https://www.jameshardie.com/for-pros/installation",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // HVAC MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  trane: [
    {
      id: "trane-residential-catalog",
      title: "Residential HVAC Product Catalog",
      description: "Air conditioners, heat pumps, furnaces, and air handlers",
      category: "catalog",
      url: "https://www.trane.com/residential/en/products/",
      format: "WEB",
    },
    {
      id: "trane-warranty",
      title: "Warranty Information",
      description: "Registered limited warranty coverage for Trane products",
      category: "warranty",
      url: "https://www.trane.com/residential/en/warranty/",
      format: "WEB",
    },
  ],
  carrier: [
    {
      id: "carrier-residential-catalog",
      title: "Residential HVAC Catalog",
      description: "Infinity, Performance, and Comfort series product lineup",
      category: "catalog",
      url: "https://www.carrier.com/residential/en/us/products/",
      format: "WEB",
    },
    {
      id: "carrier-warranty",
      title: "Warranty Information",
      description: "Carrier limited warranty and extended warranty options",
      category: "warranty",
      url: "https://www.carrier.com/residential/en/us/warranty/",
      format: "WEB",
    },
  ],
  lennox: [
    {
      id: "lennox-product-catalog",
      title: "Residential HVAC Product Catalog",
      description: "Dave Lennox Signature, Elite, and Merit series",
      category: "catalog",
      url: "https://www.lennox.com/products",
      format: "WEB",
    },
    {
      id: "lennox-warranty",
      title: "Warranty Information",
      description: "Lennox limited warranty coverage and registration",
      category: "warranty",
      url: "https://www.lennox.com/warranty",
      format: "WEB",
    },
  ],
  rheem: [
    {
      id: "rheem-hvac-catalog",
      title: "HVAC & Water Heater Catalog",
      description: "Prestige, Classic Plus, and Classic series HVAC and water heaters",
      category: "catalog",
      url: "https://www.rheem.com/products/",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // PLUMBING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  kohler: [
    {
      id: "kohler-product-catalog",
      title: "Kitchen & Bath Product Catalog",
      description: "Faucets, sinks, toilets, showers, and bathtubs",
      category: "catalog",
      url: "https://www.kohler.com/en/browse",
      format: "WEB",
    },
    {
      id: "kohler-spec-sheets",
      title: "Product Specifications",
      description: "Technical specifications and rough-in dimensions",
      category: "spec_sheet",
      url: "https://www.kohler.com/en/professionals",
      format: "WEB",
    },
  ],
  moen: [
    {
      id: "moen-product-catalog",
      title: "Faucets & Fixtures Catalog",
      description: "Kitchen and bath faucets, showerheads, and accessories",
      category: "catalog",
      url: "https://www.moen.com/products",
      format: "WEB",
    },
    {
      id: "moen-pro-resources",
      title: "Pro Resources & Support",
      description: "Installation guides, spec sheets, and parts finder",
      category: "installation_guide",
      url: "https://www.moen.com/professional",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // PAINT MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "sherwin-williams": [
    {
      id: "sw-color-guide",
      title: "Color Collection & Fan Decks",
      description: "Complete color palette with Colorsnap visualizer",
      category: "literature",
      url: "https://www.sherwin-williams.com/homeowners/color",
      format: "WEB",
    },
    {
      id: "sw-product-catalog",
      title: "Pro Product Catalog",
      description: "Interior, exterior, and specialty coatings for contractors",
      category: "catalog",
      url: "https://www.sherwin-williams.com/painting-contractors/products",
      format: "WEB",
    },
    {
      id: "sw-pro-specs",
      title: "Technical Data Sheets",
      description: "TDS and SDS for all Sherwin-Williams products",
      category: "spec_sheet",
      url: "https://www.sherwin-williams.com/painting-contractors/services/specifications",
      format: "WEB",
    },
  ],
  "benjamin-moore": [
    {
      id: "bm-color-guide",
      title: "Color Collection",
      description: "3,500+ colors with Color Portfolio fan deck",
      category: "literature",
      url: "https://www.benjaminmoore.com/colors",
      format: "WEB",
    },
    {
      id: "bm-product-catalog",
      title: "Pro Product Line",
      description: "Regal Select, Aura, Ben, and specialty primers",
      category: "catalog",
      url: "https://www.benjaminmoore.com/products",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // FLOORING MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "shaw-industries": [
    {
      id: "shaw-flooring-catalog",
      title: "Flooring Product Catalog",
      description: "Carpet, hardwood, laminate, LVP, and tile",
      category: "catalog",
      url: "https://shawfloors.com/flooring",
      format: "WEB",
    },
    {
      id: "shaw-spec-sheets",
      title: "Technical Specifications",
      description: "Product specs, installation guides, and care instructions",
      category: "spec_sheet",
      url: "https://shawfloors.com/flooring/resources",
      format: "WEB",
    },
    {
      id: "shaw-warranty",
      title: "Warranty Information",
      description: "Shaw flooring warranty coverage and registration",
      category: "warranty",
      url: "https://shawfloors.com/flooring/warranty",
      format: "WEB",
    },
  ],
  mohawk: [
    {
      id: "mohawk-product-catalog",
      title: "Flooring Product Catalog",
      description: "Carpet, hardwood, laminate, and luxury vinyl",
      category: "catalog",
      url: "https://www.mohawkflooring.com/carpet",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // ELECTRICAL MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  generac: [
    {
      id: "generac-generator-catalog",
      title: "Generator Product Catalog",
      description: "Home standby, portable, and industrial generators",
      category: "catalog",
      url: "https://www.generac.com/all-products",
      format: "WEB",
    },
    {
      id: "generac-spec-sheets",
      title: "Product Specifications",
      description: "Technical specs and sizing calculators",
      category: "spec_sheet",
      url: "https://www.generac.com/for-professionals",
      format: "WEB",
    },
  ],
  lutron: [
    {
      id: "lutron-lighting-catalog",
      title: "Lighting Controls Catalog",
      description: "Caseta, RadioRA 3, and HomeWorks systems",
      category: "catalog",
      url: "https://www.lutron.com/en-US/Products/Pages/default.aspx",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // SOLAR MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "tesla-solar": [
    {
      id: "tesla-solar-roof",
      title: "Solar Roof Product Page",
      description: "Tesla Solar Roof tiles and Powerwall integration",
      category: "catalog",
      url: "https://www.tesla.com/solarroof",
      format: "WEB",
    },
    {
      id: "tesla-powerwall",
      title: "Powerwall Spec Sheet",
      description: "Technical specifications for Tesla Powerwall battery",
      category: "spec_sheet",
      url: "https://www.tesla.com/powerwall",
      format: "WEB",
    },
  ],
  enphase: [
    {
      id: "enphase-iq8-datasheet",
      title: "IQ8 Microinverter Data Sheet",
      description: "Technical specifications for IQ8 Series microinverters",
      category: "data_sheet",
      url: "https://enphase.com/installers/microinverters",
      format: "WEB",
    },
    {
      id: "enphase-battery-spec",
      title: "IQ Battery Specifications",
      description: "Enphase IQ Battery 5P storage system specifications",
      category: "spec_sheet",
      url: "https://enphase.com/installers/storage",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // CABINETS & COUNTERTOPS
  // ═══════════════════════════════════════════════════════════════════════
  kraftmaid: [
    {
      id: "kraftmaid-catalog",
      title: "Cabinetry Product Catalog",
      description: "Kitchen and bath cabinet styles, finishes, and options",
      category: "catalog",
      url: "https://www.kraftmaid.com/kitchen-cabinets",
      format: "WEB",
    },
  ],
  cambria: [
    {
      id: "cambria-design-palette",
      title: "Quartz Design Palette",
      description: "200+ quartz surface designs with room visualizer",
      category: "catalog",
      url: "https://www.cambriausa.com/quartz/designs/",
      format: "WEB",
    },
    {
      id: "cambria-spec-sheets",
      title: "Technical Specifications",
      description: "Physical properties, care, and maintenance data",
      category: "spec_sheet",
      url: "https://www.cambriausa.com/quartz/care-and-maintenance/",
      format: "WEB",
    },
  ],
  caesarstone: [
    {
      id: "caesarstone-catalog",
      title: "Quartz Surface Catalog",
      description: "Complete collection of quartz colors and textures",
      category: "catalog",
      url: "https://www.caesarstoneus.com/quartz-colors/",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // APPLIANCE MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
  "ge-appliances": [
    {
      id: "ge-product-catalog",
      title: "Appliance Product Catalog",
      description: "GE, GE Profile, Café, and Monogram appliance lines",
      category: "catalog",
      url: "https://www.geappliances.com/ge/kitchen/",
      format: "WEB",
    },
    {
      id: "ge-spec-sheets",
      title: "Builder/Contractor Spec Sheets",
      description: "Dimension guides and installation specifications",
      category: "spec_sheet",
      url: "https://www.geappliances.com/ge/builder/",
      format: "WEB",
    },
  ],
  "whirlpool-pro": [
    {
      id: "whirlpool-pro-catalog",
      title: "Pro Builder Product Catalog",
      description: "Whirlpool, KitchenAid, and Maytag builder programs",
      category: "catalog",
      url: "https://www.whirlpoolpro.com/products",
      format: "WEB",
    },
  ],
  "bosch-home": [
    {
      id: "bosch-product-catalog",
      title: "Home Appliance Catalog",
      description: "Dishwashers, refrigerators, ranges, and laundry",
      category: "catalog",
      url: "https://www.bosch-home.com/us/products.html",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // CONCRETE & MASONRY
  // ═══════════════════════════════════════════════════════════════════════
  quikrete: [
    {
      id: "quikrete-product-guide",
      title: "Concrete Products Guide",
      description: "Complete guide to QUIKRETE concrete mixes, mortars, and repair products",
      category: "catalog",
      url: "https://www.quikrete.com/productlines/",
      format: "WEB",
    },
    {
      id: "quikrete-calculator",
      title: "Product Calculator & Specs",
      description: "Material calculators and technical data sheets",
      category: "spec_sheet",
      url: "https://www.quikrete.com/calculator/",
      format: "WEB",
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // INSULATION MANUFACTURERS
  // ═══════════════════════════════════════════════════════════════════════
};

/**
 * Get resources for a specific vendor by slug.
 * Returns empty array if vendor has no resources.
 */
export function getVendorResources(vendorSlug: string): VendorResource[] {
  return VENDOR_RESOURCES[vendorSlug] || [];
}

/**
 * Get all vendors that have downloadable resources.
 */
export function getVendorsWithResources(): string[] {
  return Object.keys(VENDOR_RESOURCES).filter((slug) => VENDOR_RESOURCES[slug].length > 0);
}
