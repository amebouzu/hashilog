"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CircuitOpt = { slug: string; name: string; prefecture: string };
type CarPair = { maker: string; model: string };
type TirePair = { brand: string; model: string };

type Initial = {
  user?: string;
  circuit?: string;
  maker?: string;
  model?: string;
  brand?: string;
  tire?: string;
};

/**
 * ランキング画面のフィルター UI (Client Component).
 *
 * 旧実装は <form method="get"> でサーバー再レンダーに依存しており、
 * メーカー / ブランドを変えても、URL に反映されるまで model / 銘柄の
 * ドロップダウンが更新されなかった (= 全件が出続けて見えた)。
 *
 * このコンポーネントは選択状態をクライアント側で保持し、
 *  - maker を変えると model 候補が即座に絞り込まれる
 *  - brand を変えると tire 候補が即座に絞り込まれる
 *  - 親が無効になった場合は子をリセット
 * 送信ボタンを押した時点で URL に書き戻し、ページを再フェッチする。
 */
export function RankingFilters({
  initial,
  circuits,
  cars,
  tires,
  resultCount
}: {
  initial: Initial;
  circuits: CircuitOpt[];
  cars: CarPair[];
  tires: TirePair[];
  resultCount?: number;
}) {
  const router = useRouter();

  // ----- form state -----
  const [user, setUser] = useState(initial.user ?? "");
  const [circuit, setCircuit] = useState(initial.circuit ?? "");
  const [maker, setMaker] = useState(initial.maker ?? "");
  const [model, setModel] = useState(initial.model ?? "");
  const [brand, setBrand] = useState(initial.brand ?? "");
  const [tire, setTire] = useState(initial.tire ?? "");

  // ----- derived option lists -----
  const makers = useMemo(
    () => Array.from(new Set(cars.map((c) => c.maker))).sort(),
    [cars]
  );
  // メーカーが選ばれていればそのメーカーの車種だけ。未選択なら全車種。
  const models = useMemo(
    () =>
      Array.from(
        new Set(
          cars
            .filter((c) => !maker || c.maker === maker)
            .map((c) => c.model)
        )
      ).sort(),
    [cars, maker]
  );

  const brands = useMemo(
    () => Array.from(new Set(tires.map((t) => t.brand))).sort(),
    [tires]
  );
  const tireModels = useMemo(
    () =>
      Array.from(
        new Set(
          tires
            .filter((t) => !brand || t.brand === brand)
            .map((t) => t.model)
        )
      ).sort(),
    [tires, brand]
  );

  // ----- change handlers (親が変わったら子をリセット) -----
  function onMakerChange(v: string) {
    setMaker(v);
    setModel("");
  }
  function onBrandChange(v: string) {
    setBrand(v);
    setTire("");
  }

  // ----- submit: build URL and navigate -----
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (user.trim()) params.set("user", user.trim());
    if (circuit) params.set("circuit", circuit);
    if (maker) params.set("maker", maker);
    if (model) params.set("model", model);
    if (brand) params.set("brand", brand);
    if (tire) params.set("tire", tire);
    const qs = params.toString();
    router.push(`/ranking${qs ? `?${qs}` : ""}`);
  }

  return (
    <section>
      <div className="mb-2 flex items-end justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">条件で絞り込む</h2>
        <Link
          href="/ranking"
          className="text-xs text-racing-red hover:underline"
        >
          すべて解除
        </Link>
      </div>
      <form
        onSubmit={onSubmit}
        className="rounded-lg border border-zinc-200 bg-white p-4"
      >
        {/* ユーザー検索 */}
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">
            ユーザー検索 (ユーザー名 / 表示名 部分一致)
          </span>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="例: 山田, tanaka"
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>

        {/* 絞り込みドロップダウン群 */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            label="サーキット"
            value={circuit}
            onChange={setCircuit}
            options={[
              { value: "", label: "すべて" },
              ...circuits.map((c) => ({ value: c.slug, label: c.name }))
            ]}
          />
          <Select
            label="メーカー"
            value={maker}
            onChange={onMakerChange}
            options={[
              { value: "", label: "すべて" },
              ...makers.map((m) => ({ value: m, label: m }))
            ]}
          />
          <Select
            label="車種"
            value={model}
            onChange={setModel}
            options={[
              { value: "", label: maker ? "すべて (絞込後)" : "すべて" },
              ...models.map((m) => ({ value: m, label: m }))
            ]}
          />
          <Select
            label="タイヤブランド"
            value={brand}
            onChange={onBrandChange}
            options={[
              { value: "", label: "すべて" },
              ...brands.map((b) => ({ value: b, label: b }))
            ]}
          />
          <Select
            label="タイヤ銘柄"
            value={tire}
            onChange={setTire}
            options={[
              { value: "", label: brand ? "すべて (絞込後)" : "すべて" },
              ...tireModels.map((m) => ({ value: m, label: m }))
            ]}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded bg-racing-red px-4 py-1.5 text-sm font-bold text-white hover:bg-red-700"
          >
            この条件で検索
          </button>
          <Link
            href="/ranking"
            className="rounded border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            リセット
          </Link>
          {typeof resultCount === "number" && (
            <span className="ml-auto text-xs text-zinc-500">
              現在: {resultCount} 件
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
      >
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
