import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleFeatureFlag, toggleAdSlot } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminFeaturesPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-bold text-red-900">アクセス権限がありません</h1>
        <p className="mt-2 text-sm text-zinc-700">
          このページは走ログ運営スタッフ専用です。
        </p>
      </div>
    );
  }

  const [{ data: flags }, { data: ads }, { data: plans }] = await Promise.all([
    supabase.from("feature_flags").select("*").order("key"),
    supabase.from("ad_slots").select("*").order("slot_key"),
    supabase.from("plan_limits").select("*").order("monthly_price_jpy")
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
          ADMIN
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">機能スイッチ</h1>
        <p className="mt-1 text-sm text-zinc-600">
          有効化したい機能をオンにしてください。すべての機能はデフォルトでオフです。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">フィーチャーフラグ</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {(flags ?? []).map((f) => (
            <form
              key={f.key}
              action={toggleFeatureFlag}
              className="flex items-center justify-between border-b border-zinc-200 p-4 last:border-b-0"
            >
              <div className="flex-1">
                <p className="font-mono text-sm font-bold text-zinc-900">
                  {f.key}
                </p>
                <p className="text-xs text-zinc-500">{f.description}</p>
              </div>
              <input type="hidden" name="key" value={f.key} />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={f.enabled}
                  className="h-4 w-4"
                />
                <span className="text-xs text-zinc-700">有効</span>
              </label>
              <button
                type="submit"
                className="ml-4 rounded bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700"
              >
                保存
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">広告枠</h2>
        <p className="text-xs text-zinc-500">
          各スロットの HTML (AdSense タグ等) を貼り付けて有効化。
          ads_enabled フラグも ON にする必要があります。
        </p>
        <div className="space-y-3">
          {(ads ?? []).map((a) => (
            <form
              key={a.slot_key}
              action={toggleAdSlot}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-sm font-bold text-zinc-900">
                  {a.slot_key}
                </p>
                <span className="text-xs text-zinc-500">{a.network}</span>
              </div>
              <input type="hidden" name="slot_key" value={a.slot_key} />
              <textarea
                name="html"
                defaultValue={a.html ?? ""}
                rows={3}
                placeholder="<!-- AdSense タグ等を貼り付け -->"
                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900"
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={a.enabled}
                    className="h-4 w-4"
                  />
                  <span className="text-xs text-zinc-700">この枠を有効化</span>
                </label>
                <button
                  type="submit"
                  className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-700"
                >
                  保存
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">プラン定義 (参照のみ)</h2>
        <p className="text-xs text-zinc-500">
          価格や上限の変更は SQL Editor から
          <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-[11px]">
            update plan_limits set ...
          </code>
          で行ってください。
        </p>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-left">tier</th>
                <th className="px-3 py-2 text-left">表示名</th>
                <th className="px-3 py-2 text-right">月額</th>
                <th className="px-3 py-2 text-right">年額</th>
                <th className="px-3 py-2 text-right">愛車</th>
                <th className="px-3 py-2 text-right">写真/lap</th>
                <th className="px-3 py-2 text-right">月lap</th>
                <th className="px-3 py-2 text-right">動画秒</th>
              </tr>
            </thead>
            <tbody>
              {(plans ?? []).map((p) => (
                <tr key={p.tier} className="border-t border-zinc-100">
                  <td className="px-3 py-2 font-mono">{p.tier}</td>
                  <td className="px-3 py-2">{p.display_name}</td>
                  <td className="px-3 py-2 text-right tabular">
                    ¥{p.monthly_price_jpy?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    ¥{p.yearly_price_jpy?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {p.max_cars ?? "∞"}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {p.max_lap_photos ?? "∞"}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {p.max_laps_per_month ?? "∞"}
                  </td>
                  <td className="px-3 py-2 text-right tabular">
                    {p.max_video_seconds ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
