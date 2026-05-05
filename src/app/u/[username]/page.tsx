import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLapMs, type Profile } from "@/lib/types";
import { ProfileHeader } from "@/components/ProfileHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: { username: string };
}): Promise<Metadata> {
  return {
    title: `@${params.username}`,
    description: `走ログ ユーザー @${params.username} の愛車とタイム`
  };
}

export default async function UserPage({
  params
}: {
  params: { username: string };
}) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();
  if (!profile) notFound();

  const [
    { data: cars },
    { data: laps },
    { count: lapCount },
    { data: { user: viewer } }
  ] = await Promise.all([
    supabase
      .from("cars")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lap_times")
      .select(
        "id, total_ms, driven_at, circuits(name, slug), cars(name, maker, model)"
      )
      .eq("user_id", profile.id)
      .order("driven_at", { ascending: false })
      .limit(30),
    supabase
      .from("lap_times")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase.auth.getUser()
  ]);

  const isMyself = viewer?.id === profile.id;
  const carCount = cars?.length ?? 0;

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile as Profile}
        stats={{ cars: carCount, laps: lapCount ?? 0 }}
        isMyself={isMyself}
      />

      <section>
        <h2 className="mb-3 text-lg font-bold text-zinc-900">ガレージ</h2>
        {cars && cars.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-zinc-200 bg-white p-3 hover:border-racing-red transition"
              >
                <Link href={`/cars/${c.id}`}>
                  <p className="text-xs text-zinc-500">{c.maker}</p>
                  <p className="font-bold text-zinc-900">{c.name}</p>
                  <p className="text-sm text-zinc-700">{c.model}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">愛車が登録されていません。</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-zinc-900">最近のラップ</h2>
        {laps && laps.length > 0 ? (
          <ul className="space-y-2">
            {(laps as any[]).map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-2"
              >
                <div>
                  <Link
                    href={`/circuits/${l.circuits.slug}`}
                    className="text-sm text-zinc-800 hover:text-zinc-900"
                  >
                    {l.circuits.name}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {l.cars.maker} {l.cars.model} · {l.driven_at}
                  </p>
                </div>
                <Link
                  href={`/laps/${l.id}`}
                  className="font-mono text-lg font-bold lap-time tabular hover:underline"
                >
                  {formatLapMs(l.total_ms)}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">まだラップがありません。</p>
        )}
      </section>
    </div>
  );
}
