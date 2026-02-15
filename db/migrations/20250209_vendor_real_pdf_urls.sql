-- ============================================================================
-- MIGRATION: Replace placeholder vendor assets with REAL, verified PDF URLs
-- Date: 2025-02-09
-- Description: Scraped manufacturer websites to find direct PDF brochures,
--              catalogs, spec sheets, install guides, and sell sheets.
--              Covers TAMKO, Eagle Roofing, Metal Sales, Tremco, and adds
--              document library links for JS-rendered vendor sites.
-- ============================================================================

SET search_path TO app;

-- ============================================================================
-- 1. CLEAR existing placeholder assets (they used /vendor-resources/ paths
--    or generic website URLs that don't point to real PDFs)
-- ============================================================================

DELETE FROM vendor_assets
WHERE "vendorId" IN (
  SELECT id FROM "Vendor" WHERE slug IN (
    'tamko', 'eagle-roofing', 'metal-sales', 'tremco',
    'gaf', 'owens-corning', 'certainteed', 'iko', 'malarkey',
    'abc-supply', 'srs-distribution', 'westlake-royal',
    'elite-roofing-supply', 'decra', 'firestone', 'carlisle',
    'boral', 'gaco', 'monier', 'standing-seam-usa', 'versico',
    'johns-manville', 'nucor-skyline', 'atas-intl', 'roof-hugger',
    'apoc', 'berridge', 'polyglass'
  )
);

-- ============================================================================
-- 2. TAMKO — Real PDFs from Azure CDN (tamko.com download gallery)
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Heritage Shingle Application Instructions',
   'Complete installation guide for TAMKO Heritage laminated architectural shingles.',
   'Crew reference, quality control',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-heritage-application-instructions-(dallas-frederick-joplin-phillipsburg).pdf?sfvrsn=6bb656a0_40'),

  ('brochure',      'Titan XT Application Instructions',
   'Installation guide for TAMKO Titan XT — 2024 Product of the Year architectural shingles.',
   'Crew reference, quality control',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-titan-xt-application-instructions-(dallas-frederick-joplin-phillipsburg).pdf?sfvrsn=bc3320a0_24'),

  ('brochure',      'StormFighter FLEX Application Instructions',
   'Installation guide for TAMKO StormFighter FLEX — 2025 Product of the Year impact-resistant shingles.',
   'Crew reference, storm damage repair',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-stormfighter-flex-application-instructions-(phillipsburg).pdf?sfvrsn=8f9523a0_6'),

  ('install_guide', 'MetalWorks Steel Shingle Application Instructions',
   'Step-by-step installation guide for TAMKO MetalWorks stone-coated steel panels.',
   'Metal roofing crew reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-metalworks-application-instructions_37b3a2ed-5974-4268-8df1-c9f1fe9795c8.pdf?sfvrsn=bbb56a0_4'),

  ('install_guide', 'Hip & Ridge Shingle Application Instructions',
   'Application instructions for TAMKO Heritage hip and ridge cap shingles.',
   'Crew reference — ridge cap installation',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-heritage-hip-and-ridge-shingle-products-application-instructions_7c4fafdf-784d-46b8-a5a1-cd4b872e11ac.pdf?sfvrsn=e8515ca0_14'),

  ('install_guide', 'Heritage Vintage Application Instructions',
   'Installation guide for TAMKO Heritage Vintage premium shingles.',
   'Crew reference — premium installs',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_heritage_vintage_application_instructions_515657d7-25a9-4f90-b219-99664502b0c6.pdf?sfvrsn=29b456a0_8'),

  ('install_guide', 'Moisture Guard Application Instructions',
   'Installation guide for TAMKO Moisture Guard ice & water shield underlayment.',
   'Underlayment crew reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-moisture-guard-application-instructions_a1125580-b848-4290-b0b5-3303acc0f3b5.pdf?sfvrsn=cfb856a0_2'),

  ('install_guide', 'Synthetic Guard Underlayment Application Instructions',
   'Installation guide for TAMKO Synthetic Guard synthetic underlayment.',
   'Underlayment crew reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-synthetic-guard-application-instructions.pdf?sfvrsn=2a9857a0_6'),

  ('install_guide', 'Synthetic Guard Plus Application Instructions',
   'Installation guide for TAMKO Synthetic Guard Plus premium underlayment.',
   'Premium underlayment crew reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-synthetic-guard-plus-application-instructions.pdf?sfvrsn=e79b57a0_6'),

  ('spec_sheet',    'Rapid Ridge Ventilation Sell Sheet',
   'Product sell sheet for TAMKO Rapid Ridge ridge vent with nail-gun-able design.',
   'Sales presentation, product specs',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_rapid_ridge_sell_sheet.pdf?sfvrsn=33bb56a0_0'),

  ('spec_sheet',    'Roll Vent Sell Sheet',
   'Product sell sheet for TAMKO Roll Vent ridge ventilation.',
   'Sales presentation, ventilation specs',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_roll_vent_sell_sheet.pdf?sfvrsn=cdbb56a0_0'),

  ('install_guide', 'CoolRidge Application Instructions',
   'Installation guide for TAMKO CoolRidge ridge vent products.',
   'Ridge vent installation reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_coolridge_application_instructions_print_format.pdf?sfvrsn=fbb156a0_0'),

  ('install_guide', 'Elite Glass-Seal 3-Tab Application Instructions',
   'Installation guide for TAMKO Elite Glass-Seal 3-tab economy shingles.',
   'Budget re-roof crew reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-3-tab-elite-glass-seal-application-instructions-(frederick-joplin)_1993ebec-0b7c-45a5-ace5-845654761de0.pdf?sfvrsn=bb156a0_12'),

  ('install_guide', 'MetalWorks Snow Guard Application Instructions',
   'Installation guide for TAMKO MetalWorks snow guard accessories.',
   'Snow country metal roof installs',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_metalworks_snow_guard_application_instructions.pdf?sfvrsn=17bb56a0_0'),

  ('install_guide', 'TW Underlayment Application Instructions',
   'Installation guide for TAMKO TW synthetic underlayment product line.',
   'Underlayment crew reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-tw-underlayment-application-instructions_4e07bb3c-9321-4408-ad8a-4627f230b868.pdf?sfvrsn=e59a0_14'),

  ('install_guide', 'Starter Strip Application Instructions',
   'Application instructions for TAMKO shingle starter strips.',
   'Starter course installation',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-shingle-starter-application-instructions_6652edbc-ca36-44d3-a4b5-f163a527d113.pdf?sfvrsn=e9bb56a0_4'),

  ('install_guide', 'Perforated Starter Application Instructions',
   'Installation guide for TAMKO perforated starter strips.',
   'Starter course installation',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-perforated-starter-application-instructions_15f710f0-d8f4-41b3-877e-e84aeb9c847e.pdf?sfvrsn=bd975aa0_10'),

  ('install_guide', 'QuickVent Ridge Vent Application Instructions',
   'Installation guide for TAMKO QuickVent nail-gun-able ridge vent.',
   'Ridge vent installation',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_quickvent_nail_gun-able_ridge_vent_application_instructions.pdf?sfvrsn=d9b856a0_0'),

  ('install_guide', 'TW Flash-N-Wrap 40 Application Instructions',
   'Installation guide for TAMKO TW Flash-N-Wrap 40 flashing membrane.',
   'Flashing installation reference',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko-tw-flash-n-wrap-40-application-instructions.pdf?sfvrsn=44925aa0_6'),

  ('install_guide', 'Xtractor Vent XLP Turbo Application Instructions',
   'Installation guide for TAMKO Xtractor Vent XLP Turbo roof ventilation.',
   'Ventilation installation',
   'https://cdntamkowebsiteprod.azureedge.net/root/docs/default-source/application-instructions/tamko_xtractor_vent_xlp_turbo_application_instructions.pdf?sfvrsn=11b856a0_0')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'tamko'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 3. EAGLE ROOFING — Real PDFs from eagleroofing.com
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Secure Guard 60 Underlayment Flyer',
   'Product flyer for Eagle Secure Guard 60 synthetic underlayment for concrete tile roofs.',
   'Underlayment product selection',
   'https://eagleroofing.com/wp-content/uploads/2024/06/Eagle-SG60-flyer-052124.pdf'),

  ('brochure',      'Arched Battens System Flyer',
   'Product flyer for Eagle arched batten system for curved tile installations.',
   'Specialty tile installation',
   'https://eagleroofing.com/wp-content/uploads/2020/06/Eagle-Arched-Batten-Flyer-042020-digital.pdf'),

  ('brochure',      'Dual Fix Hybrid System Brochure',
   'Full brochure for Eagle Dual Fix Hybrid adhesive + mechanical tile attachment system.',
   'High-wind zone installations',
   'https://eagleroofing.com/wp-content/uploads/2021/01/EAGLE-2020-Dual-Hybrid-Brochure-digital-1.pdf'),

  ('brochure',      'Eagle Armor Protection Flyer',
   'Product flyer for Eagle Armor tile coating and protection system.',
   'Tile protection upsell',
   'https://eagleroofing.com/wp-content/uploads/2020/09/Eagle-ARMOR-flyer-r4-070820-digital.pdf'),

  ('brochure',      'Eagle True 2-40 Underlayment Flyer',
   'Product flyer for Eagle True 2-40 two-ply underlayment system.',
   'Underlayment product selection',
   'https://eagleroofing.com/wp-content/uploads/2021/05/Eagle-True-2-40-Underlayment-052321-digital.pdf'),

  ('brochure',      'Rake Seal Flyer',
   'Product flyer for Eagle Rake Seal edge protection for tile roofs.',
   'Tile accessories selection',
   'https://eagleroofing.com/wp-content/uploads/2020/06/Eagle-Rake-Seal-Flyer-050120-digital-1.pdf'),

  ('brochure',      'Ventilated Roof System Brochure',
   'Full brochure for Eagle VRS ventilated roof system for concrete tile.',
   'Energy efficiency upsell, ventilation',
   'https://eagleroofing.com/wp-content/uploads/2020/07/EAGLE-2020-VRS-Brochure-070820-digital.pdf'),

  ('brochure',      'Secure Roll Underlayment Brochure',
   'Product brochure for Eagle Secure Roll self-adhered underlayment.',
   'Premium underlayment selection',
   'https://eagleroofing.com/wp-content/uploads/2022/10/Secure-Roll-Brochure.pdf'),

  ('brochure',      'Concrete vs. Asphalt Comparison Brochure',
   'Side-by-side comparison of concrete roof tile vs asphalt shingles — durability, cost, aesthetics.',
   'Client presentation, material selection',
   'https://eagleroofing.com/wp-content/uploads/2019/11/EAGLE-2019-comparison-brochure-FIN-121318-singles.pdf')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'eagle-roofing'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 4. METAL SALES — Real PDFs from metalsales.us.com/literature
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('catalog',       'Metal Sales 2026 Product Catalog',
   'Complete product catalog covering all Metal Sales roofing and wall panels, trim, and accessories.',
   'Product ordering, spec lookup, estimating',
   'https://www.metalsales.us.com/wp-content/uploads/2026/02/MS-Product-Catalog-2026-02.pdf'),

  ('catalog',       'Light Gauge Product Catalog',
   'Dedicated catalog for Metal Sales light gauge metal roofing and siding products.',
   'Light gauge product selection',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Light-Gauge-Brochure-2020.pdf'),

  ('brochure',      'Residential Metal Roofing Brochure 2026',
   'Comprehensive residential metal roofing brochure with product options, colors, and benefits.',
   'Homeowner presentation, residential sales',
   'https://www.metalsales.us.com/wp-content/uploads/2026/01/Residential-Brochure_2026.pdf'),

  ('brochure',      'Residential Metal Roofing Overview',
   'Overview brochure covering residential metal roofing benefits, profiles, and color options.',
   'Client presentation',
   'https://www.metalsales.us.com/wp-content/uploads/2020/01/metal-sales-residential-brochure-1-1.pdf'),

  ('color_chart',   'Colors to Complete Your Vision Guide',
   'Architectural color guide with full palette of Metal Sales metal roofing and siding colors.',
   'Client color selection, design consultation',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Arch-Color-Guide-Complete-Your-Vision-2019.pdf'),

  ('brochure',      'IMPACT Building Systems Brochure',
   'Brochure for Metal Sales IMPACT insulated metal panel building systems.',
   'Commercial project proposals',
   'https://www.metalsales.us.com/wp-content/uploads/2025/07/IMPACT-Brochure-CIA-2-2023.pdf'),

  ('spec_sheet',    'IMPACT Building Systems Flyer',
   'Quick reference flyer for IMPACT insulated metal panel systems.',
   'Quick product overview',
   'https://www.metalsales.us.com/wp-content/uploads/2025/07/IMPact-Flyer-4-23.pdf'),

  ('spec_sheet',    'Board and Batten Panel Flyer',
   'Product flyer for Metal Sales Board and Batten architectural wall panel.',
   'Architectural panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2025/11/Board-and-Batten-Flyer_11-2025.pdf'),

  ('spec_sheet',    'Verti-Rib Panel Flyer',
   'Product flyer for Metal Sales Verti-Rib concealed fastener panel.',
   'Panel product selection',
   'https://www.metalsales.us.com/wp-content/uploads/2025/11/Verti-Rib-Flyer-2025-11.pdf'),

  ('spec_sheet',    'Classic Rib Panel Sell Sheet',
   'Sell sheet for Metal Sales Classic Rib exposed fastener panel — the #1 selling metal panel.',
   'Panel selection, estimating',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Classic-Rib_Sell_Sheet-2024.pdf'),

  ('spec_sheet',    'PBR Panel Sell Sheet',
   'Sell sheet for Metal Sales PBR (Purlin Bearing Rib) structural panel.',
   'Commercial/agricultural panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/PBR-Panel_Sell_Sheet-2023.pdf'),

  ('spec_sheet',    'Vertical Seam Standing Seam Sell Sheet',
   'Sell sheet for Metal Sales Vertical Seam snap-lock standing seam panel.',
   'Standing seam product selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Vertical-Seam-Sell-Sheet-2023.pdf'),

  ('spec_sheet',    '7/8" Corrugated Panel Sell Sheet',
   'Sell sheet for Metal Sales 7/8" Corrugated structural metal panel.',
   'Industrial/commercial panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/78-Corrugated-Sell-Sheet-2024.pdf'),

  ('spec_sheet',    'Pro-Panel II Sell Sheet',
   'Sell sheet for Metal Sales Pro-Panel II concealed fastener wall and roof panel.',
   'Commercial panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Pro-Panel-II-Sell-Sheet-2023.pdf'),

  ('spec_sheet',    '5V-Crimp Panel Sell Sheet',
   'Sell sheet for Metal Sales 5V-Crimp traditional metal roofing panel.',
   'Traditional metal roof selection',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/5V-Crimp_Sell_Sheet-Final-3.pdf'),

  ('spec_sheet',    'Corrugated Panels Sell Sheet',
   'Sell sheet for Metal Sales standard corrugated wall and roofing panels.',
   'Budget metal panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Corrugated-Sell-Sheet-2024.pdf'),

  ('spec_sheet',    'Soffit Panel Sell Sheet',
   'Sell sheet for Metal Sales vented and solid soffit panels.',
   'Soffit product selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Soffit_Sell_Sheet-2023.pdf'),

  ('spec_sheet',    'DL-3 Panel Sell Sheet',
   'Sell sheet for Metal Sales DL-3 architectural wall panel.',
   'Architectural panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/DL-3-Sell-Sheet-2024.pdf'),

  ('spec_sheet',    'Magna-Loc Standing Seam Sell Sheet',
   'Sell sheet for Metal Sales Magna-Loc mechanically seamed standing seam panel.',
   'Standing seam product selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Magna-Loc-Sell-Sheet-2022.pdf'),

  ('spec_sheet',    'Image II Panel Sell Sheet',
   'Sell sheet for Metal Sales Image II concealed fastener architectural panel.',
   'Architectural panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/06/Image-II-2024.pdf'),

  ('spec_sheet',    'Empire Series Panel Flyer',
   'Product flyer for Metal Sales Empire Series premium architectural panels.',
   'Premium panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2026/01/Empire-Line-Flyer-2026.pdf'),

  ('brochure',      'Apex Series Architectural Flyer',
   'Product flyer for Metal Sales Apex Series standing seam architectural panels.',
   'Architectural panel presentation',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Apex-Series-Flyer-2020.pdf'),

  ('brochure',      'Contempra Series Flyer',
   'Product flyer for Metal Sales Contempra Series concealed fastener panels.',
   'Modern panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Contempra-Series-2020.pdf'),

  ('brochure',      'Retro-Master Post-Purlin System Brochure',
   'Brochure for Metal Sales Retro-Master retrofit roofing system using post-purlin method.',
   'Re-roof over existing, retrofit projects',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Retro-Master_MS_Brochure-2020.pdf'),

  ('brochure',      'Retro-Master Metal Over Metal System',
   'Brochure for Metal Sales Retro-Master metal-over-metal re-roofing system.',
   'Metal re-roof projects',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Metal-over-Metal-Roof-Hugger-2020.pdf'),

  ('spec_sheet',    'MS Colorfast45 Paint Advantages',
   'Technical flyer on Metal Sales Colorfast45 premium paint finish advantages.',
   'Paint finish selection, warranty upsell',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/MS-Colorfast45-Advantages-2020.pdf'),

  ('spec_sheet',    'PVDF Paint Finish Brochure',
   'Technical brochure on Metal Sales PVDF (Kynar 500) premium paint systems.',
   'Premium finish specification',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Paint-Brochure-PVDF.pdf'),

  ('spec_sheet',    'MS-HT Underlayment Info Sheet',
   'Technical info sheet for Metal Sales MS-HT high-temperature underlayment.',
   'Metal roof underlayment selection',
   'https://www.metalsales.us.com/wp-content/uploads/2024/04/ms-HT-Info-Sheet-4-2024.pdf'),

  ('brochure',      'Strongpanel Structural Panel Brochure',
   'Product brochure for Metal Sales Strongpanel heavy-gauge structural panel.',
   'Structural panel selection',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/STRONGPANEL-BROCHURE-82017.pdf'),

  ('brochure',      'Weathering Steel Panel Flyer',
   'Product flyer for Metal Sales weathering (Corten) steel panels.',
   'Architectural weathering steel projects',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Weathering_Steel-Metal-_Sales.pdf'),

  ('brochure',      'Finishing Touch Trim & Accessories',
   'Guide to Metal Sales trim, flashing, and accessories — the finishing touches for metal projects.',
   'Trim and accessories ordering',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Finishing-Touch.pdf'),

  ('brochure',      'Questions and Answers — Metal Roofing',
   'FAQ brochure addressing common homeowner questions about metal roofing.',
   'Homeowner education, objection handling',
   'https://www.metalsales.us.com/wp-content/uploads/2023/06/Questions-and-Answers-2020.pdf')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'metal-sales'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 5. TREMCO ROOFING — Real PDFs from tremcoroofing.com/resources
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('spec_sheet',    'AlphaGrade Base Coat Data Sheet',
   'Technical data sheet for Tremco AlphaGrade liquid-applied base coat — US and Canada.',
   'Commercial roof coating specification',
   'https://www.tremcoroofing.com/media/Roofing/Product%20Detail%20Pages/Liquid%20Applied%20Roof%20Coatings/AlphaGrade%20BC/AlphaGrade_BC_DS.pdf'),

  ('install_guide', 'AlphaGrade Base Flashing — Parapet Wall Detail',
   'Isometric detail drawing for AlphaGrade base flashing at parapet wall with metal coping.',
   'Commercial flashing installation reference',
   'https://www.tremcoroofing.com/media/Roofing/Detail%20Drawings/Liquid%20Applied%20Systems%20--%20Isometric/Application/Liquid%20Applied%20--%20AlphaGrade/PDFs/LA-GR-1-BASE-FLASHING-AT-PARAPET-WALL-WITH-METAL-COPING.pdf'),

  ('install_guide', 'AlphaGrade Equipment Support Curb Detail',
   'Isometric detail drawing for AlphaGrade base flashing at lightweight equipment support curb.',
   'Commercial roof penetration details',
   'https://www.tremcoroofing.com/media/Roofing/Detail%20Drawings/Liquid%20Applied%20Systems%20--%20Isometric/Application/Liquid%20Applied%20--%20AlphaGrade/PDFs/LA-GR-10-BASE-FLASHING-AT-LIGHTWEIGHT-EQUIPMENT-SUPPORT-CURB.pdf'),

  ('install_guide', 'AlphaGrade Equipment Stand Leg Detail',
   'Isometric detail drawing for AlphaGrade equipment support stand leg installation.',
   'Commercial roof equipment mounting',
   'https://www.tremcoroofing.com/media/Roofing/Detail%20Drawings/Liquid%20Applied%20Systems%20--%20Isometric/Application/Liquid%20Applied%20--%20AlphaGrade/PDFs/LA-GR-11-EQUIPMENT-SUPPORT-STAND-LEG-Model.pdf'),

  ('install_guide', 'AlphaGrade Equipment Stand Leg — Membrane Coated',
   'Detail drawing for membrane-coated equipment support stand leg with AlphaGrade system.',
   'Commercial roof equipment details',
   'https://www.tremcoroofing.com/media/Roofing/Detail%20Drawings/Liquid%20Applied%20Systems%20--%20Isometric/Application/Liquid%20Applied%20--%20AlphaGrade/PDFs/LA-GR-11A-EQUIPMENT-SUPPORT-STAND-LEG-MEMBRANE-COATED-Model.pdf')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'tremco'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 6. GAF — Document Library links (JS-rendered SPA, no direct PDF scraping)
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'GAF Document Library — All Brochures & Specs',
   'Complete document library with brochures, spec sheets, install guides, and warranty docs for all GAF products.',
   'Client presentation, crew reference, code compliance',
   'https://www.gaf.com/en-us/document-library'),

  ('brochure',      'GAF Timberline HDZ Product Page',
   'Product information page for GAF Timberline HDZ — America''s #1 selling shingle with LayerLock technology.',
   'Client presentation, proposal support',
   'https://www.gaf.com/en-us/roofing-products/residential-roofing-products/shingles/timberline-hdz-shingles'),

  ('color_chart',   'GAF Shingle Color Selector',
   'Interactive color selection tool with neighborhood photo visualizer for all GAF shingle lines.',
   'Client color selection, design consultation',
   'https://www.gaf.com/en-us/roofing-products/residential-roofing-products/shingles'),

  ('warranty_doc',  'GAF Warranty Information Center',
   'Complete GAF warranty center — Golden Pledge, Silver Pledge, System Plus warranty details and registration.',
   'Client closing, warranty registration',
   'https://www.gaf.com/en-us/warranties'),

  ('brochure',      'GAF Roofing Academy — Training Resources',
   'GAF contractor training resources, certification programs, and CARE continuing education.',
   'Crew training, certification prep',
   'https://www.gaf.com/en-us/for-professionals/roofing-academy')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'gaf'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 7. OWENS CORNING — Product page links (JS-rendered)
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'OC Duration Shingle Product Page',
   'Complete product page for Owens Corning TruDefinition Duration with SureNail Technology.',
   'Client presentation, proposal support',
   'https://www.owenscorning.com/en-us/roofing/shingles/trudefinition-duration'),

  ('brochure',      'OC Duration STORM Impact-Resistant Shingle',
   'Product page for OC Duration STORM Class 4 impact-resistant architectural shingle.',
   'Storm damage repair, impact-resistant upgrades',
   'https://www.owenscorning.com/en-us/roofing/shingles/trudefinition-duration-storm'),

  ('color_chart',   'OC Shingle Color Gallery',
   'Full color gallery with all TruDefinition color blends and Design EyeQ visualizer tool.',
   'Client color selection, design consultation',
   'https://www.owenscorning.com/en-us/roofing/shingles/colors'),

  ('warranty_doc',  'OC Total Protection Roofing System Warranty',
   'Complete warranty documentation for Owens Corning Total Protection Roofing System.',
   'Client closing, warranty registration',
   'https://www.owenscorning.com/en-us/roofing/warranty'),

  ('brochure',      'OC Contractor Resources & Literature',
   'Owens Corning professional resources hub — product literature, installation guides, training.',
   'Product literature, training resources',
   'https://www.owenscorning.com/en-us/roofing/tools/literature-samples')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'owens-corning'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 8. CERTAINTEED — Document center links
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'CertainTeed Document Center — All Products',
   'Complete document center with tech specs, brochures, warranties, and sustainability docs for all CertainTeed products.',
   'Product literature, spec sheets, warranties',
   'https://www.certainteed.com/products/documents-downloads?documentRegion=US&documentLanguage=EN'),

  ('brochure',      'CertainTeed Landmark Product Page',
   'Product page for CertainTeed Landmark and Landmark PRO architectural shingles.',
   'Client presentation, proposal support',
   'https://www.certainteed.com/residential-roofing/products/landmark/'),

  ('color_chart',   'CertainTeed Color Explorer',
   'Full color exploration tool with all residential shingle color options and visualizer.',
   'Client color selection, design consultation',
   'https://www.certainteed.com/residential-roofing/colors/'),

  ('warranty_doc',  'CertainTeed SureStart Warranty Information',
   'SureStart and SureStart PLUS warranty details, coverage, and registration process.',
   'Client closing, warranty registration',
   'https://www.certainteed.com/residential-roofing/warranty/'),

  ('brochure',      'CertainTeed Credentialing Program',
   'CertainTeed contractor credential programs — ShingleMaster, SELECT ShingleMaster, and 5-Star credentials.',
   'Contractor certification, credential upsell',
   'https://www.certainteed.com/credentialing-program')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'certainteed'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 9. IKO — Resource links (403 on scraping, JS-rendered)
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'IKO Cambridge Architectural Shingle Page',
   'Product page for IKO Cambridge architectural shingles with ArmourZone fastening area.',
   'Client presentation, product selection',
   'https://www.ikoroofing.com/en-us/residential-roofing/shingles/cambridge/'),

  ('brochure',      'IKO Dynasty Impact-Resistant Shingle Page',
   'Product page for IKO Dynasty performance shingles — Class 4 impact rated.',
   'Storm damage repair, impact-resistant upgrades',
   'https://www.ikoroofing.com/en-us/residential-roofing/shingles/dynasty/'),

  ('brochure',      'IKO Contractor Resources',
   'IKO professional resources hub — product literature, tech bulletins, installation details.',
   'Product literature, installation reference',
   'https://www.ikoroofing.com/en-us/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'iko'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 10. MALARKEY — Resource links (JS-rendered SPA)
-- ============================================================================

INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Malarkey Vista AR Shingle Product Page',
   'Product page for Malarkey Vista AR architectural shingle with NEX polymer-modified asphalt.',
   'Client presentation, product selection',
   'https://www.malarkeyroofing.com/products/vista-ar'),

  ('brochure',      'Malarkey Legacy XL Shingle Product Page',
   'Product page for Malarkey Legacy XL premium heavyweight laminate shingle.',
   'Premium product presentation',
   'https://www.malarkeyroofing.com/products/legacy-xl'),

  ('brochure',      'Malarkey Contractor Resources & Downloads',
   'Malarkey professional resources — product brochures, sell sheets, installation videos, and training.',
   'Product literature, installation reference',
   'https://www.malarkeyroofing.com/professionals/resources')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'malarkey'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 11. REMAINING VENDORS — Resource/product page links
-- ============================================================================

-- ABC Supply
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('catalog',       'ABC Supply Product Catalog & Ordering',
   'ABC Supply online product catalog — roofing, siding, windows, gutters, and accessories.',
   'Product ordering, spec lookup',
   'https://www.abcsupply.com/products'),
  ('brochure',      'ABC Supply myABCsupply Contractor Portal',
   'myABCsupply contractor portal — order management, delivery scheduling, account tools.',
   'Order management, delivery coordination',
   'https://www.abcsupply.com/myabcsupply')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'abc-supply'
ON CONFLICT DO NOTHING;

-- SRS Distribution
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('catalog',       'SRS Distribution Product Catalog',
   'SRS Distribution product catalog — residential and commercial roofing, building products.',
   'Product ordering, spec lookup',
   'https://www.srsdistribution.com/products/'),
  ('brochure',      'SRS Roofing Supply Online Ordering',
   'SRS online ordering portal for roofing contractors.',
   'Online ordering, job materials',
   'https://www.srsdistribution.com/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'srs-distribution'
ON CONFLICT DO NOTHING;

-- Westlake Royal
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('catalog',       'Westlake Royal Roofing Product Line',
   'Complete product catalog for Westlake Royal stone-coated steel, concrete tile, and composite products.',
   'Product selection, client presentation',
   'https://www.westlakeroyalroofing.com/products/'),
  ('brochure',      'Westlake Royal Resources & Literature',
   'Technical resources, installation guides, and product literature for Westlake Royal roofing.',
   'Installation reference, product specs',
   'https://www.westlakeroyalroofing.com/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'westlake-royal'
ON CONFLICT DO NOTHING;

-- Elite Roofing Supply
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'catalog', 'Elite Roofing Supply Product Catalog',
   'Elite Roofing Supply product offerings — roofing materials, accessories, and contractor supplies.',
   'Product ordering, local supply',
   'https://www.eliteroofingsupply.com/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'elite-roofing-supply'
ON CONFLICT DO NOTHING;

-- DECRA
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'DECRA Stone-Coated Steel Product Line',
   'Complete product overview for DECRA stone-coated steel roofing — Shake XD, Shingle XD, Tile, Villa Tile.',
   'Premium roof product presentation',
   'https://www.decra.com/products/'),
  ('brochure',      'DECRA Resources & Literature',
   'DECRA technical resources, product literature, installation guides, and warranty information.',
   'Installation reference, warranty details',
   'https://www.decra.com/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'decra'
ON CONFLICT DO NOTHING;

-- Firestone Building Products
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Firestone Commercial Roofing Systems',
   'Complete overview of Firestone commercial roofing systems — EPDM, TPO, modified bitumen.',
   'Commercial project proposals',
   'https://www.firestonebpco.com/roofing/'),
  ('brochure',      'Firestone Resources & Literature',
   'Firestone technical resources, spec sheets, installation details, and product documentation.',
   'Installation reference, specifications',
   'https://www.firestonebpco.com/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'firestone'
ON CONFLICT DO NOTHING;

-- Carlisle
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Carlisle SynTec Commercial Roofing Systems',
   'Complete overview of Carlisle SynTec single-ply roofing — TPO, EPDM, PVC systems.',
   'Commercial project proposals',
   'https://www.carlislesyntec.com/en/Products/'),
  ('brochure',      'Carlisle SynTec Resources & Literature',
   'Carlisle SynTec technical resources, specifications, installation guides, and documentation.',
   'Installation reference, specification lookup',
   'https://www.carlislesyntec.com/en/Resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'carlisle'
ON CONFLICT DO NOTHING;

-- Boral (now Westlake Royal)
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'brochure', 'Boral Roofing (Now Westlake Royal) Products',
   'Boral concrete and clay tile roofing products — now operating as Westlake Royal Roofing.',
   'Tile roofing product selection',
   'https://www.westlakeroyalroofing.com/products/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'boral'
ON CONFLICT DO NOTHING;

-- Gaco / GacoFlex
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Gaco Silicone Roof Coating Systems',
   'Product overview for Gaco silicone roof coatings — GacoRoof, GacoFlex, and GacoFlash.',
   'Roof coating project proposals',
   'https://gfrubber.com/silicone-roof-coatings/'),
  ('brochure',      'Gaco Spray Foam Roofing Products',
   'Product overview for Gaco spray polyurethane foam roofing insulation systems.',
   'SPF roof system proposals',
   'https://gfrubber.com/spray-foam-roofing/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'gaco'
ON CONFLICT DO NOTHING;

-- Johns Manville
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Johns Manville Commercial Roofing Products',
   'Complete overview of JM commercial roofing — TPO, EPDM, PVC, and built-up systems.',
   'Commercial roofing product selection',
   'https://www.jm.com/en/roofing/commercial-roofing/'),
  ('brochure',      'Johns Manville Resources & Literature',
   'JM technical resources hub — product data sheets, specifications, installation guides.',
   'Installation reference, specifications',
   'https://www.jm.com/en/roofing/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'johns-manville'
ON CONFLICT DO NOTHING;

-- Versico
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Versico Commercial Roofing Systems',
   'Complete overview of Versico single-ply roofing systems — TPO, PVC, EPDM.',
   'Commercial roofing product selection',
   'https://www.versico.com/products/'),
  ('brochure',      'Versico Literature & Resources',
   'Versico technical literature library — spec sheets, installation guides, warranty documents.',
   'Product specifications, installation reference',
   'https://www.versico.com/resources/literature/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'versico'
ON CONFLICT DO NOTHING;

-- Berridge
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Berridge Metal Roofing Products',
   'Complete product line overview for Berridge architectural and structural standing seam metal roofing.',
   'Metal roofing product selection',
   'https://www.berridge.com/products/'),
  ('color_chart',   'Berridge Metal Color Chart',
   'Full color options for Berridge metal roofing and wall panel systems.',
   'Client color selection',
   'https://www.berridge.com/colors/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'berridge'
ON CONFLICT DO NOTHING;

-- Polyglass
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'Polyglass Modified Bitumen Products',
   'Complete product line for Polyglass modified bitumen roofing — Elastoflex, Polyflex, Polyfresko.',
   'Commercial/low-slope roofing selection',
   'https://www.polyglass.us/products/'),
  ('brochure',      'Polyglass Resources & Literature',
   'Polyglass technical documentation — product data sheets, installation guides, and specifications.',
   'Installation reference, specifications',
   'https://www.polyglass.us/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'polyglass'
ON CONFLICT DO NOTHING;

-- APOC
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'brochure', 'APOC Roof Coatings & Waterproofing Products',
   'Complete product line for APOC roof coatings, sealants, and waterproofing products.',
   'Roof coating product selection',
   'https://www.apoc.com/products/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'apoc'
ON CONFLICT DO NOTHING;

-- Monier
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'brochure', 'Monier Concrete & Clay Roof Tile Products',
   'Product catalog for Monier concrete and clay roof tile — profiles, colors, and accessories.',
   'Tile roofing product selection',
   'https://www.monier.com/products/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'monier'
ON CONFLICT DO NOTHING;

-- Nucor Skyline
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'catalog', 'Nucor Skyline Steel Products Catalog',
   'Nucor Skyline steel piling, foundation, and structural products catalog.',
   'Structural steel product lookup',
   'https://www.nucorskyline.com/products/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'nucor-skyline'
ON CONFLICT DO NOTHING;

-- ATAS International
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, a.asset_type, a.title, a.description, a.use_case, a.pdf_url, 'roofing', true
FROM "Vendor" v,
(VALUES
  ('brochure',      'ATAS Architectural Metal Products',
   'ATAS International architectural metal roofing and wall panel product overview.',
   'Architectural metal panel selection',
   'https://www.atas.com/products/'),
  ('brochure',      'ATAS Resources & Literature',
   'ATAS technical resources, product data sheets, specifications, and installation details.',
   'Installation reference, specifications',
   'https://www.atas.com/resources/')
) AS a(asset_type, title, description, use_case, pdf_url)
WHERE v.slug = 'atas-intl'
ON CONFLICT DO NOTHING;

-- Roof Hugger
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'brochure', 'Roof Hugger Metal-Over-Metal Retrofit System',
   'Product information for Roof Hugger sub-purlin retrofit system for metal-over-metal re-roofing.',
   'Metal re-roof project proposals',
   'https://www.roofhugger.com/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'roof-hugger'
ON CONFLICT DO NOTHING;

-- Standing Seam USA
INSERT INTO vendor_assets (id, "vendorId", type, title, description, "jobUseCase", "pdfUrl", "tradeType", "isActive")
SELECT gen_random_uuid(), v.id, 'catalog', 'Standing Seam USA Panel Products',
   'Standing Seam USA metal roofing panel product catalog and ordering information.',
   'Standing seam panel selection',
   'https://www.standingseamusa.com/', 'roofing', true
FROM "Vendor" v
WHERE v.slug = 'standing-seam-usa'
ON CONFLICT DO NOTHING;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Total Assets After Migration' AS metric, COUNT(*) AS count FROM vendor_assets WHERE "isActive" = true
UNION ALL
SELECT 'TAMKO PDFs', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'tamko' AND a."isActive" = true
UNION ALL
SELECT 'Eagle Roofing PDFs', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'eagle-roofing' AND a."isActive" = true
UNION ALL
SELECT 'Metal Sales PDFs', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'metal-sales' AND a."isActive" = true
UNION ALL
SELECT 'Tremco PDFs', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'tremco' AND a."isActive" = true
UNION ALL
SELECT 'GAF Resources', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'gaf' AND a."isActive" = true
UNION ALL
SELECT 'Owens Corning Resources', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'owens-corning' AND a."isActive" = true
UNION ALL
SELECT 'CertainTeed Resources', COUNT(*) FROM vendor_assets a JOIN "Vendor" v ON a."vendorId" = v.id WHERE v.slug = 'certainteed' AND a."isActive" = true
UNION ALL
SELECT 'Vendors With Assets', COUNT(DISTINCT a."vendorId") FROM vendor_assets a WHERE a."isActive" = true;
