import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LapTimer } from "@/components/LapTimer";
import { prefectureOrder } from "@/lib/types";

export const metadata: Metadata = {
  title: "走ログロガー (GPS計測)",
  description:
    "スマートフォンの GPS でサーキットのラップタイムを計測し、そのまま走ログに投稿できる GPS ラップタイマー (ベータ)。"
};

export const dynamic = "force-dynamic";

export default async function LapTimerPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/laptimer");

  const [{ data: cars }, { data: circuits }] = await Promise.all([
    supabase
      .from("cars")
      .select("id,name,maker,model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("circuits")
      .select("id,slug,name,sectors,prefecture")
      .eq("is_published", true)
  ]);

  const sortedCircuits = (circuits ?? []).slice().sort((a, b) => {
    const oa = prefectureOrder(a.prefecture);
    const ob = prefectureOrder(b.prefecture);
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, "ja");
  });

  if (!cars || cars.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
        <p className="mb-4 text-zinc-700">
          GPS計測の前に、まず愛車を登録してください。
        </p>
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
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-zinc-900">走ログロガー</h1>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
          BETA
        </span>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
        <p className="font-semibold text-zinc-900">使い方</p>
        <ol className="mt-2 ml-4 list-decimal space-y-1">
          <li>サーキットと使用車両を選び「GPS計測を開始」</li>
          <li>
            コントロール(スタート/フィニッシュ)ラインを通過する瞬間に「ここをコントロールラインに設定」をタップ
          </li>
          <li>以降、同じ地点を通過するたびに自動でラップを計測</li>
          <li>計測したラップを「走ログに投稿」で保存 (GPS計測バッジ付き)</li>
        </ol>
        <p className="mt-3 text-xs text-zinc-500">
          ※ ブラウザGPSの精度は ±0.3〜0.5秒程度です。公式計時の代替ではなく自己ベスト管理・練習用途を想定しています。計測中は画面が点灯し続けます。車載充電を推奨します。安全な走行を最優先してください (操作は停車中・同乗者が行ってください)。
        </p>
      </div>

      <LapTimer cars={cars} circuits={sortedCircuits} />
    </div>
  );
}
