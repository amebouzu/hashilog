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

  const payload = {
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

  const { error } = await supabase
    .from("cars")
    .update(payload)
    .eq("id", carId)
    .eq("user_id", user.id);
  if (error) throw error;

  revalidatePath(`/cars/${carId}`);
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
