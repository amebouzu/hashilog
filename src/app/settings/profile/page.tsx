import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-zinc-900">プロフィール編集</h1>
      <ProfileEditForm profile={profile as Profile} />
    </div>
  );
}
