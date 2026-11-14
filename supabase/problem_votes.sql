-- "What are the world's biggest problems?" form on /ai-problems.
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- How moderation works:
--   * Anyone can submit (insert). Nothing they write is shown publicly until you approve it.
--   * The public tally counts every non-rejected answer by category (counts only, no text).
--   * Free-text answers appear publicly only after you set status = 'approved'
--     (Table Editor → problem_votes → edit the status cell).

create table if not exists public.problem_votes (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  category    text not null check (char_length(category) between 1 and 60),  -- a problem_id from the site, or 'other'
  problem     text check (problem is null or char_length(problem) <= 200),   -- in their own words (optional)
  why         text check (why is null or char_length(why) <= 500),           -- optional
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

alter table public.problem_votes enable row level security;

-- Visitors may only add new, pending rows.
drop policy if exists "anyone can submit" on public.problem_votes;
create policy "anyone can submit" on public.problem_votes
  for insert to anon with check (status = 'pending');

-- Visitors may read only approved rows (for the write-in list).
drop policy if exists "approved rows are public" on public.problem_votes;
create policy "approved rows are public" on public.problem_votes
  for select to anon using (status = 'approved');

-- Public tally: counts per category over all non-rejected answers. Counts only, no text.
create or replace view public.problem_vote_stats as
  select category, count(*)::int as votes
  from public.problem_votes
  where status <> 'rejected'
  group by category;

-- Approved write-ins, grouped so the same answer counts together.
create or replace view public.problem_vote_writeins as
  select lower(trim(problem)) as problem, count(*)::int as mentions
  from public.problem_votes
  where status = 'approved' and problem is not null and trim(problem) <> ''
  group by lower(trim(problem));

grant select on public.problem_vote_stats, public.problem_vote_writeins to anon;
