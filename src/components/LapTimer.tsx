"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LapTimingEngine,
  formatMs,
  type TimingEvent
} from "@/lib/laptiming";
import { perpendicularLine, type GpsSample } from "@/lib/geo";
import { getCircuitTiming } from "@/lib/circuit-timing";
import { nearestCircuitSlug } from "@/lib/circuit-locations";

type CarOpt = { id: string; name: string; maker: string; model: string };
type CircuitOpt = { id: string; slug: string; name: string; sectors: number };

type RecordedLap = {
  lapNumber: number;
  durationMs: number;
  sectorMs: number[];
  startAt: number;
  crossedAt: number;
};

type Status = "idle" | "locating" | "ready" | "timing";

/**
 * 走ログロガー (Phase 1 / PWA).
 *
 * スマホの GPS を使ってラップタイムを計測し、走ログに直接アップロードする。
 * 計測ロジックは lib/laptiming.ts (移植可能) に委譲し、本コンポーネントは
 * GPS の購読・画面ロック防止・UI・保存だけを担当する。
 */
export function LapTimer({
  cars,
  circuits
}: {
  cars: CarOpt[];
  circuits: CircuitOpt[];
}) {
  const router = useRouter();

  const [circuitId, setCircuitId] = useState(circuits[0]?.id ?? "");
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [lineSet, setLineSet] = useState(false);
  // GPS によるサーキット自動検出の結果メッセージ
  const [autoDetected, setAutoDetected] = useState<string | null>(null);
  const [laps, setLaps] = useState<RecordedLap[]>([]);
  const [liveLapMs, setLiveLapMs] = useState(0);
  const [savingLap, setSavingLap] = useState<number | null>(null);
  const [savedLaps, setSavedLaps] = useState<Set<number>>(new Set());

  // ----- refs (再レンダーに影響されない実体) -----
  const engineRef = useRef<LapTimingEngine | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const traceRef = useRef<GpsSample[]>([]);
  const prevSampleRef = useRef<GpsSample | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accSumRef = useRef<{ sum: number; n: number }>({ sum: 0, n: 0 });
  // サーキット自動検出を1セッション1回だけ行うフラグ
  const autoCheckedRef = useRef(false);
  // ユーザーが手動でサーキットを選んだら自動検出で上書きしない
  const userPickedRef = useRef(false);

  const selectedCircuit = circuits.find((c) => c.id === circuitId);

  // ===== Wake Lock (画面常時点灯) =====
  const acquireWakeLock = useCallback(async () => {
    try {
      // @ts-ignore - wakeLock は型がない環境もある
      if (navigator.wakeLock) {
        // @ts-ignore
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // 取得失敗は致命的ではない
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    try {
      wakeLockRef.current?.release();
    } catch {
      /* noop */
    }
    wakeLockRef.current = null;
  }, []);

  // バックグラウンド復帰時に WakeLock を取り直す
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible" && status === "timing") {
        acquireWakeLock();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [status, acquireWakeLock]);

  // ===== ライブタイマー (計測中の経過表示) =====
  useEffect(() => {
    if (status === "timing" && lineSet) {
      tickRef.current = setInterval(() => {
        const start = engineRef.current?.currentLapStart;
        if (start) setLiveLapMs(Date.now() - start);
      }, 100);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [status, lineSet]);

  // ===== GPS サンプル処理 =====
  const onPosition = useCallback((pos: GeolocationPosition) => {
    const sample: GpsSample = {
      t: pos.timestamp,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      speed: pos.coords.speed,
      accuracy: pos.coords.accuracy
    };

    setSpeedKmh(
      pos.coords.speed != null ? Math.max(0, pos.coords.speed * 3.6) : null
    );
    setAccuracy(pos.coords.accuracy ?? null);

    // --- サーキット自動検出 (最初の1回・手動選択がなければ) ---
    if (!autoCheckedRef.current && !userPickedRef.current) {
      autoCheckedRef.current = true;
      const near = nearestCircuitSlug(
        pos.coords.latitude,
        pos.coords.longitude,
        10
      );
      if (near) {
        const match = circuits.find((c) => c.slug === near.slug);
        if (match) {
          setCircuitId(match.id);
          setAutoDetected(
            `📍 ${match.name} を検出しました (約${near.distanceKm.toFixed(1)}km)`
          );
        }
      } else {
        setAutoDetected(
          "現在地から近いサーキットが見つかりませんでした。手動で選択してください。"
        );
      }
    }

    // 軌跡を記録
    traceRef.current.push(sample);
    if (pos.coords.accuracy != null) {
      accSumRef.current.sum += pos.coords.accuracy;
      accSumRef.current.n++;
    }

    // エンジンに流す
    const ev = engineRef.current?.addSample(sample) ?? null;
    handleEvent(ev);

    prevSampleRef.current = sample;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEvent(ev: TimingEvent | null) {
    if (!ev) return;
    if (ev.type === "lap") {
      const startAt = ev.crossedAt - ev.durationMs;
      setLaps((prev) => [
        {
          lapNumber: ev.lapNumber,
          durationMs: ev.durationMs,
          sectorMs: ev.sectorMs,
          startAt,
          crossedAt: ev.crossedAt
        },
        ...prev
      ]);
    }
  }

  // ===== 計測開始 (GPS 購読) =====
  async function startGps() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("この端末では位置情報が利用できません。");
      return;
    }
    if (!circuitId) {
      setError("サーキットを選択してください。");
      return;
    }

    setStatus("locating");

    // エンジン初期化 (予定義ラインがあれば使う)
    const timing = selectedCircuit
      ? getCircuitTiming(selectedCircuit.slug)
      : null;
    engineRef.current = new LapTimingEngine({
      startFinish: timing?.startFinish ?? {
        lat1: 0,
        lng1: 0,
        lat2: 0,
        lng2: 0
      },
      sectors: timing?.sectors
    });
    setLineSet(!!timing?.startFinish);
    traceRef.current = [];
    prevSampleRef.current = null;
    accSumRef.current = { sum: 0, n: 0 };
    autoCheckedRef.current = false; // セッションごとに自動検出を再実行
    setAutoDetected(null);
    setLaps([]);
    setSavedLaps(new Set());

    await acquireWakeLock();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (status === "locating") setStatus("timing");
        onPosition(pos);
      },
      (err) => {
        setError(`位置情報の取得に失敗しました: ${err.message}`);
        stopGps();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    setStatus("timing");
  }

  // ===== 計測停止 =====
  const stopGps = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (tickRef.current) clearInterval(tickRef.current);
    releaseWakeLock();
    setStatus("idle");
    setLiveLapMs(0);
  }, [releaseWakeLock]);

  // アンマウント時クリーンアップ
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // ===== コントロールライン設定 (通過時にタップ) =====
  function setControlLineHere() {
    const cur = prevSampleRef.current;
    const trace = traceRef.current;
    if (!cur || trace.length < 2) {
      setError("GPS が安定してから設定してください (数秒お待ちを)。");
      return;
    }
    // 直近2点から進行方向を求める
    const prev = trace[trace.length - 2];
    const heading = { dLat: cur.lat - prev.lat, dLng: cur.lng - prev.lng };
    const line = perpendicularLine(
      { lat: cur.lat, lng: cur.lng },
      heading,
      20
    );
    engineRef.current?.setStartFinish(line);
    // 既に通過した扱いにせず、次の通過から計測開始させるためエンジンをリセット気味に
    engineRef.current?.reset();
    setLaps([]);
    setLineSet(true);
    setError(null);
  }

  // ===== ラップを走ログに保存 =====
  async function saveLap(lap: RecordedLap) {
    if (!carId) {
      setError("使用車両を選択してください。");
      return;
    }
    setSavingLap(lap.lapNumber);
    setError(null);

    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setSavingLap(null);
      setError("ログインしてください。");
      return;
    }

    const sectors = lap.sectorMs.length > 0 ? lap.sectorMs : [];
    const today = new Date().toISOString().slice(0, 10);

    const { data: inserted, error: insErr } = await supabase
      .from("lap_times")
      .insert({
        user_id: user.id,
        car_id: carId,
        circuit_id: circuitId,
        total_ms: Math.round(lap.durationMs),
        sector1_ms: sectors[0] ? Math.round(sectors[0]) : null,
        sector2_ms: sectors[1] ? Math.round(sectors[1]) : null,
        sector3_ms: sectors[2] ? Math.round(sectors[2]) : null,
        sector4_ms: sectors[3] ? Math.round(sectors[3]) : null,
        weather: "sunny",
        track_condition: "dry",
        driven_at: today,
        source: "gps",
        gps_verified: true,
        note: "走ログロガーで計測 (GPS)"
      })
      .select("id")
      .single();

    if (insErr || !inserted) {
      setSavingLap(null);
      setError(insErr?.message ?? "保存に失敗しました。");
      return;
    }

    // 軌跡 (このラップ区間) を抽出して保存
    const points = traceRef.current
      .filter((s) => s.t >= lap.startAt && s.t <= lap.crossedAt)
      .map((s) => ({
        t: s.t,
        lat: Number(s.lat.toFixed(6)),
        lng: Number(s.lng.toFixed(6)),
        spd: s.speed != null ? Number(s.speed.toFixed(2)) : null
      }));
    const avgAcc =
      accSumRef.current.n > 0
        ? accSumRef.current.sum / accSumRef.current.n
        : null;

    await supabase.from("lap_gps_traces").insert({
      lap_time_id: inserted.id,
      points,
      point_count: points.length,
      device:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
      avg_accuracy: avgAcc != null ? Number(avgAcc.toFixed(2)) : null
    });

    setSavingLap(null);
    setSavedLaps((prev) => new Set(prev).add(lap.lapNumber));
  }

  const bestLapMs =
    laps.length > 0 ? Math.min(...laps.map((l) => l.durationMs)) : null;
  const accuracyLabel =
    accuracy == null
      ? "—"
      : accuracy <= 5
      ? `${accuracy.toFixed(0)}m (良好)`
      : accuracy <= 15
      ? `${accuracy.toFixed(0)}m (やや粗い)`
      : `${accuracy.toFixed(0)}m (低精度)`;

  return (
    <div className="space-y-5">
      {/* 設定 */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-600">サーキット</span>
            <select
              value={circuitId}
              onChange={(e) => {
                userPickedRef.current = true;
                setCircuitId(e.target.value);
              }}
              className="w-full rounded border border-zinc-300 bg-white px-2 py-2 text-sm"
            >
              {circuits.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-zinc-600">使用車両</span>
            <select
              value={carId}
              onChange={(e) => setCarId(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-2 py-2 text-sm"
            >
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.maker} {c.model} ({c.name})
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* サーキット自動検出メッセージ */}
      {autoDetected && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          {autoDetected}
          <span className="mt-1 block text-xs text-emerald-700">
            違う場合は上のドロップダウンで変更できます。
          </span>
        </p>
      )}

      {/* GPS ステータス */}
      {status !== "idle" && (
        <section className="grid grid-cols-3 gap-3 text-center">
          <Stat label="速度" value={speedKmh != null ? `${speedKmh.toFixed(0)} km/h` : "—"} />
          <Stat label="GPS精度" value={accuracyLabel} />
          <Stat
            label="状態"
            value={lineSet ? "計測中" : "ライン未設定"}
          />
        </section>
      )}

      {/* ライブタイマー */}
      {status === "timing" && lineSet && (
        <section className="rounded-xl border border-zinc-200 bg-zinc-900 p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            現在のラップ
          </p>
          <p className="mt-1 font-mono text-5xl font-black tabular text-white">
            {formatMs(liveLapMs)}
          </p>
          {bestLapMs != null && (
            <p className="mt-2 text-sm text-zinc-400">
              ベスト{" "}
              <span className="font-mono font-bold text-racing-red">
                {formatMs(bestLapMs)}
              </span>
            </p>
          )}
        </section>
      )}

      {/* 操作ボタン */}
      <section className="flex flex-wrap gap-2">
        {status === "idle" ? (
          <button
            onClick={startGps}
            className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
          >
            GPS計測を開始
          </button>
        ) : (
          <>
            {!lineSet && (
              <button
                onClick={setControlLineHere}
                className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
              >
                ここをコントロールラインに設定
              </button>
            )}
            <button
              onClick={stopGps}
              className="rounded border border-zinc-300 px-5 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
            >
              計測を停止
            </button>
          </>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 説明 (ライン未設定時) */}
      {status === "timing" && !lineSet && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          コントロール(スタート/フィニッシュ)ラインを通過する瞬間に
          「ここをコントロールラインに設定」を押してください。
          以降、同じ地点を通過するたびに自動でラップを計測します。
        </p>
      )}

      {/* ラップ一覧 */}
      {laps.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">
            計測したラップ
          </h2>
          <ul className="space-y-2">
            {laps.map((lap) => {
              const isBest = lap.durationMs === bestLapMs;
              const saved = savedLaps.has(lap.lapNumber);
              return (
                <li
                  key={lap.lapNumber}
                  className={`flex items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 ${
                    isBest ? "border-racing-red" : "border-zinc-200"
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-zinc-400">
                      Lap {lap.lapNumber}
                    </span>
                    <span className="font-mono text-xl font-bold tabular lap-time">
                      {formatMs(lap.durationMs)}
                    </span>
                    {isBest && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-racing-red">
                        ベスト
                      </span>
                    )}
                  </div>
                  {saved ? (
                    <span className="text-xs font-bold text-emerald-600">
                      ✓ 投稿済み
                    </span>
                  ) : (
                    <button
                      onClick={() => saveLap(lap)}
                      disabled={savingLap != null}
                      className="rounded bg-racing-red px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {savingLap === lap.lapNumber
                        ? "投稿中…"
                        : "走ログに投稿"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {savedLaps.size > 0 && (
            <button
              onClick={() => router.push("/ranking")}
              className="mt-3 text-sm text-racing-red hover:underline"
            >
              ランキングで確認する →
            </button>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold text-zinc-900">{value}</p>
    </div>
  );
}

// WakeLockSentinel の最小型 (lib.dom に無い環境向け)
type WakeLockSentinel = { release: () => Promise<void> };
