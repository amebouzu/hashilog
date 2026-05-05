# 走ログ 観測ツール導入ガイド

本番運用前に導入しておきたいツールをまとめています。すべて無料枠で開始可能です。

## 1. Sentry — エラートラッキング

### インストール
```bash
npm install @sentry/nextjs
```

### 自動セットアップ
```bash
npx @sentry/wizard@latest -i nextjs
```
ウィザードが対話的に以下のファイルを生成します:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` への withSentryConfig ラッパー

### 環境変数 (`.env.local`)
```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=hashirolog
```

### 設定のポイント
- `tracesSampleRate` は本番 `0.1` (10%)、開発 `1.0` を推奨
- `replaysSessionSampleRate` は `0.05` (5%) 程度
- `ignoreErrors` で `ResizeObserver loop limit exceeded` 等のノイズを除外

### Server Action でエラーをキャプチャする例
```ts
import * as Sentry from "@sentry/nextjs";

export async function someAction() {
  try {
    /* ... */
  } catch (e) {
    Sentry.captureException(e, { tags: { action: "someAction" } });
    throw e;
  }
}
```

---

## 2. PostHog — 分析・セッションリプレイ

### インストール
```bash
npm install posthog-js
```

### 環境変数
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 初期化 (Provider)
`src/components/PostHogProvider.tsx`:
```tsx
"use client";
import posthog from "posthog-js";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false   // App Router は手動で
    });
  }, []);
  return <>{children}</>;
}
```

`layout.tsx` の <body> 直下に配置。

### イベントトラッキング例
- `lap_posted` (タイム投稿時)
- `car_created` (愛車登録時)
- `signup_completed`
- `subscription_started`

### プライバシー
PostHog Cloud の EU データセンターを使うか、セルフホストを選ぶことで個人情報の越境を抑制できます。

---

## 3. UptimeRobot — 死活監視

無料プランで 50 モニターまで監視できます。

### 監視推奨URL
- `https://hashirolog.example/` (HTTP ステータス)
- `https://hashirolog.example/api/billing/webhook` (POST、キーワード "received")
- `https://hashirolog.example/sitemap.xml`

### 通知先
- メール
- Slack / Discord (Webhook)
- LINE Notify (廃止予定 → LINE Messaging API へ)

---

## 4. Cloudflare Web Analytics

Cookie 不要・GDPR 対応の軽量アクセス解析。

### 導入手順
1. Cloudflare Dashboard → Web Analytics → Add a site
2. 表示された JS スニペットを `app/layout.tsx` の `<body>` 末尾に追加
3. プロパティ: ページビュー、Core Web Vitals、リファラ

### スニペット例
```tsx
{process.env.NODE_ENV === "production" && (
  <script
    defer
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon='{"token": "YOUR_TOKEN"}'
  />
)}
```

---

## 5. Google Search Console

SEO の状況確認に必須:
- インデックス状況
- 検索クエリ
- Core Web Vitals
- セキュリティ問題

### 認証
1. Search Console でプロパティを追加
2. 認証方法として「HTML タグ」を選択
3. metadata に追加:
```ts
// app/layout.tsx の metadata 内
verification: { google: "xxxxxxxxxxxxxx" }
```

---

## 6. ヘルスチェック用エンドポイント

`src/app/api/health/route.ts`:
```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { error } = await supabase.from("circuits").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true, db: true });
}
```

UptimeRobot から `/api/health` をキーワード `"ok":true` で監視。

---

## 推奨導入順

| Phase | ツール | 目的 |
|---|---|---|
| ローンチ前 | Sentry + UptimeRobot | エラー検知 + 死活監視 |
| ベータ期 | Cloudflare Web Analytics + Search Console | アクセス把握 + SEO |
| 有料化前 | PostHog | コンバージョン分析 |
| スケール期 | Datadog / New Relic 等 | 詳細パフォーマンス |
