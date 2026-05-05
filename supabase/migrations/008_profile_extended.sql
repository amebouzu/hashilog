-- 走ログ migration 008
-- プロフィールに居住地・SNS・自己紹介関連フィールドを追加

alter table public.profiles
  add column if not exists prefecture text,
  add column if not exists sns_x text,
  add column if not exists sns_instagram text,
  add column if not exists sns_threads text,
  add column if not exists sns_youtube text,
  add column if not exists sns_facebook text,
  add column if not exists sns_tiktok text,
  add column if not exists website_url text;

-- avatar_url / bio / display_name は既に schema.sql に存在

-- ========= avatars バケット =========
-- プロフィール画像専用 (公開)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 既存の lap-photos / car-covers と同じパターン:
-- path が <user_id>/... で始まればオーナー判定
drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select using (bucket_id in ('avatars', 'lap-photos', 'car-covers'));

drop policy if exists "avatars owner write" on storage.objects;
create policy "avatars owner write" on storage.objects
  for insert with check (
    bucket_id in ('avatars', 'lap-photos', 'car-covers')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id in ('avatars', 'lap-photos', 'car-covers')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id in ('avatars', 'lap-photos', 'car-covers')
    and auth.uid()::text = (storage.foldername(name))[1]
  );
