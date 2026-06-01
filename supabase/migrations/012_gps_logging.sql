-- 走ログ migration 012
-- GPS ロガー (走ログロガー Phase 1) 対応
-- ラップの計測方法 (手入力 / GPS) と GPS 軌跡 (エビデンス) を保存する。

-- ========= lap_times に計測ソースを追加 =========
alter table public.lap_times
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'gps')),
  -- GPS 計測ラップは軌跡データがエビデンスになるため検証済みフラグを立てられる
  add column if not exists gps_verified boolean not null default false;

create index if not exists laps_source_idx on public.lap_times(source);

-- ========= GPS 軌跡 (エビデンス) =========
-- 軌跡は lap_times とは別テーブルに保存して本体を肥大化させない。
-- points は [{t,lat,lng,spd}, ...] の JSON 配列。
create table if not exists public.lap_gps_traces (
  id uuid primary key default gen_random_uuid(),
  lap_time_id uuid not null references public.lap_times(id) on delete cascade,
  points jsonb not null,
  point_count int,
  -- 計測端末・アプリの情報 (デバッグ/信頼性評価用)
  device text,
  -- 計測時の平均水平精度 (m)
  avg_accuracy numeric(6, 2),
  created_at timestamptz not null default now(),
  unique (lap_time_id)
);

create index if not exists lap_gps_traces_lap_idx
  on public.lap_gps_traces(lap_time_id);

alter table public.lap_gps_traces enable row level security;

drop policy if exists "lap_gps_traces read" on public.lap_gps_traces;
create policy "lap_gps_traces read" on public.lap_gps_traces
  for select using (true);

drop policy if exists "lap_gps_traces owner write" on public.lap_gps_traces;
create policy "lap_gps_traces owner write" on public.lap_gps_traces
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
