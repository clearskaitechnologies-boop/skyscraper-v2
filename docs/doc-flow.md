# Document Flow — Template → Add-ons → Composer → Builder → AI → Export

1. Read `/config/skai-structure.json` by reportType.
2. Start with `reports[reportType].sections` (base).
3. Compose with `/src/lib/registry/SectionRegistry.composeSections()`.
4. Evaluate AI modules from `/src/lib/registry/AIEngineRegistry.ts` using triggers.
5. Fetch branding; if missing, use fallback from JSON.
6. Render landscape PDF via core template; inject sections in order.
7. Export: PDF (default) and/or ZIP (carrier); create share token if requested.
8. Log telemetry + tokens into `tool_runs`; enqueue notification.
