-- Token orders (Stripe or manual)
create table if not exists token_orders (
  id text primary key,
  org_id uuid not null,
  pack_id text not null references token_packs(id),
  stripe_session_id text unique,
  stripe_payment_intent text unique,
  status text not null default 'created',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Credit helper (idempotent by order id)
create or replace function credit_tokens_by_order(p_org uuid, p_pack text, p_order text)
returns int language plpgsql as $$
declare
  v_tokens int;
  v_prev int;
  v_next int;
begin
  select tokens into v_tokens from token_packs where id = p_pack;
  if v_tokens is null then raise exception 'pack not found'; end if;

  perform 1 from tokens_ledger where ref_id = p_order and delta > 0;
  if found then
    select balance_after into v_next
      from tokens_ledger where ref_id = p_order and delta > 0
      order by created_at desc limit 1;
    return v_next;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_org::text));
  select coalesce(balance_after,0) into v_prev
    from tokens_ledger where org_id = p_org order by created_at desc limit 1 for update;

  v_next := v_prev + v_tokens;

  insert into tokens_ledger (id, org_id, delta, reason, ref_id, balance_after)
  values (gen_random_uuid()::text, p_org, v_tokens, 'purchase_pack', p_order, v_next);

  return v_next;
end $$;

-- Monthly reset upsert (YYYY-MM)
create or replace function network_usage_reset_month(p_org uuid, p_year_month char(7))
returns void language sql as $$
  insert into network_usage_monthly (id, org_id, year_month, posts_used, outreach_used)
  values (gen_random_uuid()::text, p_org, p_year_month, 0, 0)
  on conflict (org_id, year_month) do update set posts_used = 0, outreach_used = 0, updated_at = now();
$$;
