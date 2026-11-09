-- Persist the selected built-in avatar for each HealthGuard household profile.
alter table public.profiles
  add column if not exists avatar text not null default '3d-0';

update public.profiles
set avatar = '3d-0'
where avatar is null or avatar !~ '^3d-[0-9]+$';

