-- Report Credit System Tables
-- Migration: Add credit wallet, purchases, and community report orders

-- Credit Wallet (one per org)
CREATE TABLE IF NOT EXISTS report_credit_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_wallet_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_wallet_org ON report_credit_wallet(org_id);

-- Credit Purchases (history of bundle purchases)
CREATE TABLE IF NOT EXISTS report_credit_purchase (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  plan_key VARCHAR(50) NOT NULL,
  credits_purchased INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  stripe_session_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_purchase_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT chk_purchase_status CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))
);

CREATE INDEX idx_purchase_org ON report_credit_purchase(org_id);
CREATE INDEX idx_purchase_stripe ON report_credit_purchase(stripe_session_id);
CREATE INDEX idx_purchase_status ON report_credit_purchase(status);

-- Community Report Orders (generated reports consuming credits)
CREATE TABLE IF NOT EXISTS community_report_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  report_sku VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  artifact_url TEXT,
  consumed_credits INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT fk_order_org FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT chk_order_status CHECK (status IN ('CREATED', 'GENERATING', 'READY', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_order_org ON community_report_order(org_id);
CREATE INDEX idx_order_status ON community_report_order(status);
CREATE INDEX idx_order_created ON community_report_order(created_at DESC);

COMMENT ON TABLE report_credit_wallet IS 'Stores report credit balance per organization';
COMMENT ON TABLE report_credit_purchase IS 'History of credit bundle purchases';
COMMENT ON TABLE community_report_order IS 'Community report generation orders';
