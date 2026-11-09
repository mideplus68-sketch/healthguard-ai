-- Keep personal profile photos in a private, owner-scoped bucket.
alter table public.profiles
  add column if not exists avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'healthguard-profile-photos',
  'healthguard-profile-photos',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = 2097152,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[];

drop policy if exists "owners manage their HealthGuard profile photos" on storage.objects;
create policy "owners manage their HealthGuard profile photos"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'healthguard-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'healthguard-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

