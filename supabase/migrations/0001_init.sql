-- MatchFrame initial schema
-- Run via: supabase db push  (or paste into the SQL editor)

set search_path = public;

-- =====================================================================
-- Profiles (mirrors auth.users; created via trigger)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  profile_photo text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id);

-- Create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- PhotoTest — one analysis run
-- =====================================================================
create type photo_test_status as enum ('pending_payment', 'queued', 'processing', 'completed', 'failed');

create table if not exists public.photo_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status photo_test_status not null default 'pending_payment',
  min_age int not null default 25,
  max_age int not null default 34,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_photo_tests_user on public.photo_tests(user_id, created_at desc);

alter table public.photo_tests enable row level security;
drop policy if exists "photo_tests_owner_all" on public.photo_tests;
create policy "photo_tests_owner_all" on public.photo_tests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- Photos
-- =====================================================================
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  photo_test_id uuid not null references public.photo_tests(id) on delete cascade,
  storage_path text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_photos_test on public.photos(photo_test_id, position);

alter table public.photos enable row level security;
drop policy if exists "photos_owner_all" on public.photos;
create policy "photos_owner_all" on public.photos for all
  using (
    exists (select 1 from public.photo_tests t where t.id = photo_test_id and t.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.photo_tests t where t.id = photo_test_id and t.user_id = auth.uid())
  );

-- =====================================================================
-- PaymentHistory
-- =====================================================================
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_test_id uuid references public.photo_tests(id) on delete set null,
  amount_cents int not null,
  currency text not null default 'usd',
  description text,
  stripe_payment_intent_id text unique,
  stripe_session_id text unique,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists idx_payment_history_user on public.payment_history(user_id, created_at desc);

alter table public.payment_history enable row level security;
drop policy if exists "payment_history_owner_select" on public.payment_history;
create policy "payment_history_owner_select" on public.payment_history for select
  using (auth.uid() = user_id);
-- Inserts/updates only by service-role (Stripe webhook bypasses RLS via service key).

-- =====================================================================
-- Voters (the 100 AI female personas)
-- =====================================================================
create table if not exists public.voters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int not null,
  weight int,
  height int,
  skin text,
  eyes_color text,
  hair_color text,
  nationality text,
  job text,
  personality text,
  dating_goal text,
  lifestyle text,
  preference jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_voters_age on public.voters(age);

alter table public.voters enable row level security;
drop policy if exists "voters_read_all" on public.voters;
create policy "voters_read_all" on public.voters for select using (true);

-- =====================================================================
-- Votes (one per voter per photo_test)
-- =====================================================================
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references public.voters(id) on delete cascade,
  photo_test_id uuid not null references public.photo_tests(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (voter_id, photo_test_id)
);
create index if not exists idx_votes_test on public.votes(photo_test_id);
create index if not exists idx_votes_photo on public.votes(photo_id);

alter table public.votes enable row level security;
drop policy if exists "votes_owner_select" on public.votes;
create policy "votes_owner_select" on public.votes for select
  using (
    exists (select 1 from public.photo_tests t where t.id = photo_test_id and t.user_id = auth.uid())
  );

-- =====================================================================
-- PhotoReport (per-photo analysis row)
-- =====================================================================
create table if not exists public.photo_reports (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null unique references public.photos(id) on delete cascade,
  rank int not null,
  badge text not null,                         -- "Best Main Profile Photo", "Strong Supporting Photo" etc
  lead_photo_reason text,                      -- filled only for rank 1
  final_rank_description text not null,        -- short note shown in ranking list
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_photo_reports_rank on public.photo_reports(rank);

alter table public.photo_reports enable row level security;
drop policy if exists "photo_reports_owner_select" on public.photo_reports;
create policy "photo_reports_owner_select" on public.photo_reports for select
  using (
    exists (
      select 1 from public.photos p
      join public.photo_tests t on t.id = p.photo_test_id
      where p.id = photo_id and t.user_id = auth.uid()
    )
  );

-- =====================================================================
-- PhotoTestReport (per-test summary)
-- =====================================================================
create table if not exists public.photo_test_reports (
  id uuid primary key default gen_random_uuid(),
  photo_test_id uuid not null unique references public.photo_tests(id) on delete cascade,
  overall_description text not null,
  first_rank_explanation text not null,
  second_rank_explanation text,
  third_rank_explanation text,
  created_at timestamptz not null default now()
);

alter table public.photo_test_reports enable row level security;
drop policy if exists "photo_test_reports_owner_select" on public.photo_test_reports;
create policy "photo_test_reports_owner_select" on public.photo_test_reports for select
  using (
    exists (select 1 from public.photo_tests t where t.id = photo_test_id and t.user_id = auth.uid())
  );

-- =====================================================================
-- NextSteps (recommendations attached to a report)
-- =====================================================================
create table if not exists public.next_steps (
  id uuid primary key default gen_random_uuid(),
  photo_test_report_id uuid not null references public.photo_test_reports(id) on delete cascade,
  text text not null,
  position int not null default 0
);
create index if not exists idx_next_steps_report on public.next_steps(photo_test_report_id, position);

alter table public.next_steps enable row level security;
drop policy if exists "next_steps_owner_select" on public.next_steps;
create policy "next_steps_owner_select" on public.next_steps for select
  using (
    exists (
      select 1 from public.photo_test_reports r
      join public.photo_tests t on t.id = r.photo_test_id
      where r.id = photo_test_report_id and t.user_id = auth.uid()
    )
  );
