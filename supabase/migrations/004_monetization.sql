-- 走ログ migration 004
-- 収益化基盤 (有料会員・広告・アフィリエイト・サーキット提携階層)
--
-- 設計方針: 全機能はデフォルト OFF。
-- 段階的に feature_flags の enabled を ON にすることで公開していく。

-- ========= 運営権限 =========
-- 走ログ運営スタッフの識別 (フィーチャーフラグや課金設定の管理用)
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ========= プランの種類 =========
do $$ begin
  create type plan_tier as enum ('free', 'premium', 'pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum (
    'active', 'trialing', 'past_due', 'cancelled', 'expired'
  );
exception when duplicate_object then null; end $$;

-- ========= サブスクリプション =========
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier plan_tier not null default 'free',
  status subscription_status not null default 'active',
  -- 課金サイクル
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  -- 決済プロバイダ連携 (Stripe を想定。他プロバイダにも対応可能)
  provider text,                -- 'stripe' | 'manual' | etc.
  provider_customer_id text,
  provider_subscription_id text,
  -- 内部メモ (運営側からの操作履歴用)
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_status_idx
  on public.subscriptions(status);
create index if not exists subscriptions_provider_sub_idx
  on public.subscriptions(provider_subscription_id);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions self read" on public.subscriptions;
create policy "subscriptions self read" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 書き込みは service_role 経由のみ (Stripe webhook 等)

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- 全ユーザーに free 行を自動投入するトリガー (新規登録時)
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, tier, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created_subscription on public.profiles;
create trigger on_profile_created_subscription
  after insert on public.profiles
  for each row execute function public.handle_new_subscription();

-- 既存ユーザーにも free を補充
insert into public.subscriptions (user_id, tier, status)
select id, 'free', 'active' from public.profiles
on conflict (user_id) do nothing;

-- ========= プラン上限 (運営から調整可能) =========
create table if not exists public.plan_limits (
  tier plan_tier primary key,
  max_cars int,                    -- null = unlimited
  max_lap_photos int,
  max_laps_per_month int,
  max_video_seconds int,
  features jsonb not null default '[]'::jsonb,  -- enabled feature keys
  display_name text not null,
  description text,
  monthly_price_jpy int,
  yearly_price_jpy int,
  updated_at timestamptz not null default now()
);

drop trigger if exists plan_limits_set_updated_at on public.plan_limits;
create trigger plan_limits_set_updated_at
  before update on public.plan_limits
  for each row execute function public.set_updated_at();

-- 初期値
insert into public.plan_limits
  (tier, max_cars, max_lap_photos, max_laps_per_month, max_video_seconds,
   features, display_name, description, monthly_price_jpy, yearly_price_jpy)
values
  ('free', 3, 1, 10, 0,
   '["basic_ranking","basic_share"]',
   'Free', '無料プラン。サービスお試し用。',
   0, 0),
  ('premium', null, 10, null, 300,
   '["basic_ranking","basic_share","no_ads","detailed_analytics","rival_compare","condition_correlation","video_upload","csv_export","record_alerts","private_mode","page_themes","premium_badge"]',
   'Premium', '走り込み派におすすめ。広告非表示・分析グラフ・動画対応。',
   390, 3900),
  ('pro', null, null, null, 1800,
   '["basic_ranking","basic_share","no_ads","detailed_analytics","rival_compare","condition_correlation","video_upload","csv_export","record_alerts","private_mode","page_themes","premium_badge","telemetry_import","ai_analysis","coaching","team_features","api_access"]',
   'Pro', 'ヘビーユーザー向け。テレメトリー連携・AI 分析・チーム機能。',
   980, 9800)
on conflict (tier) do update set
  max_cars = excluded.max_cars,
  max_lap_photos = excluded.max_lap_photos,
  max_laps_per_month = excluded.max_laps_per_month,
  max_video_seconds = excluded.max_video_seconds,
  features = excluded.features,
  display_name = excluded.display_name,
  description = excluded.description,
  monthly_price_jpy = excluded.monthly_price_jpy,
  yearly_price_jpy = excluded.yearly_price_jpy;

alter table public.plan_limits enable row level security;
drop policy if exists "plan_limits read" on public.plan_limits;
create policy "plan_limits read" on public.plan_limits for select using (true);

-- ========= フィーチャーフラグ (機能のオン/オフ切替) =========
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

drop trigger if exists feature_flags_set_updated_at on public.feature_flags;
create trigger feature_flags_set_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

-- 初期フラグ (全て OFF からスタート)
insert into public.feature_flags (key, description) values
  ('billing_enabled',           '有料プランの申込・決済を有効化'),
  ('ads_enabled',               '広告枠を表示'),
  ('affiliate_enabled',         'アフィリエイトリンクを表示'),
  ('marketplace_enabled',       '中古パーツマーケットプレイスを公開'),
  ('circuit_partner_enabled',   'サーキット提携プラン(B2B)を有効化'),
  ('premium_features_visible',  '有料機能を UI に表示 (ロック含む)'),
  ('limits_enforced',           'プラン上限を実際に強制 (false=ログのみ)'),
  ('annual_report_enabled',     '年次レポート機能'),
  ('coaching_enabled',          'コーチング機能 (Pro)')
on conflict (key) do nothing;

alter table public.feature_flags enable row level security;
drop policy if exists "feature_flags read" on public.feature_flags;
create policy "feature_flags read" on public.feature_flags for select using (true);

drop policy if exists "feature_flags admin write" on public.feature_flags;
create policy "feature_flags admin write" on public.feature_flags
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ========= 広告枠 =========
create table if not exists public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text unique not null,        -- 'ranking_top' | 'circuit_side' | 'lap_bottom' etc.
  enabled boolean not null default false,
  network text,                         -- 'adsense' | 'direct' | etc.
  html text,                            -- 直接埋め込みコード or 広告タグ
  fallback_text text,                   -- 表示無効時のフォールバック (将来枠を埋める文言)
  visible_to_free_only boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists ad_slots_set_updated_at on public.ad_slots;
create trigger ad_slots_set_updated_at
  before update on public.ad_slots
  for each row execute function public.set_updated_at();

insert into public.ad_slots (slot_key, network) values
  ('ranking_top',       'adsense'),
  ('ranking_inline',    'adsense'),
  ('circuit_side',      'adsense'),
  ('lap_bottom',        'adsense'),
  ('home_inline',       'adsense')
on conflict (slot_key) do nothing;

alter table public.ad_slots enable row level security;
drop policy if exists "ad_slots read" on public.ad_slots;
create policy "ad_slots read" on public.ad_slots for select using (true);
drop policy if exists "ad_slots admin write" on public.ad_slots;
create policy "ad_slots admin write" on public.ad_slots
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ========= アフィリエイトリンク =========
create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,    -- 'tire' | 'circuit' | 'parts' | 'driving_school'
  resource_id uuid,               -- tire_id 等。null は汎用リンク
  network text not null,          -- 'amazon' | 'rakuten' | 'fuji_corp' | 'autoway' etc.
  label text not null,            -- 表示テキスト ("このタイヤを Amazon で買う" 等)
  url text not null,
  enabled boolean not null default true,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_links_lookup_idx
  on public.affiliate_links(resource_type, resource_id, enabled);

drop trigger if exists affiliate_links_set_updated_at on public.affiliate_links;
create trigger affiliate_links_set_updated_at
  before update on public.affiliate_links
  for each row execute function public.set_updated_at();

alter table public.affiliate_links enable row level security;
drop policy if exists "affiliate_links read" on public.affiliate_links;
create policy "affiliate_links read" on public.affiliate_links
  for select using (enabled = true);

-- ========= サーキット提携プランの階層 =========
do $$ begin
  create type circuit_partner_tier as enum ('bronze', 'silver', 'gold');
exception when duplicate_object then null; end $$;

alter table public.circuits
  add column if not exists partner_tier circuit_partner_tier,
  add column if not exists partner_started_at timestamptz,
  add column if not exists partner_period_end timestamptz;

-- ========= 利用ログ (上限カウント用) =========
-- ラップ投稿の月次集計を効率化するためのキャッシュテーブル
create table if not exists public.usage_counters (
  user_id uuid not null references public.profiles(id) on delete cascade,
  period text not null,                 -- '2026-05' (YYYY-MM)
  laps_posted int not null default 0,
  photos_uploaded int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, period)
);

alter table public.usage_counters enable row level security;
drop policy if exists "usage_counters self read" on public.usage_counters;
create policy "usage_counters self read" on public.usage_counters
  for select using (auth.uid() = user_id);

drop trigger if exists usage_counters_set_updated_at on public.usage_counters;
create trigger usage_counters_set_updated_at
  before update on public.usage_counters
  for each row execute function public.set_updated_at();

-- ラップ追加で usage_counters を自動更新するトリガー
create or replace function public.bump_lap_counter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p text := to_char(now(), 'YYYY-MM');
begin
  insert into public.usage_counters (user_id, period, laps_posted)
  values (new.user_id, p, 1)
  on conflict (user_id, period)
  do update set laps_posted = usage_counters.laps_posted + 1;
  return new;
end;
$$;

drop trigger if exists on_lap_inserted_bump on public.lap_times;
create trigger on_lap_inserted_bump
  after insert on public.lap_times
  for each row execute function public.bump_lap_counter();

-- ========= マーケットプレイス (将来公開用) =========
do $$ begin
  create type marketplace_status as enum ('draft', 'active', 'sold', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  car_id uuid references public.cars(id) on delete set null,
  title text not null,
  description text,
  price_jpy int not null check (price_jpy >= 0),
  category text,                            -- 'tire' | 'wheel' | 'suspension' | etc.
  condition text,                           -- 'new' | 'used_a' | 'used_b' | 'used_c'
  status marketplace_status not null default 'draft',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_items_seller_idx
  on public.marketplace_items(seller_id);
create index if not exists marketplace_items_status_idx
  on public.marketplace_items(status, is_published);

drop trigger if exists marketplace_items_set_updated_at on public.marketplace_items;
create trigger marketplace_items_set_updated_at
  before update on public.marketplace_items
  for each row execute function public.set_updated_at();

alter table public.marketplace_items enable row level security;

drop policy if exists "marketplace_items read" on public.marketplace_items;
create policy "marketplace_items read" on public.marketplace_items
  for select using (is_published = true or auth.uid() = seller_id);

drop policy if exists "marketplace_items owner write" on public.marketplace_items;
create policy "marketplace_items owner write" on public.marketplace_items
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

-- ========= ヘルパービュー =========
-- ログインユーザーの「現在の有効プラン」を返す簡易ビュー
create or replace view public.my_plan as
select
  s.user_id,
  s.tier,
  s.status,
  s.current_period_end,
  pl.max_cars,
  pl.max_lap_photos,
  pl.max_laps_per_month,
  pl.max_video_seconds,
  pl.features,
  pl.display_name,
  pl.description
from public.subscriptions s
join public.plan_limits pl on pl.tier = s.tier
where s.user_id = auth.uid()
  and s.status in ('active', 'trialing');
