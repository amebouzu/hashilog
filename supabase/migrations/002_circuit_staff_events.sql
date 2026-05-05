-- 走ログ migration 002
-- サーキット運営者と告知イベント機能を追加

-- ========= サーキット運営者 =========
-- 1ユーザーが複数サーキットの運営者になれる多対多テーブル
create table if not exists public.circuit_staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  circuit_id uuid not null references public.circuits(id) on delete cascade,
  role text not null default 'editor' check (role in ('editor', 'admin')),
  created_at timestamptz not null default now(),
  unique (user_id, circuit_id)
);

create index if not exists circuit_staff_user_idx on public.circuit_staff(user_id);
create index if not exists circuit_staff_circuit_idx on public.circuit_staff(circuit_id);

alter table public.circuit_staff enable row level security;

drop policy if exists "circuit_staff read" on public.circuit_staff;
create policy "circuit_staff read" on public.circuit_staff
  for select using (true);

-- circuit_staff の書き込みは走ログ運営 (service_role) のみ
-- ※ 通常のユーザーは自分で運営者権限を取得できない

-- ========= サーキットページの編集可能項目 =========
-- 公式運営者が更新できるフィールドを circuits に追加
alter table public.circuits
  add column if not exists description text,
  add column if not exists features text[],
  add column if not exists famous_corners text[],
  add column if not exists official_url text,
  add column if not exists is_published boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

-- 編集権限: その circuit_id に対応する circuit_staff のレコードがある場合のみ更新可
drop policy if exists "circuits read" on public.circuits;
create policy "circuits read" on public.circuits
  for select using (is_published = true or exists (
    select 1 from public.circuit_staff cs
    where cs.circuit_id = circuits.id and cs.user_id = auth.uid()
  ));

drop policy if exists "circuits staff update" on public.circuits;
create policy "circuits staff update" on public.circuits
  for update using (
    exists (
      select 1 from public.circuit_staff cs
      where cs.circuit_id = circuits.id and cs.user_id = auth.uid()
    )
  );

-- ========= イベント・告知 =========
create table if not exists public.circuit_events (
  id uuid primary key default gen_random_uuid(),
  circuit_id uuid not null references public.circuits(id) on delete cascade,
  event_type text not null default 'session'
    check (event_type in ('session', 'event', 'race', 'news')),
  title text not null,
  body text,
  starts_at timestamptz,
  ends_at timestamptz,
  date_label text, -- 表示用 ("毎週木曜" など固定スケジュールに対応)
  external_url text,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists circuit_events_circuit_idx on public.circuit_events(circuit_id);
create index if not exists circuit_events_starts_idx on public.circuit_events(starts_at);

alter table public.circuit_events enable row level security;

drop policy if exists "circuit_events read" on public.circuit_events;
create policy "circuit_events read" on public.circuit_events
  for select using (
    is_published = true
    or exists (
      select 1 from public.circuit_staff cs
      where cs.circuit_id = circuit_events.circuit_id and cs.user_id = auth.uid()
    )
  );

drop policy if exists "circuit_events staff write" on public.circuit_events;
create policy "circuit_events staff write" on public.circuit_events
  for all
  using (
    exists (
      select 1 from public.circuit_staff cs
      where cs.circuit_id = circuit_events.circuit_id and cs.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.circuit_staff cs
      where cs.circuit_id = circuit_events.circuit_id and cs.user_id = auth.uid()
    )
  );

-- ========= updated_at 自動更新 =========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists circuits_set_updated_at on public.circuits;
create trigger circuits_set_updated_at
  before update on public.circuits
  for each row execute function public.set_updated_at();

drop trigger if exists circuit_events_set_updated_at on public.circuit_events;
create trigger circuit_events_set_updated_at
  before update on public.circuit_events
  for each row execute function public.set_updated_at();

-- ========= ヘルパービュー: 自分が運営する circuit 一覧 =========
-- (アプリ側からは select * from my_circuits としてアクセス)
create or replace view public.my_circuits as
select c.*, cs.role
from public.circuits c
join public.circuit_staff cs on cs.circuit_id = c.id
where cs.user_id = auth.uid();
