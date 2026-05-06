-- 走ログ migration 010
-- タイヤ銘柄(tires.id への参照)を front / rear で分けて保持できるように lap_times を拡張。
-- 既存 tire_id は互換のため残置 (front 値と同期させる運用)。

-- ========= lap_times に tire_id_front / tire_id_rear を追加 =========
alter table public.lap_times
  add column if not exists tire_id_front uuid references public.tires(id) on delete set null,
  add column if not exists tire_id_rear  uuid references public.tires(id) on delete set null;

-- 既存データを front/rear ともに既存 tire_id で埋める (前後同銘柄前提)
update public.lap_times
  set tire_id_front = tire_id,
      tire_id_rear  = tire_id
  where tire_id is not null
    and tire_id_front is null
    and tire_id_rear is null;

-- 検索用インデックス (フィルタ性能向上)
create index if not exists laps_tire_front_idx on public.lap_times(tire_id_front);
create index if not exists laps_tire_rear_idx  on public.lap_times(tire_id_rear);

-- 注: 旧 tire_id 列は完全移行後に下記でドロップ可能。
--   alter table public.lap_times drop column tire_id;
