-- Fix all vendor logos to use Google Favicons API (reliable, always available)
-- Previous state: mix of broken Clearbit URLs and nonexistent local /vendors/ paths
-- New state: all logos use https://www.google.com/s2/favicons?domain=<domain>&sz=128

SET search_path TO app;

UPDATE "Vendor"
SET logo = 'https://www.google.com/s2/favicons?domain=' ||
           regexp_replace(regexp_replace(website, '^https?://(www\.)?', ''), '/.*$', '') ||
           '&sz=128'
WHERE website IS NOT NULL AND website != '';
