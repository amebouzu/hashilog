import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Circuit } from "@/lib/types";

export const dynamic = "force-dynamic";

// FIA Grade 1〜2相当の国際格式サーキット
const INTERNATIONAL_SLUGS = new Set([
  "fuji",
  "suzuka",
  "motegi",
  "okayama",
  "autopolis",
  "sportsland-sugo"
]);

export default async function CircuitsPage() {
  const supabase = createClient();
  const { data: circuits } = await supabase
    .from("circuits")
    .select("*")
    .order("length_m", { ascending: false });

  const all = (circuits ?? []) as Circuit[];
  const international = all.filter((c) => INTERNATIONAL_SLUGS.has(c.slug));
  const others = all.filter((c) => !INTERNATIONAL_SLUGS.has(c.slug));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">サーキット一覧</h1>

      <CircuitGroup
        title="国際サーキット"
        circuits={international}
        emptyText="国際サーキットはまだ登録されていません"
      />
      <CircuitGroup
        title="ショートサーキット / ミニサーキット / その他"
        circuits={others}
        emptyText="サーキットはまだ登録されていません"
      />
    </div>
  );
}

function CircuitGroup({
  title,
  circuits,
  emptyText
}: {
  title: string;
  circuits: Circuit[];
  emptyText: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      {circuits.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {circuits.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-racing-red"
            >
              <Link href={`/circuits/${c.slug}`}>
                <p className="text-xs text-zinc-500">{c.prefecture}</p>
                <p className="text-lg font-bold text-zinc-900">{c.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {c.length_m ? `${c.length_m.toLocaleString()} m` : ""} ·{" "}
                  {c.sectors}セクター
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          {emptyText}
        </p>
      )}
    </section>
  );
}
