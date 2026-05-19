"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function intOrNull(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  return s ? s : null;
}

export async function createCarAction(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const payload = {
    user_id: user.id,
    name: (formData.get("name") ?? "").toString().trim(),
    maker: (formData.get("maker") ?? "").toString().trim(),
    model: (formData.get("model") ?? "").toString().trim(),
    year: intOrNull(formData.get("year")),
    color: strOrNull(formData.get("color")),
    description: strOrNull(formData.get("description")),
    mods_suspension: strOrNull(formData.get("mods_suspension")),
    mods_engine: strOrNull(formData.get("mods_engine")),
    mods_exterior: strOrNull(formData.get("mods_exterior")),
    mods_interior: strOrNull(formData.get("mods_interior")),
    mods_brake: strOrNull(formData.get("mods_brake")),
    mods_drivetrain: strOrNull(formData.get("mods_drivetrain")),
    power_ps: intOrNull(formData.get("power_ps")),
    weight_kg: intOrNull(formData.get("weight_kg")),
    cover_url: strOrNull(formData.get("cover_url"))
  };

  if (!payload.name || !payload.maker || !payload.model) {
    throw new Error("必須項目が未入力です");
  }

  const { data, error } = await supabase
    .from("cars")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;

  // ギャラリー写真があれば car_photos に登録
  const galleryPaths = (formData.get("gallery_paths") ?? "")
    .toString()
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (galleryPaths.length > 0) {
    await supabase.from("car_photos").insert(
      galleryPaths.map((p, i) => ({
        car_id: data.id,
        storage_path: p,
        position: i
      }))
    );
  }

  revalidatePath("/cars");
  redirect(`/cars/${data.id}`);
}

export async function updateCarAction(carId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 基本フィールド
  const payload: Record<string, unknown> = {
    name: (formData.get("name") ?? "").toString().trim(),
    maker: (formData.get("maker") ?? "").toString().trim(),
    model: (formData.get("model") ?? "").toString().trim(),
    year: intOrNull(formData.get("year")),
    color: strOrNull(formData.get("color")),
    description: strOrNull(formData.get("description")),
    mods_suspension: strOrNull(formData.get("mods_suspension")),
    mods_engine: strOrNull(formData.get("mods_engine")),
    mods_exterior: strOrNull(formData.get("mods_exterior")),
    mods_interior: strOrNull(formData.get("mods_interior")),
    mods_brake: strOrNull(formData.get("mods_brake")),
    mods_drivetrain: strOrNull(formData.get("mods_drivetrain")),
    power_ps: intOrNull(formData.get("power_ps")),
    weight_kg: intOrNull(formData.get("weight_kg"))
  };

  // 新規カバー画像がアップロードされていれば cover_url を更新。
  // 未アップロード (フォームに cover_url キーが無い) の場合は触らない。
  const newCoverUrl = strOrNull(formData.get("cover_url"));
  if (newCoverUrl) {
    payload.cover_url = newCoverUrl;
  }

  const { error } = await supabase
    .from("cars")
    .update(payload)
    .eq("id", carId)
    .eq("user_id", user.id);
  if (error) throw error;

  // 新規ギャラリー写真があれば car_photos に追加 (既存写真は残す)。
  const galleryPaths = (formData.get("gallery_paths") ?? "")
    .toString()
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (galleryPaths.length > 0) {
    // 既存の最大 position を取得して、その後ろに連番で追加する
    const { data: existing } = await supabase
      .from("car_photos")
      .select("position")
      .eq("car_id", carId)
      .order("position", { ascending: false })
      .limit(1);
    const startPos = ((existing?.[0]?.position as number | undefined) ?? -1) + 1;
    await supabase.from("car_photos").insert(
      galleryPaths.map((p, i) => ({
        car_id: carId,
        storage_path: p,
        position: startPos + i
      }))
    );
  }

  revalidatePath(`/cars/${carId}`);
  revalidatePath("/cars");
  redirect(`/cars/${carId}`);
}

export async function deleteCarAction(carId: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("cars")
    .delete()
    .eq("id", carId)
    .eq("user_id", user.id);
  if (error) throw error;
  revalidatePath("/cars");
  redirect("/cars");
}
