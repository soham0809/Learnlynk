-- LearnLynk Tech Test - Task 2: RLS Policies on leads

alter table public.leads enable row level security;

-- Example helper: assume JWT has tenant_id, user_id, role.
-- You can use: current_setting('request.jwt.claims', true)::jsonb

-- TODO: write a policy so:
-- - counselors see leads where they are owner_id OR in one of their teams
-- - admins can see all leads of their tenant


-- Example skeleton for SELECT (replace with your own logic):

-- Helper function to get jwt claims (optional, but makes queries cleaner)
-- or just inline it. We'll inline to keep it single-file simple.

-- 1. SELECT Policy
-- Counselors: see own leads OR leads in their teams
-- Admins: see all leads in tenant
create policy "leads_select_policy"
on public.leads
for select
using (
  -- Tenant isolation is always required
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
  and
  (
    -- Admin role check
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'
    or
    -- Owner check
    owner_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::uuid
    or
    -- Team check: Lead's team is one of the user's teams
    team_id in (
       select team_id from public.user_teams
       where user_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'user_id')::uuid
    )
  )
);

-- 2. INSERT Policy
-- Counselors/Admins can insert leads for their tenant
create policy "leads_insert_policy"
on public.leads
for insert
with check (
  -- Must be same tenant
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid
  -- Implicitly allows any authenticated user with a tenant_id to insert, assuming 'authenticated' role or similar.
  -- If we need to strictly check 'counselor' or 'admin' role:
  and
  (current_setting('request.jwt.claims', true)::jsonb ->> 'role') in ('admin', 'counselor')
);
