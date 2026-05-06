import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LapForm } from "@/components/LapForm";
import { prefectureOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewLapPage({
  searchParams
}: {
  searchParams: { car?: string; circuit?: string };
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: cars }, { data: circuits }, { data: tires }] = await Promise.all([
    supabase
      .from("cars")
      .select("id,name,maker,model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("circuits").select("id,slug,name,sectors,prefecture"),
    supabase.from("tires").select("id,brand,model").order("brand")
  ]);

  // サーキットは都道府県順 (北→南) → 同県内は名前昇順
  const sortedCircuits = (circuits ?? []).slice().sort((a, b) => {
    const oa = prefectureOrder(a.prefecture);
    const ob = prefectureOrder(b.prefecture);
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, "ja");
  });

  if (!cars || cars.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
        <p className="mb-4 text-zinc-700">先に愛車を登録してください。</p>
        <Link
          href="/cars/new"
          className="inline-block rounded bg-racing-red px-4 py-2 font-bold text-white hover:bg-red-700"
        >
          愛車を登録する
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-zinc-900">タイム投稿</h1>
      <LapForm
        cars={cars}
        circuits={sortedCircuits}
        tires={tires ?? []}
        defaultCarId={searchParams.car}
        defaultCircuitId={searchParams.circuit}
      />
    </div>
  );
}
