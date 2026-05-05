import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CarForm } from "@/components/CarForm";
import { createCarAction } from "@/app/actions/cars";

export default async function NewCarPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-zinc-900">愛車を登録</h1>
      <CarForm action={createCarAction} submitLabel="登録する" />
    </div>
  );
}
