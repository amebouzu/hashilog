# 走ログ (Hashirolog)

サーキット走行タイムを愛車情報と一緒に共有するウェブサービス。

- 認証 (メール/パスワード)
- 愛車登録: 足回り / エンジン / 駆動系 / ブレーキ / 外装 / 内装
- 日本の主要サーキット (富士・鈴鹿・もてぎ・岡山・SUGO・筑波 など)
- タイム投稿: 総合タイム + セクター + 最高速 + 天候 + 路面 + タイヤ + 写真
- ランキング: サーキット / タイヤ / メーカー / 車種でフィルタ
- ユーザーページ・OGP対応の個別ラップページ・SNSシェアボタン

## 技術スタック

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + Postgres + Storage)

## セットアップ

### 1. 依存関係のインストール

```bash
cd hashirolog
npm install
```

> ⚠️ このディレクトリは OneDrive 配下にあるため、`node_modules` の同期で問題が出たらプロジェクトを `C:\Users\amebo\projects\hashirolog` のような OneDrive 外に移動してください。

### 2. Supabase プロジェクトを作成

1. https://supabase.com にログインして新規プロジェクトを作成
2. プロジェクトの **Settings → API** から
   - `Project URL` (例: `https://xxxx.supabase.co`)
   - `anon public` キー
   をコピー
3. プロジェクトルートに `.env.local` を作成:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. データベーススキーマと初期データを投入

Supabase ダッシュボードの **SQL Editor** で順に実行:

1. `supabase/schema.sql` の内容を貼り付けて Run
2. `supabase/seed.sql` の内容を貼り付けて Run

これで以下が作成されます:

- テーブル: `profiles` `cars` `circuits` `tires` `lap_times` `lap_photos`
- ストレージバケット: `lap-photos` (公開), `car-covers` (公開)
- RLS ポリシー (読み取りは全員、書き込みは所有者のみ)
- `auth.users` 作成時に自動で `profiles` 行を作るトリガー
- 主要日本サーキット16箇所と代表的なタイヤ19種

### 4. Auth 設定 (Supabase ダッシュボード)

**Authentication → URL Configuration** で以下を設定:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### 5. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 を開く。

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx               # トップ (最新投稿 / 総合トップ5)
│   ├── login, signup          # 認証ページ
│   ├── auth/callback          # OAuth/メール確認コールバック
│   ├── cars/                  # 愛車一覧 / 新規登録 / 詳細
│   ├── circuits/              # サーキット一覧 / 詳細(各サーキットのランキング)
│   ├── laps/                  # タイム投稿 / 詳細(OGP対応)
│   ├── ranking/               # フィルタ可能なランキング
│   ├── u/[username]/          # ユーザーページ
│   └── actions/               # Server Actions (auth, cars)
├── components/
│   ├── Navbar.tsx
│   ├── CarForm.tsx
│   ├── LapForm.tsx
│   └── ShareLink.tsx
├── lib/
│   ├── supabase/              # client / server / middleware
│   └── types.ts               # ドメイン型 + lap時間ヘルパー
└── middleware.ts              # Supabase セッション更新
```

## 今後の拡張アイデア (MVP外)

- フォロー機能 / コメント / いいね
- 動画 (YouTube/X) リンク埋め込み
- AIによる写真からのタイムOCR (タイミングモニター撮影)
- セクターベスト / 理論ベストの算出
- 月次・年次ベストの集計
- マイカーのカバー画像アップロード (`car-covers` バケットは既に用意済み)
- 走行会・イベント単位での集計

## 開発コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run start      # 本番起動
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```
