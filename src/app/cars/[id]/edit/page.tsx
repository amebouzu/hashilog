import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CarForm } from "@/components/CarForm";
import { updateCarAction } from "@/app/actions/cars";
import type { Car } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditCarPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/cars/${params.id}/edit`);

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!car) notFound();
  // 他人の愛車は編集不可 → 詳細ページに戻す
  if (car.user_id !== user.id) {
    redirect(`/cars/${params.id}`);
  }

  // updateCarAction は (carId, formData) を受け取るので、carId を bind した
  // wrapper を CarForm の action として渡す。
  async function action(formData: FormData) {
    "use server";
    await updateCarAction(params.id, formData);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">愛車を編集</h1>
        <Link
          href={`/cars/${params.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← 詳細に戻る
        </Link>
      </div>
      <CarForm
        initial={car as Car}
        action={action}
        submitLabel="保存する"
      />
    </div>
  );
}
