# 走ログ 収益化システム — 段階的公開ガイド

このドキュメントは、構築済みの収益化基盤を **どの順番で・どう ON にするか** をまとめたものです。すべての機能はデフォルト OFF。トラフィックや反応を見ながら順次有効化していきます。

---

## アーキテクチャ概要

| レイヤー | 役割 | 場所 |
|---|---|---|
| **DB スキーマ** | プラン・サブスク・フラグ・広告・アフィリエイトの永続化 | `supabase/migrations/004_monetization.sql` |
| **plans.ts** | プラン定数 + 機能キー一覧 + ヘルパー (`hasFeature`, `isAtLeast`) | `src/lib/plans.ts` |
| **feature-flags.ts** | フラグ取得 (キャッシュ付き) | `src/lib/feature-flags.ts` |
| **limits.ts** | プラン上限チェック (`canAddCar`, `canPostLap`, …) | `src/lib/limits.ts` |
| **UI コンポーネント** | `<AdSlot>` `<PremiumLock>` `<PremiumBadge>` `<AffiliateLinks>` | `src/components/` |
| **/billing** | プラン比較・Stripe Checkout 起動 | `src/app/billing/` |
| **/admin/features** | 運営者用スイッチ盤 | `src/app/admin/features/` |
| **Webhook** | Stripe からの subscription 状態同期 (スタブ) | `src/app/api/billing/webhook/` |

---

## 初期セットアップ (1回のみ)

### 1. マイグレーション実行
Supabase の SQL Editor で `migrations/004_monetization.sql` を実行。

### 2. 自分を運営者にする
```sql
update public.profiles set is_admin = true where username = 'あなたのユーザー名';
```
これで `/admin/features` にアクセスできるようになります。

### 3. 環境変数 (Stripe — 課金開始時)
`.env.local`:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```
Stripe Dashboard 側で:
- 商品 (Premium / Pro) と価格 (月/年) を作成
- Webhook エンドポイント `https://hashirolog.example/api/billing/webhook` を登録
- イベント: `checkout.session.completed` `customer.subscription.updated` `customer.subscription.deleted` `invoice.payment_failed`

---

## 段階的公開フロー

`/admin/features` でフラグを切り替えるだけで段階展開できます。

### Phase 1: お試し運用 (今ここ)
```
すべてのフラグ: OFF
```
- ユーザーは Free プランのみ利用
- 上限は表示のみ、実際にはブロックしない (`limits_enforced=false`)
- 広告・アフィリエイト・マーケットなし

### Phase 2: 上限導入 (DAU 〜500)
```
limits_enforced: ON
premium_features_visible: ON
```
- Free 上限 (3台 / 月10ラップ / 1写真) を実際に強制
- 有料機能を UI に表示するが、課金不可なのでロック表示のみ

### Phase 3: 広告 ON (DAU 500〜2000)
```
ads_enabled: ON
+ /admin/features で各 ad_slot に AdSense タグを貼って enabled
affiliate_enabled: ON
+ affiliate_links テーブルにリンク登録 (タイヤ EC など)
```

### Phase 4: 有料プラン公開 (DAU 2000〜)
```
billing_enabled: ON
```
- Stripe 設定済みであれば `/billing` から購入可能に
- Webhook で `subscriptions` が自動更新

### Phase 5: B2B 提携 (DAU 5000〜)
```
circuit_partner_enabled: ON
```
- サーキット側に有料プラン (Bronze/Silver/Gold) 案内
- `circuits.partner_tier` を SQL で設定すれば各種拡張枠が解放

### Phase 6: マーケットプレイス (DAU 10000〜)
```
marketplace_enabled: ON
```
- 中古パーツ売買機能を公開
- 出品/購入 UI を追加実装する必要あり (現在はスキーマのみ)

---

## 実装パターン

### ページに広告を埋め込む
```tsx
import { AdSlot } from "@/components/AdSlot";

<AdSlot slotKey="ranking_top" />
```
`ads_enabled` が OFF なら何も描画されず、有料ユーザーには `no_ads` 機能で非表示。

### 有料機能をロック表示する
```tsx
import { PremiumLock } from "@/components/PremiumLock";

<PremiumLock feature="detailed_analytics">
  <AnalyticsChart />
</PremiumLock>
```
- `premium_features_visible=false` → 完全非表示
- `=true` でユーザーが対象プラン未満 → ロック表示 + アップグレード CTA
- ユーザーが対象プラン以上 → 通常表示

### サーバー側で上限チェック
```ts
import { canAddCar } from "@/lib/limits";

const check = await canAddCar(user.id);
if (!check.allowed) throw new Error(check.reason!);
```
`limits_enforced=false` の間は常に許可されます。

### プラン表示バッジ
```tsx
<PremiumBadge tier={user.tier} />
```
`tier === "free"` のときは何も描画しない。

### アフィリエイトリンク
```tsx
import { AffiliateLinks } from "@/components/AffiliateLinks";

// タイヤ詳細で
<AffiliateLinks resourceType="tire" resourceId={tireId} />
```
`affiliate_enabled` が ON かつ DB にリンク登録があれば描画。

---

## DB レコード追加例

### 広告 HTML を登録
```sql
update public.ad_slots
  set enabled = true,
      html = '<script>...AdSense タグ...</script>'
  where slot_key = 'ranking_top';
```

### アフィリエイトリンク追加 (タイヤ別)
```sql
insert into public.affiliate_links
  (resource_type, resource_id, network, label, url)
values
  ('tire',
   (select id from tires where brand='YOKOHAMA' and model='ADVAN A052'),
   'fuji_corp',
   'フジ・コーポレーションで購入',
   'https://www.fujicorporation.com/?aff=hashirolog');
```

### 手動でユーザーをアップグレード (補償・キャンペーン)
```sql
update public.subscriptions
  set tier = 'premium', status = 'active', notes = 'campaign 2026-05'
  where user_id = (select id from profiles where username = 'hashiro_taro');
```

---

## トラブルシューティング

### フラグを切り替えたのに反映されない
- 30秒のキャッシュが効いています
- `clearFlagCache()` を呼ぶか、サーバーを再起動

### `/billing` で「準備中」と出る
- `STRIPE_SECRET_KEY` 未設定、または `billing_enabled` が OFF
- 両方そろって初めて Checkout が起動します

### Webhook が動かない
- `STRIPE_WEBHOOK_SECRET` が一致しているか確認
- 設定なしの場合は webhook は 200 OK を返すだけで何も処理しない (安全側)

---

## ファイル構成

```
supabase/migrations/004_monetization.sql   ← スキーマ + RLS

src/lib/
├── plans.ts                  ← プラン定数 + 機能キー
├── feature-flags.ts          ← フラグ取得 (キャッシュ)
└── limits.ts                 ← 上限チェック

src/components/
├── AdSlot.tsx                ← 広告枠 (Server Component)
├── AffiliateLinks.tsx        ← アフィリエイト枠
├── PremiumBadge.tsx          ← プランバッジ
└── PremiumLock.tsx           ← 有料機能ロック

src/app/
├── billing/page.tsx          ← プラン比較・Checkout
├── admin/features/page.tsx   ← 運営者スイッチ盤
├── api/billing/webhook/      ← Stripe webhook (スタブ)
└── actions/
    ├── billing.ts            ← Checkout / Portal
    └── admin.ts              ← フラグ・広告編集
```
