-- 走ログ migration 009
-- 通報機能 + アカウント削除リクエスト管理

-- ========= 通報テーブル =========
do $$ begin
  create type report_subject_type as enum (
    'lap_time', 'car', 'profile', 'circuit_event', 'tire', 'comment'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason as enum (
    'spam',                -- スパム・宣伝
    'fake_time',           -- 虚偽のタイム
    'inappropriate',       -- 不適切な内容
    'impersonation',       -- なりすまし
    'copyright',           -- 著作権侵害
    'harassment',          -- 嫌がらせ
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum (
    'open', 'in_review', 'resolved', 'dismissed'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  subject_type report_subject_type not null,
  subject_id uuid not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason report_reason not null,
  detail text,
  status report_status not null default 'open',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_subject_idx on public.reports(subject_type, subject_id);
create index if not exists reports_status_idx on public.reports(status, created_at);
create index if not exists reports_reporter_idx on public.reports(reporter_id);

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

-- 認証済みユーザーは通報を投稿可能 (匿名通報は許可しない)
drop policy if exists "reports insert auth" on public.reports;
create policy "reports insert auth" on public.reports
  for insert with check (auth.uid() is not null);

-- 自分が出した通報は確認可能
drop policy if exists "reports self read" on public.reports;
create policy "reports self read" on public.reports
  for select using (auth.uid() = reporter_id);

-- 運営者は全件読み書き可能
drop policy if exists "reports admin read" on public.reports;
create policy "reports admin read" on public.reports
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "reports admin write" on public.reports;
create policy "reports admin write" on public.reports
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ========= アカウント削除リクエスト履歴 =========
-- 削除実行は Server Action からだが、監査ログとして残す
create table if not exists public.account_deletions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,                -- 削除済ユーザーへの参照は外す (cascade で消えないように)
  username text,
  email text,
  reason text,
  deleted_at timestamptz not null default now()
);

create index if not exists account_deletions_user_idx
  on public.account_deletions(user_id);

alter table public.account_deletions enable row level security;
-- 運営者のみ閲覧
drop policy if exists "account_deletions admin read" on public.account_deletions;
create policy "account_deletions admin read" on public.account_deletions
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
