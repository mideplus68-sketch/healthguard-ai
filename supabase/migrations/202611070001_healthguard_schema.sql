-- HealthGuard AI prototype schema. Stores user-entered records only.
-- No diagnosis, treatment recommendation, or clinician access is implemented.

create table if not exists public.profiles (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age between 0 and 125),
  kind text not null check (kind in ('Adult', 'Child')),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);

create table if not exists public.measurements (
  id text primary key,
  profile_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  recorded_on date not null,
  temperature_c numeric(4,1),
  note text not null default '',
  created_at timestamptz not null default now(),
  foreign key (profile_id, owner_id)
    references public.profiles(id, owner_id) on delete cascade,
  check (temperature_c is null or temperature_c between 20 and 50),
  check (temperature_c is not null or length(trim(note)) > 0)
);

create table if not exists public.symptom_checkins (
  id text primary key,
  profile_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  recorded_on date not null,
  symptoms text[] not null default '{}',
  red_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  foreign key (profile_id, owner_id)
    references public.profiles(id, owner_id) on delete cascade,
  check (cardinality(symptoms) > 0)
);

create table if not exists public.lab_results (
  id text primary key,
  profile_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  tested_on date not null,
  test_type text not null check (test_type in ('RDT', 'Microscopy')),
  result text not null check (result in ('Positive', 'Negative', 'Inconclusive')),
  laboratory_name text not null default 'Laboratory not specified',
  created_at timestamptz not null default now(),
  foreign key (profile_id, owner_id)
    references public.profiles(id, owner_id) on delete cascade
);

create index if not exists profiles_owner_id_idx on public.profiles(owner_id);
create index if not exists measurements_owner_date_idx on public.measurements(owner_id, recorded_on desc);
create index if not exists symptom_checkins_owner_date_idx on public.symptom_checkins(owner_id, recorded_on desc);
create index if not exists lab_results_owner_date_idx on public.lab_results(owner_id, tested_on desc);

alter table public.profiles enable row level security;
alter table public.measurements enable row level security;
alter table public.symptom_checkins enable row level security;
alter table public.lab_results enable row level security;

create policy "owners manage their own profiles"
  on public.profiles for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owners manage their own measurements"
  on public.measurements for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owners manage their own symptom checkins"
  on public.symptom_checkins for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owners manage their own lab results"
  on public.lab_results for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.measurements,
  public.symptom_checkins,
  public.lab_results
to authenticated;


