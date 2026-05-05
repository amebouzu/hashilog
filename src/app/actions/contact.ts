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

  // TODO: 受付通知メール送信 (Resend 等)
  // TODO: 運営者向けの Slack/Discord 通知

  redirect("/contact?status=success");
}
