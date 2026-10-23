-- PPAU Electoral Voting System
-- Depends on: 20260521000000_membership_portal.sql (is_admin(), members, applications)

create extension if not exists "pgcrypto";

-- 1. Voters (linked to Supabase auth; one row per member)
create table if not exists voters (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  member_type text not null check (member_type in ('professional','student')),
  member_no text unique,
  is_verified boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Elections / polls
create table if not exists elections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  eligible_voters text not null default 'both'
    check (eligible_voters in ('professional','student','both')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft'
    check (status in ('draft','open','closed','published')),
  results_public boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- 3. Positions (President, Secretary, Student Rep, ...)
create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  title text not null,
  description text,
  eligible_voters text not null default 'both'
    check (eligible_voters in ('professional','student','both')),
  max_votes int not null default 1 check (max_votes >= 1),
  sort_order int not null default 0
);

create index if not exists idx_positions_election on positions (election_id, sort_order);

-- 4. Nominees (photo stored in Supabase Storage bucket "nominee-photos")
create table if not exists nominees (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references positions(id) on delete cascade,
  full_name text not null,
  photo_url text,
  bio text,
  manifesto text,
  created_at timestamptz not null default now()
);

create index if not exists idx_nominees_position on nominees (position_id);

-- 5. Ballots: records THAT a person voted for a position (not for whom)
create table if not exists ballots (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references voters(id) on delete cascade,
  position_id uuid not null references positions(id) on delete cascade,
  cast_at timestamptz not null default now(),
  unique (voter_id, position_id)
);

create index if not exists idx_ballots_position on ballots (position_id);

-- 6. Votes: records the choice, with NO voter_id (secret ballot)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references positions(id) on delete cascade,
  nominee_id uuid not null references nominees(id) on delete cascade,
  cast_at timestamptz not null default now()
);

create index if not exists idx_votes_nominee on votes (nominee_id);
create index if not exists idx_votes_position on votes (position_id);

-- 7. Audit log (admin actions)
create table if not exists audit_log (
  id bigserial primary key,
  actor uuid,
  action text not null,
  detail jsonb,
  at timestamptz not null default now()
);

-- Atomic vote casting: validates eligibility + window, writes ballot and vote together
create or replace function cast_vote(p_position uuid, p_nominee uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v voters%rowtype;
  pos positions%rowtype;
  el elections%rowtype;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to vote';
  end if;

  select * into v from voters where id = auth.uid();
  if not found or not v.is_verified then
    raise exception 'Not a verified voter';
  end if;

  select * into pos from positions where id = p_position;
  if not found then raise exception 'Unknown position'; end if;

  select * into el from elections where id = pos.election_id;
  if el.status <> 'open' or now() < el.starts_at or now() > el.ends_at then
    raise exception 'Election is not open';
  end if;

  if el.eligible_voters <> 'both' and el.eligible_voters <> v.member_type then
    raise exception 'Not eligible for this election';
  end if;
  if pos.eligible_voters <> 'both' and pos.eligible_voters <> v.member_type then
    raise exception 'Not eligible for this position';
  end if;

  if not exists (select 1 from nominees where id = p_nominee and position_id = p_position) then
    raise exception 'Nominee does not belong to this position';
  end if;

  insert into ballots (voter_id, position_id) values (v.id, p_position);
  insert into votes (position_id, nominee_id) values (p_position, p_nominee);
end;
$$;

-- Election admins: portal admins (JWT role) plus voters flagged is_admin.
-- SECURITY DEFINER avoids RLS recursion when the voters table is being queried.
create or replace function is_election_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_admin()
    or exists (select 1 from voters where id = auth.uid() and is_admin);
$$;

-- Results: only once the election is closed/published (or caller is admin)
drop function if exists election_results(uuid);

create or replace function election_results(p_election uuid)
returns table (
  position_id uuid,
  position_title text,
  sort_order int,
  nominee_id uuid,
  nominee_name text,
  photo_url text,
  vote_count bigint
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.title, p.sort_order, n.id, n.full_name, n.photo_url, count(vt.id)
  from positions p
  join elections e on e.id = p.election_id
  left join nominees n on n.position_id = p.id
  left join votes vt on vt.nominee_id = n.id
  where e.id = p_election
    and (
      (e.results_public and e.status in ('open','closed','published'))
      or e.status in ('closed','published')
      or is_election_admin()
    )
  group by p.id, p.title, p.sort_order, n.id, n.full_name, n.photo_url
  order by p.sort_order, count(vt.id) desc;
$$;

-- Create/link the current user's voter row from their membership record.
-- Self-registration is never auto-verified; an admin verifies before voting.
create or replace function ensure_voter_profile()
returns voters
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
  v_type text;
  v_no text;
  v_row voters%rowtype;
begin
  if v_uid is null then
    raise exception 'You must be signed in';
  end if;

  select * into v_row from voters where id = v_uid;
  if found then
    return v_row;
  end if;

  select m.full_name, lower(m.email), m.membership_type::text, m.membership_number
    into v_name, v_email, v_type, v_no
  from members m
  where m.user_id = v_uid
  order by m.created_at desc
  limit 1;

  if v_name is null then
    select a.full_name, lower(a.email), a.membership_type::text, a.membership_number
      into v_name, v_email, v_type, v_no
    from membership_applications a
    where a.user_id = v_uid
      and a.status = 'approved'
    order by a.created_at desc
    limit 1;
  end if;

  if v_name is null then
    v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
    raise exception 'No approved membership found for this account';
  end if;

  insert into voters (id, full_name, email, member_type, member_no)
  values (v_uid, v_name, coalesce(nullif(v_email, ''), lower(auth.jwt() ->> 'email')), v_type, v_no)
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    member_type = excluded.member_type,
    member_no = coalesce(excluded.member_no, voters.member_no)
  returning * into v_row;

  return v_row;
end;
$$;

-- Admin helper: register a member's linked auth account as a voter
create or replace function register_voter_from_member(p_member_id uuid, p_verify boolean default true)
returns voters
language plpgsql
security definer
set search_path = public
as $$
declare
  m members%rowtype;
  v_row voters%rowtype;
begin
  if not is_election_admin() then
    raise exception 'Only admins can register voters';
  end if;

  select * into m from members where id = p_member_id;
  if not found then raise exception 'Member not found'; end if;
  if m.user_id is null then raise exception 'Member has no linked login account'; end if;

  insert into voters (id, full_name, email, member_type, member_no, is_verified)
  values (m.user_id, m.full_name, lower(m.email), m.membership_type::text, m.membership_number, p_verify)
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    member_type = excluded.member_type,
    member_no = excluded.member_no,
    is_verified = voters.is_verified or excluded.is_verified
  returning * into v_row;

  insert into audit_log (actor, action, detail)
  values (auth.uid(), 'register_voter', jsonb_build_object('member_id', p_member_id, 'voter_id', v_row.id));

  return v_row;
end;
$$;

-- Row Level Security
alter table voters    enable row level security;
alter table elections enable row level security;
alter table positions enable row level security;
alter table nominees  enable row level security;
alter table ballots   enable row level security;
alter table votes     enable row level security;
alter table audit_log enable row level security;

-- Public-readable ballot paper content (only for non-draft elections)
drop policy if exists "read elections" on elections;
create policy "read elections" on elections for select using (status <> 'draft');

drop policy if exists "read positions" on positions;
create policy "read positions" on positions for select using (
  exists (select 1 from elections e where e.id = election_id and e.status <> 'draft'));

drop policy if exists "read nominees" on nominees;
create policy "read nominees" on nominees for select using (
  exists (select 1 from positions p join elections e on e.id = p.election_id
          where p.id = position_id and e.status <> 'draft'));

-- Voters see only their own row; admins see all
drop policy if exists "own voter row" on voters;
create policy "own voter row" on voters for select using (
  id = auth.uid() or is_election_admin());

-- Voters can see only their own ballots (to show "You have voted")
drop policy if exists "own ballots" on ballots;
create policy "own ballots" on ballots for select using (voter_id = auth.uid());

-- votes: NO select/insert policies on purpose. Everything goes through cast_vote() / election_results().

-- Admin write access to election content
drop policy if exists "admin manage elections" on elections;
create policy "admin manage elections" on elections for all
  using (is_election_admin()) with check (is_election_admin());

drop policy if exists "admin manage positions" on positions;
create policy "admin manage positions" on positions for all
  using (is_election_admin()) with check (is_election_admin());

drop policy if exists "admin manage nominees" on nominees;
create policy "admin manage nominees" on nominees for all
  using (is_election_admin()) with check (is_election_admin());

drop policy if exists "admin manage voters" on voters;
create policy "admin manage voters" on voters for all
  using (is_election_admin()) with check (is_election_admin());

drop policy if exists "admin read ballots" on ballots;
create policy "admin read ballots" on ballots for select using (is_election_admin());

drop policy if exists "admin read audit log" on audit_log;
create policy "admin read audit log" on audit_log for select using (is_election_admin());

-- Storage: public bucket for nominee photos; only admins can upload/change.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nominee-photos',
  'nominee-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "nominee photos public read" on storage.objects;
create policy "nominee photos public read" on storage.objects
  for select using (bucket_id = 'nominee-photos');

drop policy if exists "nominee photos admin write" on storage.objects;
create policy "nominee photos admin write" on storage.objects
  for all using (bucket_id = 'nominee-photos' and is_election_admin())
  with check (bucket_id = 'nominee-photos' and is_election_admin());
