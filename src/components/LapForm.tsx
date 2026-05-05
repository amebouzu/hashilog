"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseLapToMs } from "@/lib/types";

type CarOpt = { id: string; name: string; maker: string; model: string };
type CircuitOpt = { id: string; slug: string; name: string; sectors: number };
type TireOpt = {
  id: string;
  brand: string;
  model: string;
};

const OTHER = "__other__";

export function LapForm({
  cars,
  circuits,
  tires,
  defaultCarId,
  defaultCircuitId
}: {
  cars: CarOpt[];
  circuits: CircuitOpt[];
  tires: TireOpt[];
  defaultCarId?: string;
  defaultCircuitId?: string;
}) {
  const router = useRouter();
  const [carId, setCarId] = useState(defaultCarId ?? cars[0]?.id ?? "");
  const [circuitId, setCircuitId] = useState(
    defaultCircuitId ?? circuits[0]?.id ?? ""
  );
  const [tireBrand, setTireBrand] = useState<string>("");
  const [tireId, setTireId] = useState<string>("");
  const [customBrand, setCustomBrand] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("");
  const [tireSizeFront, setTireSizeFront] = useState<string>("");
  const [tireSizeRear, setTireSizeRear] = useState<string>("");
  const [total, setTotal] = useState("");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [s4, setS4] = useState("");
  const [topSpeed, setTopSpeed] = useState("");
  const [weather, setWeather] = useState("sunny");
  const [trackCond, setTrackCond] = useState("dry");
  const [airTemp, setAirTemp] = useState("");
  const [trackTemp, setTrackTemp] = useState("");
  const [drivenAt, setDrivenAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sectors = useMemo(
    () => circuits.find((c) => c.id === circuitId)?.sectors ?? 3,
    [circuits, circuitId]
  );

  const tireBrands = useMemo(
    () => Array.from(new Set(tires.map((t) => t.brand))).sort(),
    [tires]
  );
  const tireModelsForBrand = useMemo(
    () => tires.filter((t) => !tireBrand || t.brand === tireBrand),
    [tires, tireBrand]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const totalMs = parseLapToMs(total);
    if (!totalMs) {
      setError("総合タイムの形式が不正です。例: 1:23.456");
      return;
    }
    const sectorMs = [s1, s2, s3, s4].map((s) => parseLapToMs(s));

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("ログインしてください");
      return;
    }

    // 手動入力された銘柄は tires に upsert して id を取得
    let resolvedTireId: string | null = null;
    if (tireBrand === OTHER || tireId === OTHER) {
      const newBrand =
        tireBrand === OTHER ? customBrand.trim() : tireBrand;
      const newModel = customModel.trim();
      if (!newBrand || !newModel) {
        setSaving(false);
        setError("ブランドと銘柄を両方入力してください");
        return;
      }
      const { data: upserted, error: tireErr } = await supabase
        .from("tires")
        .upsert(
          {
            brand: newBrand,
            model: newModel,
            submitted_by: user.id
          },
          { onConflict: "brand,model" }
        )
        .select("id")
        .single();
      if (tireErr || !upserted) {
        setSaving(false);
        setError(tireErr?.message ?? "タイヤ銘柄の登録に失敗しました");
        return;
      }
      resolvedTireId = upserted.id;
    } else if (tireId) {
      resolvedTireId = tireId;
    }

    const front = tireSizeFront.trim();
    const rear = tireSizeRear.trim();

    const { data: lap, error: insertErr } = await supabase
      .from("lap_times")
      .insert({
        user_id: user.id,
        car_id: carId,
        circuit_id: circuitId,
        tire_id: resolvedTireId,
        tire_size_front: front || null,
        // リア未入力時はフロントと同じものを記録 (前後同サイズ車両への配慮)
        tire_size_rear: rear || front || null,
        // 旧カラム互換 (一覧表示等で fallback されている場合のため)
        tire_size: front || null,
        total_ms: totalMs,
        sector1_ms: sectorMs[0],
        sector2_ms: sectorMs[1],
        sector3_ms: sectorMs[2],
        sector4_ms: sectorMs[3],
        top_speed_kmh: topSpeed ? parseInt(topSpeed, 10) : null,
        weather,
        track_condition: trackCond,
        air_temp_c: airTemp ? parseFloat(airTemp) : null,
        track_temp_c: trackTemp ? parseFloat(trackTemp) : null,
        driven_at: drivenAt,
        note: note || null
      })
      .select("id")
      .single();

    if (insertErr || !lap) {
      setSaving(false);
      setError(insertErr?.message ?? "登録に失敗しました");
      return;
    }

    for (const file of photos) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${lap.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("lap-photos")
        .upload(path, file, { upsert: false });
      if (up.error) {
        console.warn("photo upload failed", up.error.message);
        continue;
      }
      await supabase.from("lap_photos").insert({
        lap_time_id: lap.id,
        storage_path: path
      });
    }

    setSaving(false);
    router.push(`/laps/${lap.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="基本">
        <Grid>
          <Select
            label="サーキット"
            value={circuitId}
            onChange={setCircuitId}
            options={circuits.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <Select
            label="使用車両"
            value={carId}
            onChange={setCarId}
            options={cars.map((c) => ({
              value: c.id,
              label: `${c.maker} ${c.model} (${c.name})`
            }))}
            required
          />
          <Field label="走行日">
            <input
              type="date"
              required
              value={drivenAt}
              onChange={(e) => setDrivenAt(e.target.value)}
              className="input"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="タイム">
        <Grid>
          <Field label="総合タイム (例: 1:23.456)">
            <input
              required
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="input font-mono"
              placeholder="1:23.456"
            />
          </Field>
          <Field label="最高速 (km/h)">
            <input
              type="number"
              value={topSpeed}
              onChange={(e) => setTopSpeed(e.target.value)}
              className="input"
            />
          </Field>
        </Grid>
        <p className="text-xs text-zinc-500">
          セクタータイム ({sectors}セクター)
        </p>
        <Grid>
          <Field label="セクター1">
            <input
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              className="input font-mono"
              placeholder="32.123"
            />
          </Field>
          <Field label="セクター2">
            <input
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              className="input font-mono"
              placeholder="28.456"
            />
          </Field>
          <Field label="セクター3">
            <input
              value={s3}
              onChange={(e) => setS3(e.target.value)}
              className="input font-mono"
              placeholder="22.876"
            />
          </Field>
          {sectors >= 4 && (
            <Field label="セクター4">
              <input
                value={s4}
                onChange={(e) => setS4(e.target.value)}
                className="input font-mono"
              />
            </Field>
          )}
        </Grid>
      </Section>

      <Section title="コンディション">
        <Grid>
          <Select
            label="天候"
            value={weather}
            onChange={setWeather}
            options={[
              { value: "sunny", label: "晴れ" },
              { value: "cloudy", label: "曇り" },
              { value: "rain", label: "雨" },
              { value: "heavy_rain", label: "大雨" },
              { value: "snow", label: "雪" },
              { value: "mixed", label: "変わりやすい" }
            ]}
          />
          <Select
            label="路面"
            value={trackCond}
            onChange={setTrackCond}
            options={[
              { value: "dry", label: "ドライ" },
              { value: "damp", label: "ハーフウェット" },
              { value: "wet", label: "ウェット" }
            ]}
          />
          <Field label="気温 (℃)">
            <input
              type="number"
              step="0.1"
              value={airTemp}
              onChange={(e) => setAirTemp(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="路温 (℃)">
            <input
              type="number"
              step="0.1"
              value={trackTemp}
              onChange={(e) => setTrackTemp(e.target.value)}
              className="input"
            />
          </Field>
        </Grid>
        <p className="pt-2 text-xs text-zinc-500">使用タイヤ</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Select
              label="ブランド"
              value={tireBrand}
              onChange={(v) => {
                setTireBrand(v);
                setTireId("");
              }}
              options={[
                { value: "", label: "(未選択)" },
                ...tireBrands.map((b) => ({ value: b, label: b })),
                { value: OTHER, label: "その他 (手動入力)" }
              ]}
            />
            {tireBrand === OTHER && (
              <input
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="ブランド名を入力"
                className="input mt-2"
              />
            )}
          </div>
          <div>
            <Select
              label="銘柄"
              value={tireId}
              onChange={setTireId}
              options={[
                { value: "", label: "(未選択)" },
                ...tireModelsForBrand.map((t) => ({
                  value: t.id,
                  label: t.model
                })),
                { value: OTHER, label: "その他 (手動入力)" }
              ]}
            />
            {(tireId === OTHER || tireBrand === OTHER) && (
              <input
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="銘柄名を入力"
                className="input mt-2"
              />
            )}
            {(tireId === OTHER || tireBrand === OTHER) && (
              <p className="mt-1 text-xs text-emerald-600">
                登録後、次回からドロップダウンに自動表示されます。
              </p>
            )}
          </div>
          <Field label="サイズ (フロント)">
            <input
              value={tireSizeFront}
              onChange={(e) => setTireSizeFront(e.target.value)}
              placeholder="245/40R18"
              className="input font-mono"
            />
          </Field>
          <Field label="サイズ (リア)">
            <input
              value={tireSizeRear}
              onChange={(e) => setTireSizeRear(e.target.value)}
              placeholder="265/35R18 (フロントと同じなら省略可)"
              className="input font-mono"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="エビデンス写真"
        hint="計測器・タイミングモニター・車載動画など。複数枚OK。"
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          className="text-sm text-zinc-700"
        />
        {photos.length > 0 && (
          <p className="text-xs text-zinc-500">{photos.length}枚 選択中</p>
        )}
      </Section>

      <Section title="メモ">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="input"
          placeholder="アタック何回目、ベスト後の感想など"
        />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-racing-red px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? "投稿中…" : "投稿する"}
      </button>
      <style jsx>{`
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
          padding: 8px 10px;
          color: #18181b;
        }
        .input:focus {
          outline: none;
          border-color: #e10600;
          box-shadow: 0 0 0 3px rgba(225, 6, 0, 0.1);
        }
      `}</style>
    </form>
  );
}

function Section({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-zinc-900">{title}</h2>
      {hint && <p className="mb-3 text-xs text-zinc-500">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="input"
      >
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
