-- 走ログ schema
-- Run this in the Supabase SQL editor of a fresh project.

create extension if not exists "pgcrypto";

-- ========= profiles =========
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles
  for select using (true);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'driver_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'display_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========= circuits =========
create table if not exists public.circuits (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  prefecture text not null,
  length_m integer,
  sectors smallint not null default 3,
  created_at timestamptz not null default now()
);

alter table public.circuits enable row level security;
drop policy if exists "circuits read" on public.circuits;
create policy "circuits read" on public.circuits for select using (true);

-- ========= tires =========
create table if not exists public.tires (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  -- category は廃止 (旧カラム互換のため null 許容で残置)
  category text,
  created_at timestamptz not null default now(),
  unique (brand, model)
);

alter table public.tires enable row level security;
drop policy if exists "tires read" on public.tires;
create policy "tires read" on public.tires for select using (true);

-- ========= cars =========
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  maker text not null,
  model text not null,
  year integer,
  color text,
  cover_url text,
  description text,
  mods_suspension text,
  mods_engine text,
  mods_exterior text,
  mods_interior text,
  mods_brake text,
  mods_drivetrain text,
  power_ps integer,
  weight_kg integer,
  created_at timestamptz not null default now()
);

create index if not exists cars_user_idx on public.cars(user_id);
create index if not exists cars_model_idx on public.cars(maker, model);

alter table public.cars enable row level security;
drop policy if exists "cars read" on public.cars;
create policy "cars read" on public.cars for select using (true);
drop policy if exists "cars owner write" on public.cars;
create policy "cars owner write" on public.cars
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========= lap_times =========
create table if not exists public.lap_times (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  circuit_id uuid not null references public.circuits(id) on delete restrict,
  tire_id uuid references public.tires(id) on delete set null,
  tire_size text,
  total_ms integer not null check (total_ms > 0),
  sector1_ms integer,
  sector2_ms integer,
  sector3_ms integer,
  sector4_ms integer,
  top_speed_kmh integer,
  weather text not null default 'sunny'
    check (weather in ('sunny','cloudy','rain','heavy_rain','snow','mixed')),
  track_condition text not null default 'dry'
    check (track_condition in ('dry','damp','wet')),
  air_temp_c numeric(4,1),
  track_temp_c numeric(4,1),
  driven_at date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists laps_circuit_total_idx
  on public.lap_times(circuit_id, total_ms);
create index if not exists laps_user_idx on public.lap_times(user_id);
create index if not exists laps_car_idx on public.lap_times(car_id);

alter table public.lap_times enable row level security;
drop policy if exists "laps read" on public.lap_times;
create policy "laps read" on public.lap_times for select using (true);
drop policy if exists "laps owner write" on public.lap_times;
create policy "laps owner write" on public.lap_times
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========= lap_photos =========
create table if not exists public.lap_photos (
  id uuid primary key default gen_random_uuid(),
  lap_time_id uuid not null references public.lap_times(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists lap_photos_lap_idx on public.lap_photos(lap_time_id);

alter table public.lap_photos enable row level security;
drop policy if exists "lap_photos read" on public.lap_photos;
create policy "lap_photos read" on public.lap_photos for select using (true);
drop policy if exists "lap_photos owner write" on public.lap_photos;
create policy "lap_photos owner write" on public.lap_photos
  for all using (
    exists (
      select 1 from public.lap_times l
      where l.id = lap_time_id and l.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.lap_times l
      where l.id = lap_time_id and l.user_id = auth.uid()
    )
  );

-- ========= storage buckets =========
-- Run AFTER creating buckets in the dashboard, or use:
insert into storage.buckets (id, name, public)
values ('lap-photos', 'lap-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('car-covers', 'car-covers', true)
on conflict (id) do nothing;

-- Storage policies: anyone can read; only owner (path starts with user id) can write
drop policy if exists "lap-photos read" on storage.objects;
create policy "lap-photos read" on storage.objects
  for select using (bucket_id in ('lap-photos','car-covers'));

drop policy if exists "lap-photos owner write" on storage.objects;
create policy "lap-photos owner write" on storage.objects
  for insert with check (
    bucket_id in ('lap-photos','car-covers')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "lap-photos owner update" on storage.objects;
create policy "lap-photos owner update" on storage.objects
  for update using (
    bucket_id in ('lap-photos','car-covers')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "lap-photos owner delete" on storage.objects;
create policy "lap-photos owner delete" on storage.objects
  for delete using (
    bucket_id in ('lap-photos','car-covers')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
