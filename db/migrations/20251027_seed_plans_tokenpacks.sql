insert into plans (id,slug,name,price_cents,posts_limit,outreach_limit,seats)
values
  ('plan_solo','solo','Solo',2999,2,2,1),
  ('plan_pro','pro','Pro',7999,5,5,3),
  ('plan_business','business','Business',12999,15,15,5),
  ('plan_enterprise','enterprise','Enterprise',39999,50,50,15)
on conflict (id) do update set updated_at=now();

insert into token_packs (id,name,tokens,price_cents) values
  ('pack10','10 tokens',10,1000),
  ('pack50','50 tokens',50,4000),
  ('pack150','150 tokens',150,10000)
on conflict (id) do update set updated_at=now();
