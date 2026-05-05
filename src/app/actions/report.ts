"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SUBJECT_TYPES = [
  "lap_time",
  "car",
  "profile",
  "circuit_event",
  "tire",
  "comment"
] as const;
const REASONS = [
  "spam",
  "fake_time",
  "inappropriate",
  "impersonation",
  "copyright",
  "harassment",
  "other"
] as const;

export async function submitReportAction(formData: FormData) {
  const subject_type = (formData.get("subject_type") ?? "").toString();
  const subject_id = (formData.get("subject_id") ?? "").toString();
  const reason = (formData.get("reason") ?? "").toString();
  const detail = (formData.get("detail") ?? "").toString().trim();

  if (!SUBJECT_TYPES.includes(subject_type as any)) {
    throw new Error("invalid subject_type");
  }
  if (!REASONS.includes(reason as any)) {
    throw new Error("invalid reason");
  }
  if (!subject_id) throw new Error("subject_id required");

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const { error } = await supabase.from("reports").insert({
    subject_type,
    subject_id,
    reason,
    detail: detail || null,
    reporter_id: user.id
  });
  if (error) throw error;

  revalidatePath("/admin/reports");
}
