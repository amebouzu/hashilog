-- 走ログ migration 006
-- タイヤのカテゴリ分け (street/sports/semi_slick/slick/rain) を撤廃
-- ユーザーが手動入力する際の負担を減らすため、銘柄=タイヤとして扱う

-- check 制約を外す
alter table public.tires
  drop constraint if exists tires_category_check;

-- nullable にする (既存データは保持)
alter table public.tires
  alter column category drop not null;

-- 完全削除する場合 (任意。既存データを保持したい場合は実行しない):
--   alter table public.tires drop column category;
