"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * ラップタイム削除。
 * RLS の "laps owner write" ポリシーで自分のラップしか消せないが、
 * 念のため user_id も一致条件に加えて二重にガード。
 * 関連する lap_photos は ON DELETE CASCADE で自動削除される。
 * Storage 上の画像ファイル本体は best-effort で削除を試みる。
 */
export async function deleteLapAction(lapId: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 削除前に Storage パスを取得 (DB 削除後だと参照できなくなる)
  const { data: photos } = await supabase
    .from("lap_photos")
    .select("storage_path")
    .eq("lap_time_id", lapId);

  const { error } = await supabase
    .from("lap_times")
    .delete()
    .eq("id", lapId)
    .eq("user_id", user.id);
  if (error) throw error;

  // Storage 側のファイル削除 (best-effort: 失敗しても処理は継続)
  if (photos && photos.length > 0) {
    const paths = photos.map((p) => p.storage_path).filter(Boolean);
    if (paths.length > 0) {
      try {
        await supabase.storage.from("lap-photos").remove(paths);
      } catch (e) {
        console.warn("storage cleanup failed", e);
      }
    }
  }

  revalidatePath("/ranking");
  revalidatePath(`/u/${user.id}`);
  redirect("/ranking");
}
