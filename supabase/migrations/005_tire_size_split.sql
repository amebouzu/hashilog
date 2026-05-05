-- 走ログ migration 005
-- タイヤサイズをフロント / リアの2カラムに分割
-- + 一般ユーザーが新規タイヤ銘柄を登録できるように tires の RLS を緩和

-- ========= lap_times.tire_size を front/rear に分割 =========
alter table public.lap_times
  add column if not exists tire_size_front text,
  add column if not exists tire_size_rear text;

-- 既存データを front 列にコピー (元は前後同一サイズ前提)
update public.lap_times
  set tire_size_front = tire_size,
      tire_size_rear = tire_size
  where tire_size is not null
    and tire_size_front is null;

-- 旧 tire_size 列は互換のため残置 (アプリ側は新カラムを優先)。
-- 完全移行後に下記でドロップ可能:
--   alter table public.lap_times drop column tire_size;

-- ========= tires のユーザー登録を許可 =========
-- これまで tires への INSERT は service_role のみ。
-- ユーザーが新規銘柄を入力できるよう、認証済みユーザーに INSERT 権限を付与。
-- (重複は brand+model の unique 制約で防がれる → upsert に対応)

drop policy if exists "tires user insert" on public.tires;
create policy "tires user insert" on public.tires
  for insert
  with check (auth.uid() is not null);

-- 監査用に投稿者を記録 (任意)
alter table public.tires
  add column if not exists submitted_by uuid references public.profiles(id) on delete set null,
  add column if not exists is_verified boolean not null default false;

-- 既存銘柄 (seed 投入済み) は verified にしておく
update public.tires set is_verified = true where submitted_by is null;
