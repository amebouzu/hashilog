"use server";

/**
 * アカウント削除 (退会) 処理
 *
 * 必要な環境変数:
 *   SUPABASE_SERVICE_ROLE_KEY  ... auth.admin.deleteUser を呼ぶため
 *
 * 削除フロー:
 * 1. ユーザー本人による確認 (ユーザー名再入力)
 * 2. profiles / cars / lap_times 等は cascade で自動削除
 * 3. account_deletions に監査ログを残す
 * 4. auth.users を削除 (service_role)
 * 5. ログアウト & トップページへリダイレクト
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function deleteAccountAction(formData: FormData) {
  const confirmation = (formData.get("confirmation") ?? "").toString().trim();
  const reason = (formData.get("reason") ?? "").toString().trim();

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login");
  }

  // 確認テキストとしてユーザー名を再入力させる
  if (confirmation !== profile.username) {
    redirect("/settings/account?status=mismatch");
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    console.error("SUPABASE_SERVICE_ROLE_KEY が未設定です");
    redirect("/settings/account?status=error");
  }

  // 監査ログ (削除前に記録)
  await supabase.from("account_deletions").insert({
    user_id: user.id,
    username: profile.username,
    email: user.email,
    reason: reason || null
  });

  // service_role で auth.users を削除 (profiles 等は cascade)
  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("auth.admin.deleteUser failed", error);
    redirect("/settings/account?status=error");
  }

  // セッション破棄
  await supabase.auth.signOut();

  redirect("/?status=account_deleted");
}
