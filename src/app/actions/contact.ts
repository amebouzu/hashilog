"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES = [
  "general",
  "partnership",
  "sponsor",
  "bug",
  "feature",
  "account",
  "other"
] as const;

const CATEGORY_LABEL: Record<(typeof CATEGORIES)[number], string> = {
  general: "一般お問い合わせ",
  partnership: "サーキット運営者 (提携希望)",
  sponsor: "メーカー・スポンサー協業",
  bug: "不具合の報告",
  feature: "機能要望",
  account: "アカウントの問題",
  other: "その他"
};

/**
 * Resend API 経由でメール送信。
 * 失敗しても submitContactAction 全体は失敗扱いにしない (DB 保存は成功している前提)。
 */
async function sendEmail(opts: {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY not set; skipping email notification");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: opts.from,
        to: [opts.to],
        reply_to: opts.replyTo,
        subject: opts.subject,
        html: opts.html,
        text: opts.text
      })
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[contact] Resend send failed:", res.status, body);
    }
  } catch (e) {
    console.error("[contact] Resend send threw:", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitContactAction(formData: FormData) {
  const name = (formData.get("name") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const category = (formData.get("category") ?? "").toString();
  const subject = (formData.get("subject") ?? "").toString().trim();
  const message = (formData.get("message") ?? "").toString().trim();
  const agreed = formData.get("agreed") === "on";

  if (!name || !email || !category || !subject || !message) {
    redirect("/contact?status=missing");
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    redirect("/contact?status=invalid_category");
  }
  if (!agreed) {
    redirect("/contact?status=consent");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/contact?status=invalid_email");
  }
  if (message.length > 5000 || subject.length > 200 || name.length > 100) {
    redirect("/contact?status=too_long");
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contacts").insert({
    name,
    email,
    category,
    subject,
    message,
    user_id: user?.id ?? null
  });

  if (error) {
    console.error("contact insert failed", error);
    redirect("/contact?status=error");
  }

  // 通知メール (運営宛 + 送信者宛) を送信。失敗しても処理は継続。
  const ADMIN_TO = process.env.CONTACT_NOTIFY_TO ?? "hashilog2024@gmail.com";
  const FROM = process.env.CONTACT_FROM ?? "走ログ <noreply@hashilog.jp>";
  const categoryLabel =
    CATEGORY_LABEL[category as (typeof CATEGORIES)[number]] ?? category;

  // 運営宛通知
  await sendEmail({
    to: ADMIN_TO,
    from: FROM,
    replyTo: email,
    subject: `[走ログ お問い合わせ] ${categoryLabel} / ${subject}`,
    text:
      `走ログにお問い合わせが届きました。\n\n` +
      `カテゴリ : ${categoryLabel}\n` +
      `お名前   : ${name}\n` +
      `メール   : ${email}\n` +
      `件名     : ${subject}\n` +
      `ユーザーID: ${user?.id ?? "(未ログイン)"}\n` +
      `\n--- 本文 ---\n${message}\n`,
    html:
      `<div style="font-family:'Hiragino Kaku Gothic ProN','Yu Gothic UI',Meiryo,sans-serif;color:#18181b;line-height:1.7;">` +
      `<h2 style="margin:0 0 12px;font-size:18px;color:#e10600;">走ログ お問い合わせ通知</h2>` +
      `<table style="border-collapse:collapse;font-size:14px;">` +
      `<tr><td style="padding:4px 12px 4px 0;color:#71717a;">カテゴリ</td><td>${escapeHtml(categoryLabel)}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#71717a;">お名前</td><td>${escapeHtml(name)}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#71717a;">メール</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#71717a;">件名</td><td>${escapeHtml(subject)}</td></tr>` +
      `<tr><td style="padding:4px 12px 4px 0;color:#71717a;">ユーザーID</td><td>${escapeHtml(user?.id ?? "(未ログイン)")}</td></tr>` +
      `</table>` +
      `<hr style="border:none;border-top:1px solid #e4e4e7;margin:14px 0;">` +
      `<pre style="white-space:pre-wrap;font-family:inherit;font-size:14px;margin:0;">${escapeHtml(message)}</pre>` +
      `<p style="margin-top:18px;font-size:12px;color:#71717a;">このメールには直接返信できます (Reply-To: ${escapeHtml(email)} に設定されています)。</p>` +
      `</div>`
  });

  // 送信者宛 自動返信
  await sendEmail({
    to: email,
    from: FROM,
    subject: `【走ログ】お問い合わせを受け付けました`,
    text:
      `${name} 様\n\n` +
      `走ログへのお問い合わせありがとうございます。下記の内容で受付いたしました。\n\n` +
      `内容を確認のうえ、担当より追ってご連絡いたします。\n` +
      `(回答までお時間をいただく場合がございます)\n\n` +
      `------ 受付内容 ------\n` +
      `カテゴリ: ${categoryLabel}\n` +
      `件名    : ${subject}\n\n` +
      `本文:\n${message}\n` +
      `----------------------\n\n` +
      `走ログ (Hashilog)\n` +
      `https://hashilog.jp\n` +
      `RBS / 久米田 昴\n` +
      `hashilog2024@gmail.com\n`,
    html:
      `<div style="font-family:'Hiragino Kaku Gothic ProN','Yu Gothic UI',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.7;">` +
      `<h2 style="margin:0 0 12px;font-size:20px;">お問い合わせを受け付けました</h2>` +
      `<p style="margin:0 0 12px;">${escapeHtml(name)} 様</p>` +
      `<p style="margin:0 0 16px;">走ログへのお問い合わせありがとうございます。下記の内容で受付いたしました。担当より追ってご連絡いたします (回答までお時間をいただく場合がございます)。</p>` +
      `<div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;padding:14px 18px;margin:16px 0;">` +
      `<p style="margin:0 0 6px;font-size:13px;color:#71717a;">カテゴリ</p><p style="margin:0 0 12px;font-weight:bold;">${escapeHtml(categoryLabel)}</p>` +
      `<p style="margin:0 0 6px;font-size:13px;color:#71717a;">件名</p><p style="margin:0 0 12px;font-weight:bold;">${escapeHtml(subject)}</p>` +
      `<p style="margin:0 0 6px;font-size:13px;color:#71717a;">本文</p><pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${escapeHtml(message)}</pre>` +
      `</div>` +
      `<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;">` +
      `<p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">` +
      `走ログ (Hashilog)<br>https://hashilog.jp<br>運営事業者: RBS / 運営責任者: 久米田 昴<br>お問い合わせ: hashilog2024@gmail.com` +
      `</p>` +
      `</div>`
  });

  redirect("/contact?status=success");
}
