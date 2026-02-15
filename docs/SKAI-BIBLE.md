# SKAI BIBLE — The Restoration Intelligence Network

Version: 0.1 (Phase 1)

## 1) Architecture Overview

**JSON-first** system. Every export (Claims, Proposal, Damage, Carrier) is assembled by:
Template → Add-ons → Composer → Builder → AI Polish → Exporter

- **Template**: Report type base (claims|retail|damage|carrier)
- **Add-ons**: Weather, DOL, Codes, Vendor Docs, QR, Map
- **Composer**: Assembles ordered Section list (dedupe, no-duplicate-pages)
- **Builder**: Renders to UI + PDF (landscape), pulls branding automatically
- **AI Polish**: Optional summarization and captions (token metered)
- **Exporter**: PDF, ZIP, or Share Link; logs token usage + telemetry

## 2) AI Engine Matrix (modules, triggers)

- ai.summary: run on Claims & Proposal when >2 sections present
- ai.captions: run when photos>0 or Damage Export selected
- ai.codes: run when Claim type or “codes-on” add-on set
- ai.weather: run when “weather-on” add-on set
- ai.mockup: standalone, but can inject mockup preview into Proposal

## 3) Section Registry (canonical)

- summary, map, photos, damage, weather, vendor, codes, pricing, footer

Rules:

- Always include **summary** first
- **map** auto-injects if lat/lng present
- **photos** dedupes; merges slots across tools
- **vendor** adds brand line + color palette when selected
- **footer** always included (configurable message)

## 4) Builder Rules

- Landscape 11x8.5
- No duplicate sections (dedupe by key)
- Branding required (logo or name; brand + accent colors)
- If branding missing, display neutral Skai header and warn in telemetry

## 5) Export Rules

- PDF: default
- ZIP: carrier box summary (tables only)
- Share: tokenized public link (read-only)

## 6) Token/Billing Map (baseline)

- ai.summary: 3 tokens
- ai.captions: 1 token/photo
- ai.codes: 5 tokens
- ai.weather: 2 tokens
- mockup: 10 tokens
- PDF generation: 0 tokens (covered by plan)
  Plans can override in `skai-structure.json`.

## 7) Feature Unlock Tiers

- lite: Proposal + Quick PDF
- pro: Claims, Damage, Weather, Codes, Carrier Export
- enterprise: VRP/Dispatch, Multi-crew routing, Share links, Advanced catalogs

## 8) JSON-Driven Philosophy

All report assembly flows from **/config/skai-structure.json** and **/src/lib/registry**.
