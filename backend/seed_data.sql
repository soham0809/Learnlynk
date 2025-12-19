-- LearnLynk Tech Test - Seed Data for Testing
-- Run this in Supabase SQL Editor to populate your database with sample data

-- Insert test users
INSERT INTO public.users (id, tenant_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'admin'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'counselor'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'counselor')
ON CONFLICT (id) DO NOTHING;

-- Insert test teams
INSERT INTO public.teams (id, tenant_id, name) VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Sales Team'),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Support Team')
ON CONFLICT (id) DO NOTHING;

-- Insert user-team relationships
INSERT INTO public.user_teams (user_id, team_id) VALUES
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555'),
  ('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666')
ON CONFLICT DO NOTHING;

-- Insert test leads
INSERT INTO public.leads (tenant_id, owner_id, email, phone, full_name, stage, source, team_id) VALUES
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'john@example.com', '+1-555-0101', 'John Smith', 'new', 'Website', '55555555-5555-5555-5555-555555555555'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'sarah@example.com', '+1-555-0102', 'Sarah Johnson', 'contacted', 'Referral', '55555555-5555-5555-5555-555555555555'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'mike@example.com', '+1-555-0103', 'Mike Davis', 'new', 'LinkedIn', '66666666-6666-6666-6666-666666666666'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'emma@example.com', '+1-555-0104', 'Emma Wilson', 'qualified', 'Cold Call', NULL)
ON CONFLICT DO NOTHING;

-- Insert test applications (linked to leads)
INSERT INTO public.applications (tenant_id, lead_id, program_id, intake_id, stage, status)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  'inquiry',
  'open'
FROM public.leads
LIMIT 4
ON CONFLICT DO NOTHING;

-- Insert test tasks (some due today, some in future)
INSERT INTO public.tasks (tenant_id, application_id, title, type, status, due_at)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'Follow up with inquiry',
  'call',
  'open',
  NOW() + INTERVAL '2 hours'
FROM public.applications
LIMIT 1;

INSERT INTO public.tasks (tenant_id, application_id, title, type, status, due_at)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'Send welcome email',
  'email',
  'open',
  NOW() + INTERVAL '5 hours'
FROM public.applications
OFFSET 1 LIMIT 1;

INSERT INTO public.tasks (tenant_id, application_id, title, type, status, due_at)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'Review application documents',
  'review',
  'open',
  NOW() + INTERVAL '1 hour'
FROM public.applications
OFFSET 2 LIMIT 1;

INSERT INTO public.tasks (tenant_id, application_id, title, type, status, due_at)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'Schedule interview call',
  'call',
  'completed',
  NOW() - INTERVAL '1 day'
FROM public.applications
OFFSET 3 LIMIT 1;

-- Insert tasks for tomorrow
INSERT INTO public.tasks (tenant_id, application_id, title, type, status, due_at)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'Send application reminder',
  'email',
  'open',
  NOW() + INTERVAL '1 day' + INTERVAL '3 hours'
FROM public.applications
LIMIT 1;
