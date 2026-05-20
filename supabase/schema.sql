create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamp with time zone default now()
);

create table if not exists public.saved_videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id text not null,
  title text not null,
  thumbnail text,
  youtube_url text not null,
  saved_at timestamp with time zone default now(),
  unique (user_id, video_id)
);

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id text not null,
  video_title text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.screenshots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_id text not null,
  video_title text not null,
  file_url text not null,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
alter table public.saved_videos enable row level security;
alter table public.notes enable row level security;
alter table public.screenshots enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;
drop policy if exists "saved_videos_select_own" on public.saved_videos;
drop policy if exists "saved_videos_insert_own" on public.saved_videos;
drop policy if exists "saved_videos_update_own" on public.saved_videos;
drop policy if exists "saved_videos_delete_own" on public.saved_videos;
drop policy if exists "notes_select_own" on public.notes;
drop policy if exists "notes_insert_own" on public.notes;
drop policy if exists "notes_update_own" on public.notes;
drop policy if exists "notes_delete_own" on public.notes;
drop policy if exists "screenshots_select_own" on public.screenshots;
drop policy if exists "screenshots_insert_own" on public.screenshots;
drop policy if exists "screenshots_update_own" on public.screenshots;
drop policy if exists "screenshots_delete_own" on public.screenshots;

create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_own"
  on public.profiles for delete
  using (id = auth.uid());

create policy "saved_videos_select_own"
  on public.saved_videos for select
  using (user_id = auth.uid());

create policy "saved_videos_insert_own"
  on public.saved_videos for insert
  with check (user_id = auth.uid());

create policy "saved_videos_update_own"
  on public.saved_videos for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "saved_videos_delete_own"
  on public.saved_videos for delete
  using (user_id = auth.uid());

create policy "notes_select_own"
  on public.notes for select
  using (user_id = auth.uid());

create policy "notes_insert_own"
  on public.notes for insert
  with check (user_id = auth.uid());

create policy "notes_update_own"
  on public.notes for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notes_delete_own"
  on public.notes for delete
  using (user_id = auth.uid());

create policy "screenshots_select_own"
  on public.screenshots for select
  using (user_id = auth.uid());

create policy "screenshots_insert_own"
  on public.screenshots for insert
  with check (user_id = auth.uid());

create policy "screenshots_update_own"
  on public.screenshots for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "screenshots_delete_own"
  on public.screenshots for delete
  using (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "screenshots_bucket_public_read" on storage.objects;
drop policy if exists "screenshots_bucket_insert_own" on storage.objects;
drop policy if exists "screenshots_bucket_update_own" on storage.objects;
drop policy if exists "screenshots_bucket_delete_own" on storage.objects;

create policy "screenshots_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "screenshots_bucket_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "screenshots_bucket_update_own"
  on storage.objects for update
  using (
    bucket_id = 'screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "screenshots_bucket_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

notify pgrst, 'reload schema';
