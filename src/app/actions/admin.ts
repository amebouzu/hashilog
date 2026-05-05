"use server";

/**
 * 運営者向けの操作 Server Actions
 * - profiles.is_admin が true のユーザーのみ実行可能
 * - feature_flags / ad_slots / plan_limits の更新
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clearFlagCache, type FlagKey } from "@/lib/feature-flags";

async function ensureAdmin() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    throw new Error("運営権限がありません");
  }
  return { supabase, userId: user.id };
}

export async function toggleFeatureFlag(formData: FormData) {
  const { supabase } = await ensureAdmin();
  const key = (formData.get("key") ?? "").toString() as FlagKey;
  const enabled = formData.get("enabled") === "on";
  const { error } = await supabase
    .from("feature_flags")
    .update({ enabled })
    .eq("key", key);
  if (error) throw error;
  clearFlagCache();
  revalidatePath("/admin/features");
  revalidatePath("/", "layout");
}

export async function updateContactStatus(formData: FormData) {
  const { supabase, userId } = await ensureAdmin();
  const id = (formData.get("id") ?? "").toString();
  const status = (formData.get("status") ?? "").toString();
  const notes = (formData.get("notes") ?? "").toString();
  if (!["new", "in_progress", "resolved", "spam"].includes(status)) {
    throw new Error("invalid status");
  }
  const patch: any = { status };
  if (notes) patch.internal_notes = notes;
  if (status === "resolved") {
    patch.resolved_at = new Date().toISOString();
    patch.resolved_by = userId;
  }
  const { error } = await supabase.from("contacts").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/contacts");
}

export async function updateReportStatus(formData: FormData) {
  const { supabase, userId } = await ensureAdmin();
  const id = (formData.get("id") ?? "").toString();
  const status = (formData.get("status") ?? "").toString();
  const notes = (formData.get("notes") ?? "").toString();
  if (!["open", "in_review", "resolved", "dismissed"].includes(status)) {
    throw new Error("invalid status");
  }
  const patch: any = { status };
  if (notes) patch.internal_notes = notes;
  if (status === "resolved" || status === "dismissed") {
    patch.resolved_at = new Date().toISOString();
    patch.resolved_by = userId;
  }
  const { error } = await supabase.from("reports").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/reports");
}

export async function toggleAdSlot(formData: FormData) {
  const { supabase } = await ensureAdmin();
  const slotKey = (formData.get("slot_key") ?? "").toString();
  const enabled = formData.get("enabled") === "on";
  const html = (formData.get("html") ?? "").toString();
  const { error } = await supabase
    .from("ad_slots")
    .update({ enabled, html: html || null })
    .eq("slot_key", slotKey);
  if (error) throw error;
  revalidatePath("/admin/features");
}
