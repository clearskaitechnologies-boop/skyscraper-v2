-- Phase 10 Network & Client Portal Tables (idempotent)
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='trade_profiles') THEN
  CREATE TABLE trade_profiles (
    id text primary key,
    org_id text not null,
    company_name text not null,
    trade_type text not null,
    phone text,
    email text,
    website text,
    service_areas text,
    rating_summary double precision default 0,
    review_count int default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  CREATE INDEX trade_profiles_org_trade_idx ON trade_profiles(org_id, trade_type);
  RAISE NOTICE '✅ trade_profiles created';
 ELSE RAISE NOTICE '✅ trade_profiles exists'; END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='client_networks') THEN
  CREATE TABLE client_networks (
    id text primary key,
    org_id text not null,
    name text not null,
    slug text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  CREATE INDEX client_networks_org_slug_idx ON client_networks(org_id, slug);
  RAISE NOTICE '✅ client_networks created';
 ELSE RAISE NOTICE '✅ client_networks exists'; END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='client_contacts') THEN
  CREATE TABLE client_contacts (
    id text primary key,
    client_network_id text not null,
    name text not null,
    email text,
    phone text,
    role text,
    created_at timestamptz not null default now()
  );
  CREATE INDEX client_contacts_network_idx ON client_contacts(client_network_id);
  RAISE NOTICE '✅ client_contacts created';
 ELSE RAISE NOTICE '✅ client_contacts exists'; END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='client_network_trades') THEN
  CREATE TABLE client_network_trades (
    id text primary key,
    client_network_id text not null,
    trade_profile_id text not null,
    visibility jsonb,
    created_at timestamptz not null default now()
  );
  CREATE UNIQUE INDEX client_network_trades_unique ON client_network_trades(client_network_id, trade_profile_id);
  CREATE INDEX client_network_trades_trade_idx ON client_network_trades(trade_profile_id);
  RAISE NOTICE '✅ client_network_trades created';
 ELSE RAISE NOTICE '✅ client_network_trades exists'; END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='client_activity') THEN
  CREATE TABLE client_activity (
    id text primary key,
    client_network_id text not null,
    actor_type text not null,
    actor_id text,
    type text not null,
    message text,
    created_at timestamptz not null default now()
  );
  CREATE INDEX client_activity_network_type_idx ON client_activity(client_network_id, type);
  RAISE NOTICE '✅ client_activity created';
 ELSE RAISE NOTICE '✅ client_activity exists'; END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Phase 10 network schema migration complete'; END $$;