# 走ログ メールテンプレート (日本語版)

Supabase が送信する各種認証メールを日本語化するための定型文集です。

## セットアップ場所

Supabase Dashboard → 対象プロジェクト → 左メニュー **Authentication** → **Emails** → **Email Templates**

各テンプレートで **Subject** と **Message body** をそれぞれ書き換えて **Save** してください。

## 共通の Supabase テンプレート変数

| 変数 | 内容 |
|---|---|
| `{{ .ConfirmationURL }}` | 認証アクション用 URL (各メールごとに異なる) |
| `{{ .Token }}` | 6桁の認証コード |
| `{{ .TokenHash }}` | URL に埋める認証ハッシュ |
| `{{ .SiteURL }}` | Supabase Auth に登録した Site URL |
| `{{ .Email }}` | 受信者のメールアドレス |
| `{{ .RedirectTo }}` | リダイレクト先 URL |

---

## 1. パスワード再設定 (Reset Password)

### Subject
```
【走ログ】パスワード再設定のご案内
```

### Message body (HTML)
```html
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic UI',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.7;">
  <h2 style="color:#18181b;margin:0 0 16px;font-size:20px;">パスワード再設定のご案内</h2>
  <p style="margin:0 0 12px;">走ログをご利用いただきありがとうございます。</p>
  <p style="margin:0 0 20px;">パスワード再設定のリクエストを受け付けました。下記のボタンから新しいパスワードを設定してください。</p>
  <p style="margin:24px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 28px;background-color:#e10600;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">
      パスワードを再設定する
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#52525b;">ボタンが押せない場合は、下記のURLをブラウザに貼り付けてください:</p>
  <p style="margin:0 0 20px;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#52525b;">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 12px;font-size:13px;color:#71717a;">このリンクの有効期限は <strong>1時間</strong> です。</p>
  <p style="margin:0 0 24px;font-size:13px;color:#71717a;">パスワード再設定をご依頼いただいていない場合、このメールは破棄してください。アカウントの安全に影響はありません。</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
  <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
    走ログ (Hashilog)<br>
    https://hashilog.jp<br>
    お問い合わせ: hashilog2024@gmail.com<br>
    運営事業者: RBS / 運営責任者: 久米田 昴
  </p>
</div>
```

---

## 2. 新規登録の確認 (Confirm Signup)

### Subject
```
【走ログ】メールアドレス確認のお願い
```

### Message body (HTML)
```html
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic UI',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.7;">
  <h2 style="color:#18181b;margin:0 0 16px;font-size:20px;">走ログへのご登録ありがとうございます</h2>
  <p style="margin:0 0 12px;">下記のボタンを押してメールアドレスの確認を完了してください。</p>
  <p style="margin:0 0 20px;">確認が完了すると、タイム投稿・愛車登録・SNS シェアなどすべての機能をご利用いただけます。</p>
  <p style="margin:24px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 28px;background-color:#e10600;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">
      メールアドレスを確認する
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#52525b;">ボタンが押せない場合は、下記のURLをブラウザに貼り付けてください:</p>
  <p style="margin:0 0 20px;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#52525b;">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 12px;font-size:13px;color:#71717a;">このリンクの有効期限は <strong>24時間</strong> です。</p>
  <p style="margin:0 0 24px;font-size:13px;color:#71717a;">心当たりがない場合は、このメールを無視してください。</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
  <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
    走ログ (Hashilog)<br>
    https://hashilog.jp<br>
    お問い合わせ: hashilog2024@gmail.com<br>
    運営事業者: RBS / 運営責任者: 久米田 昴
  </p>
</div>
```

---

## 3. メールアドレス変更 (Change Email Address)

### Subject
```
【走ログ】メールアドレス変更のご確認
```

### Message body (HTML)
```html
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic UI',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.7;">
  <h2 style="color:#18181b;margin:0 0 16px;font-size:20px;">メールアドレス変更のご確認</h2>
  <p style="margin:0 0 12px;">アカウントのメールアドレス変更リクエストを受け付けました。</p>
  <p style="margin:0 0 20px;">下記のボタンを押して、新しいメールアドレスでの利用を確定してください。</p>
  <p style="margin:24px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 28px;background-color:#e10600;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">
      新しいメールアドレスを確認する
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#52525b;">ボタンが押せない場合は、下記のURLをブラウザに貼り付けてください:</p>
  <p style="margin:0 0 20px;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#52525b;">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 12px;font-size:13px;color:#71717a;">このリンクの有効期限は <strong>24時間</strong> です。</p>
  <p style="margin:0 0 24px;font-size:13px;color:#71717a;">変更にお心当たりがない場合は、このメールを無視するか、運営までご連絡ください。</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
  <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
    走ログ (Hashilog)<br>
    https://hashilog.jp<br>
    お問い合わせ: hashilog2024@gmail.com<br>
    運営事業者: RBS / 運営責任者: 久米田 昴
  </p>
</div>
```

---

## 4. マジックリンク (Magic Link)

### Subject
```
【走ログ】ログインリンクのご案内
```

### Message body (HTML)
```html
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic UI',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.7;">
  <h2 style="color:#18181b;margin:0 0 16px;font-size:20px;">ログインリンクのご案内</h2>
  <p style="margin:0 0 20px;">下記のボタンを押すと、走ログにログインできます。</p>
  <p style="margin:24px 0;">
    <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 28px;background-color:#e10600;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;">
      ログインする
    </a>
  </p>
  <p style="margin:0 0 8px;font-size:13px;color:#52525b;">ボタンが押せない場合は、下記のURLをブラウザに貼り付けてください:</p>
  <p style="margin:0 0 20px;font-size:12px;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#52525b;">{{ .ConfirmationURL }}</a></p>
  <p style="margin:0 0 12px;font-size:13px;color:#71717a;">このリンクの有効期限は <strong>1時間</strong> です。一度のみ使用可能です。</p>
  <p style="margin:0 0 24px;font-size:13px;color:#71717a;">ログインを依頼していない場合は、このメールを無視してください。</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
  <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
    走ログ (Hashilog)<br>
    https://hashilog.jp<br>
    お問い合わせ: hashilog2024@gmail.com<br>
    運営事業者: RBS / 運営責任者: 久米田 昴
  </p>
</div>
```

---

## 5. 再認証 (Reauthentication)

### Subject
```
【走ログ】本人確認コードのお知らせ
```

### Message body (HTML)
```html
<div style="font-family:'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic UI',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.7;">
  <h2 style="color:#18181b;margin:0 0 16px;font-size:20px;">本人確認コードのお知らせ</h2>
  <p style="margin:0 0 12px;">走ログで重要な操作を行うため、本人確認コードを発行いたしました。</p>
  <p style="margin:0 0 20px;">下記のコードを画面に入力してください。</p>
  <div style="margin:24px 0;padding:18px;background-color:#fafafa;border:1px solid #e4e4e7;border-radius:8px;text-align:center;">
    <p style="margin:0;font-family:'SFMono-Regular',Menlo,monospace;font-size:28px;font-weight:bold;letter-spacing:6px;color:#e10600;">{{ .Token }}</p>
  </div>
  <p style="margin:0 0 12px;font-size:13px;color:#71717a;">このコードの有効期限は <strong>5分</strong> です。</p>
  <p style="margin:0 0 24px;font-size:13px;color:#71717a;">本人による操作でない場合は、このメールを無視してください。コードは絶対に他人に教えないでください。</p>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">
  <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
    走ログ (Hashilog)<br>
    https://hashilog.jp<br>
    お問い合わせ: hashilog2024@gmail.com<br>
    運営事業者: RBS / 運営責任者: 久米田 昴
  </p>
</div>
```

---

## 設定後の確認方法

### パスワード再設定の挙動テスト
1. シークレットウィンドウで `https://hashilog.jp/forgot-password`
2. テスト用メールアドレスを入力 → 送信
3. 受信したメールが日本語版になっていることを確認
4. 「パスワードを再設定する」ボタンをクリック
5. `https://hashilog.jp/reset-password` に遷移して新パスワードを設定
6. 新しいパスワードでログインできること

### 想定される失敗ポイント
- メールが届かない → Supabase Custom SMTP (Resend) の設定を確認
- リンクが localhost に飛ぶ → Supabase Site URL が `https://hashilog.jp` になっているか確認
- HTML が崩れる → メールクライアント（Gmail / Outlook）でも見え方を試す

## メンテナンスのコツ

- **会社情報・連絡先はフッター部分にまとめてある**ので、変更時は5テンプレ全部の `<hr>` 以下を一括置換
- **本文の文体は丁寧 + 簡潔**を意識（過剰な敬語は避ける）
- **CTA ボタン色は走ログのアクセントカラー** `#e10600` で統一
- ロゴ画像を入れたい場合は、Resend にホスト済みの URL を `<img src="...">` で挿入（`/logo.png` を Vercel から配信、`https://hashilog.jp/logo.png` を直接参照）
