-- 既存DBに対する追加マイグレーション
-- (新規セットアップ済みの場合は schema.sql + seed.sql のみでOK)

-- 1) lap_times に tire_size 列を追加
alter table public.lap_times
  add column if not exists tire_size text;

-- 2) サーキットを追加 (ショート/ミニサーキット含む)
insert into public.circuits (slug, name, prefecture, length_m, sectors) values
  ('sodegaura',          '袖ケ浦フォレストレースウェイ',      '千葉県', 2436, 3),
  ('tokachi',            '十勝スピードウェイ',                  '北海道', 5091, 3),
  ('suzuka-twin',        '鈴鹿ツインサーキット',                '三重県', 1138, 3),
  ('mihama',             '美浜サーキット',                       '愛知県',  826, 3),
  ('kouta',              '幸田サーキット',                       '愛知県', 1545, 3),
  ('mobara-west',        '茂原ツインサーキット 西コース',        '千葉県', 1750, 3),
  ('mobara-east',        '茂原ツインサーキット 東コース',        '千葉県', 1700, 3),
  ('spa-nishiura',       'スパ西浦モーターパーク',               '愛知県', 1591, 3),
  ('tsukude',            '作手モビリティパーク',                  '愛知県',  830, 3),
  ('nakayama',           '中山サーキット',                       '岡山県', 1595, 3),
  ('fuji-short',         '富士スピードウェイ ショートコース',     '静岡県', 1500, 3)
on conflict (slug) do nothing;

-- 3) 不要になったサーキットを削除 (関連する lap_times がない場合のみ)
delete from public.circuits
  where slug in (
    'hsr-kyushu','mine','meihan','nasu-msl','festika-tochigi','festika-mizunami'
  )
  and not exists (
    select 1 from public.lap_times l where l.circuit_id = circuits.id
  );
