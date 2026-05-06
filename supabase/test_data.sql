-- 走ログ テストデータ生成 SQL
-- 実行前に: 自分のユーザーで signup 済みであること
--
-- 使い方:
-- 1. 自分のユーザー名を取得 (例: hashiro_taro)
-- 2. 下記の `:my_username` を自分のユーザー名に置換
-- 3. Supabase SQL Editor で実行
--
-- 注意: 既存データに影響しないよう、テスト用のサーキット ID を自動取得します。

-- ============================================================
-- 1. 仮想テストユーザーを auth.users に直接 insert することはできないため、
--    自分のアカウントの愛車・ラップを大量に作る形のサンプルです。
--    複数ユーザーでテストしたい場合は、ブラウザのシークレットモード等で複数アカウント作成 → 各アカウントで投稿してください。
-- ============================================================

-- 自分のプロフィール ID を取得 (username を自分のユーザー名に書き換え)
do $$
declare
  my_id uuid;
  fuji_id uuid;
  suzuka_id uuid;
  motegi_id uuid;
  tsukuba2k_id uuid;
  central_id uuid;
  car1_id uuid;
  car2_id uuid;
  yokohama_a052 uuid;
  yokohama_ad09 uuid;
  bridgestone_re71rs uuid;
  dunlop_ziii uuid;
begin
  -- ユーザー特定 (ここを自分のユーザー名に置換)
  select id into my_id from public.profiles where username = 'YOUR_USERNAME';
  if my_id is null then
    raise notice 'ユーザーが見つかりません。username を自分の値に置換してください。';
    return;
  end if;

  -- サーキット ID 取得
  select id into fuji_id from public.circuits where slug = 'fuji';
  select id into suzuka_id from public.circuits where slug = 'suzuka';
  select id into motegi_id from public.circuits where slug = 'motegi';
  select id into tsukuba2k_id from public.circuits where slug = 'tsukuba-2000';
  select id into central_id from public.circuits where slug = 'central';

  -- タイヤ ID 取得
  select id into yokohama_a052 from public.tires where brand = 'YOKOHAMA' and model = 'ADVAN A052';
  select id into yokohama_ad09 from public.tires where brand = 'YOKOHAMA' and model = 'ADVAN NEOVA AD09';
  select id into bridgestone_re71rs from public.tires where brand = 'BRIDGESTONE' and model = 'POTENZA RE-71RS';
  select id into dunlop_ziii from public.tires where brand = 'DUNLOP' and model = 'DIREZZA ZIII';

  -- 既存の愛車があれば再利用、なければ新規作成
  select id into car1_id from public.cars where user_id = my_id and name = 'テスト用 GR86' limit 1;
  if car1_id is null then
    insert into public.cars
      (user_id, name, maker, model, year, color, power_ps, weight_kg, description,
       mods_suspension, mods_engine, mods_drivetrain, mods_brake, mods_exterior, mods_interior)
    values
      (my_id, 'テスト用 GR86', 'TOYOTA', 'GR86 (ZN8)', 2022, 'サファイアブルー', 235, 1270,
       '富士をホームに月一アタック中。',
       'TEIN MONO RACING / ピロアッパー前後 / スタビ前後強化',
       'HKS スーパーターボマフラー / EcuTek リフラッシュ',
       'クスコ機械式LSD 1.5way / ORC 強化クラッチ',
       'ENDLESS MX72 / DIXCEL FCR / RBF600',
       'VOLTEX GT-WING Type-5 / フロントカナード',
       'BRIDE ZETA III + 4点ハーネス')
    returning id into car1_id;
  end if;

  select id into car2_id from public.cars where user_id = my_id and name = 'テスト用シビック' limit 1;
  if car2_id is null then
    insert into public.cars
      (user_id, name, maker, model, year, color, power_ps, weight_kg, description,
       mods_suspension, mods_engine, mods_brake, mods_exterior)
    values
      (my_id, 'テスト用シビック', 'HONDA', 'シビック FK8', 2019, 'チャンピオンシップホワイト', 320, 1390,
       'タイプRオーナー。',
       'OHLINS DFV / アライメント',
       'スポーツキャタライザー / 純正流用ECU',
       '純正Brembo / DIXCEL ESローター',
       'Mugen エアロ / Vortex GT-WING')
    returning id into car2_id;
  end if;

  -- ラップタイム投入 (重複しないようdriven_atをずらす)
  insert into public.lap_times
    (user_id, car_id, circuit_id, tire_id, tire_size_front, tire_size_rear,
     total_ms, sector1_ms, sector2_ms, sector3_ms, top_speed_kmh,
     weather, track_condition, air_temp_c, track_temp_c, driven_at, note)
  values
    (my_id, car1_id, fuji_id, yokohama_ad09, '245/40R18', '245/40R18',
      111234, 36512, 42103, 32619, 218, 'sunny', 'dry', 18.0, 27.0, '2026-04-28', '3アタック目、コカ・コーラからの立ち上がりが決まった。'),
    (my_id, car1_id, fuji_id, yokohama_ad09, '245/40R18', '245/40R18',
      113500, 37100, 42500, 33900, 215, 'sunny', 'dry', 22.0, 35.0, '2026-04-15', '気温高めでタイヤ熱ダレ気味。'),
    (my_id, car1_id, tsukuba2k_id, yokohama_ad09, '245/40R18', '245/40R18',
       64932, 19500, 22300, 23132, 182, 'sunny', 'dry', 16.0, 25.0, '2026-04-13', '筑波コース2000、ベスト更新!'),
    (my_id, car1_id, motegi_id, yokohama_ad09, '245/40R18', '245/40R18',
      122100, 38500, 41000, 42600, 212, 'cloudy', 'dry', 14.0, 18.0, '2026-04-02', 'ストップ&ゴー難しい。'),
    (my_id, car2_id, fuji_id, bridgestone_re71rs, '245/35R20', '245/35R20',
      113044, 36800, 41900, 34344, 224, 'sunny', 'dry', 20.0, 30.0, '2026-02-08', 'シビックでベスト更新。'),
    (my_id, car2_id, central_id, bridgestone_re71rs, '245/35R20', '245/35R20',
       85420, 28200, 28100, 29120, 195, 'sunny', 'dry', 18.0, 28.0, '2026-03-25', 'セントラル初走行。'),
    (my_id, car2_id, suzuka_id, dunlop_ziii, '245/35R20', '245/35R20',
      148451, 47200, 51300, 49951, 256, 'cloudy', 'dry', 15.0, 22.0, '2026-04-26', '鈴鹿フルコース、初の2:30切り目前。')
  on conflict do nothing;

  raise notice 'テストデータを投入しました: car1=%, car2=%', car1_id, car2_id;
end $$;

-- 確認用クエリ
select c.name as 愛車, ci.name as サーキット,
       to_char(make_interval(secs => l.total_ms / 1000.0), 'MI:SS.MS') as タイム,
       l.driven_at as 走行日
from public.lap_times l
join public.cars c on c.id = l.car_id
join public.circuits ci on ci.id = l.circuit_id
where l.user_id = (select id from public.profiles where username = 'YOUR_USERNAME')
order by l.driven_at desc;
