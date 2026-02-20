-- Schema Audit: Compare row counts in public vs app schemas
SELECT 'users' as tbl, 'public' as schema, count(*) FROM public.users
UNION ALL SELECT 'users', 'app', count(*) FROM app.users
UNION ALL SELECT 'Org', 'public', count(*) FROM public."Org"
UNION ALL SELECT 'Org', 'app', count(*) FROM app."Org"
UNION ALL SELECT 'claims', 'public', count(*) FROM public.claims
UNION ALL SELECT 'claims', 'app', count(*) FROM app.claims
UNION ALL SELECT 'leads', 'public', count(*) FROM public.leads
UNION ALL SELECT 'leads', 'app', count(*) FROM app.leads
UNION ALL SELECT 'user_organizations', 'public', count(*) FROM public.user_organizations
UNION ALL SELECT 'user_organizations', 'app', count(*) FROM app.user_organizations
UNION ALL SELECT 'tradesCompanyMember', 'public', count(*) FROM public."tradesCompanyMember"
UNION ALL SELECT 'tradesCompanyMember', 'app', count(*) FROM app."tradesCompanyMember"
UNION ALL SELECT 'tradesCompany', 'public', count(*) FROM public."tradesCompany"
UNION ALL SELECT 'tradesCompany', 'app', count(*) FROM app."tradesCompany"
UNION ALL SELECT 'Message', 'public', count(*) FROM public."Message"
UNION ALL SELECT 'Message', 'app', count(*) FROM app."Message"
UNION ALL SELECT 'jobs', 'public', count(*) FROM public.jobs
UNION ALL SELECT 'jobs', 'app', count(*) FROM app.jobs
UNION ALL SELECT 'contacts', 'public', count(*) FROM public.contacts
UNION ALL SELECT 'contacts', 'app', count(*) FROM app.contacts
UNION ALL SELECT 'Vendor', 'public', count(*) FROM public."Vendor"
UNION ALL SELECT 'Vendor', 'app', count(*) FROM app."Vendor"
UNION ALL SELECT 'Subscription', 'public', count(*) FROM public."Subscription"
UNION ALL SELECT 'Subscription', 'app', count(*) FROM app."Subscription"
UNION ALL SELECT 'TokenWallet', 'public', count(*) FROM public."TokenWallet"
UNION ALL SELECT 'TokenWallet', 'app', count(*) FROM app."TokenWallet"
UNION ALL SELECT 'tokens_ledger', 'public', count(*) FROM public.tokens_ledger
UNION ALL SELECT 'tokens_ledger', 'app', count(*) FROM app.tokens_ledger
UNION ALL SELECT '_prisma_migrations', 'public', count(*) FROM public._prisma_migrations
UNION ALL SELECT '_prisma_migrations', 'app', count(*) FROM app._prisma_migrations
ORDER BY tbl, schema;
