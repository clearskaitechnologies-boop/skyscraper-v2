-- Normalize vendor trade types to match UI SERVICE_CATEGORIES
SET search_path TO app;

-- 1. Normalize ALL trade types to lowercase
UPDATE "Vendor"
SET "tradeTypes" = (
  SELECT array_agg(lower(t))
  FROM unnest("tradeTypes") AS t
)
WHERE EXISTS (
  SELECT 1 FROM unnest("tradeTypes") AS t WHERE t != lower(t)
);

-- 2. Add windows_doors for vendors that have both windows AND doors
UPDATE "Vendor"
SET "tradeTypes" = array_append("tradeTypes", 'windows_doors')
WHERE 'windows' = ANY("tradeTypes") AND 'doors' = ANY("tradeTypes") AND NOT 'windows_doors' = ANY("tradeTypes");

-- 3. Add carpentry for vendors tagged with framing
UPDATE "Vendor"
SET "tradeTypes" = array_append("tradeTypes", 'carpentry')
WHERE 'framing' = ANY("tradeTypes") AND NOT 'carpentry' = ANY("tradeTypes");

-- 4. Fix paint -> painting (UI expects 'painting')
UPDATE "Vendor"
SET "tradeTypes" = array_replace("tradeTypes", 'paint', 'painting')
WHERE 'paint' = ANY("tradeTypes");

-- 5. Fix flooring (some may have 'Flooring' -> already lowered, just ensure)
-- 6. Fix gutters (some may have 'Gutters' -> already lowered)
-- 7. Fix insulation (some may have 'Insulation' -> already lowered)

-- Verify final state
SELECT unnest("tradeTypes") AS trade, COUNT(*) AS vendor_count
FROM "Vendor" WHERE "isActive" = true
GROUP BY trade ORDER BY trade;
