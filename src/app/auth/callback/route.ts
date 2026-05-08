import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth のコールバック。
 * 確認メール / パスワード再設定 / マジックリンクのいずれも受け取り、
 * 形式に応じてセッションを確立した上で適切なページへリダイレクトする。
 *
 * 対応する URL パターン:
 *  ① PKCE 経由:    /auth/callback?code=xxx[&next=/foo]
 *  ② OTP リンク経由: /auth/callback?token_hash=xxx&type=signup|recovery|email_change|magiclink|invite
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // type ごとのデフォルト遷移先 (next が無い時)
  const defaultNextByType: Record<string, string> = {
    recovery: "/reset-password",
    email_change: "/settings/account",
    invite: "/",
    signup: "/",
    email: "/",
    magiclink: "/"
  };
  const next =
    searchParams.get("next") ??
    (type ? defaultNextByType[type] ?? "/" : "/");

  const supabase = createClient();

  // ① OTP リンク (token_hash & type)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.warn("verifyOtp failed:", error.message);
  }

  // ② PKCE フロー (code)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.warn("exchangeCodeForSession failed:", error.message);
  }

  // どちらのフォーマットにも合致しなかったか、検証に失敗
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
