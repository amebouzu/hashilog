-- 走ログ migration 011
-- タイヤブランドにシバタイヤ (SHIBATIRE) の代表銘柄を追加。
-- ユーザーがフォームから「その他」で同名を入力しても brand+model unique で
-- 重複は防がれるが、最初からドロップダウンに出るよう seed しておく。

insert into public.tires (brand, model, is_verified) values
  ('SHIBATIRE', 'TW280',  true),
  ('SHIBATIRE', 'TW200',  true),
  ('SHIBATIRE', 'R23',    true),
  ('SHIBATIRE', 'R29',    true),
  ('SHIBATIRE', 'TR-1',   true),
  ('SHIBATIRE', 'TR-2',   true)
on conflict (brand, model) do nothing;
