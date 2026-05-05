"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PREFECTURES } from "@/lib/types";

function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s ? s : null;
}

function snsHandle(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  // remove leading @ and any URL prefixes
  return s.replace(/^@/, "").replace(/^https?:\/\/[^/]+\//, "").replace(/\/.*$/, "");
}

export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const prefecture = strOrNull(formData.get("prefecture"));
  if (prefecture && !PREFECTURES.includes(prefecture as any)) {
    throw new Error("無効な都道府県");
  }

  const payload = {
    display_name: strOrNull(formData.get("display_name")),
    bio: strOrNull(formData.get("bio")),
    prefecture,
    sns_x: snsHandle(formData.get("sns_x")),
    sns_instagram: snsHandle(formData.get("sns_instagram")),
    sns_threads: snsHandle(formData.get("sns_threads")),
    sns_youtube: snsHandle(formData.get("sns_youtube")),
    sns_facebook: snsHandle(formData.get("sns_facebook")),
    sns_tiktok: snsHandle(formData.get("sns_tiktok")),
    website_url: strOrNull(formData.get("website_url")),
    avatar_url: strOrNull(formData.get("avatar_url"))
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/cars");
  revalidatePath("/settings/profile");

  // username が無事取得できたらユーザーページもrevalidate
  const { data: prof } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (prof?.username) revalidatePath(`/u/${prof.username}`);

  redirect("/cars?profile=updated");
}
