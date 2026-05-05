-- 走ログ migration 003
-- 愛車のギャラリー写真テーブル + Storage バケット

create table if not exists public.car_photos (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  storage_path text not null,
  caption text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists car_photos_car_idx on public.car_photos(car_id);

alter table public.car_photos enable row level security;

drop policy if exists "car_photos read" on public.car_photos;
create policy "car_photos read" on public.car_photos for select using (true);

drop policy if exists "car_photos owner write" on public.car_photos;
create policy "car_photos owner write" on public.car_photos
  for all using (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.cars c
      where c.id = car_id and c.user_id = auth.uid()
    )
  );

-- car-covers バケットは schema.sql で既に作成済み
-- 既存のオーナー書き込みポリシーは "auth.uid()::text = (storage.foldername(name))[1]" に基づく
-- すなわち path が `<user_id>/...` で始まれば書き込み可能
