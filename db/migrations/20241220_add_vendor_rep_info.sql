-- Add rep and brochure fields to trade_partners table
-- For vendor representative information and marketing materials

ALTER TABLE trade_partners
  ADD COLUMN IF NOT EXISTS rep_name TEXT,
  ADD COLUMN IF NOT EXISTS rep_email TEXT,
  ADD COLUMN IF NOT EXISTS rep_phone TEXT,
  ADD COLUMN IF NOT EXISTS rep_title TEXT,
  ADD COLUMN IF NOT EXISTS brochure_url TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for searching by rep
CREATE INDEX IF NOT EXISTS idx_trade_partners_rep_email ON trade_partners(rep_email);
CREATE INDEX IF NOT EXISTS idx_trade_partners_business_name ON trade_partners("businessName");
