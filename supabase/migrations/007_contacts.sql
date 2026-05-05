-- 走ログ migration 007
-- お問い合わせフォームの送信内容を保存するテーブル

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text not null check (category in (
    'general', 'partnership', 'sponsor', 'bug', 'feature', 'account', 'other'
  )),
  subject text not null,
  message text not null,
  -- ログイン中のユーザーから送信された場合は記録 (匿名送信も許可)
  user_id uuid references public.profiles(id) on delete set null,
  user_agent text,
  -- 運営側のステータス管理
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_status_idx on public.contacts(status, created_at);
create index if not exists contacts_user_idx on public.contacts(user_id);
create index if not exists contacts_email_idx on public.contacts(email);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;

-- 誰でも (未ログインでも) 送信可能
drop policy if exists "contacts insert" on public.contacts;
create policy "contacts insert" on public.contacts
  for insert with check (true);

-- 自分が送信したものは確認できる (ログイン後に履歴を見せたい場合用)
drop policy if exists "contacts self read" on public.contacts;
create policy "contacts self read" on public.contacts
  for select using (auth.uid() = user_id);

-- 運営者は全件読める
drop policy if exists "contacts admin read" on public.contacts;
create policy "contacts admin read" on public.contacts
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "contacts admin write" on public.contacts;
create policy "contacts admin write" on public.contacts
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
