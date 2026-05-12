"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatLapMs } from "@/lib/types";

type SlideLap = {
  id: string;
  total_ms: number;
  driven_at: string;
  profiles: { username: string };
  cars: { maker: string; model: string };
  circuits: { name: string };
};

// 連続再生 (auto-flow) に最低必要な件数。これ未満は単純に横並び表示する。
const MARQUEE_MIN = 5;

// 自動スクロール速度 (ピクセル / フレーム)。値が大きいほど速い。
const AUTO_SPEED_PX = 0.5;

// 手動操作後にこのミリ秒だけ自動スクロールを停止する
const RESUME_DELAY_MS = 1800;

export function LapSlider({ laps }: { laps: SlideLap[] }) {
  if (!laps || laps.length === 0) return null;

  const shouldLoop = laps.length >= MARQUEE_MIN;
  // ループ表示する時は seamless loop 用に複製。
  // ユーザーが半分まで進んだら scrollLeft をリセットして繰り返す。
  const items = shouldLoop ? [...laps, ...laps] : laps;

  return (
    <section>
      <div className="mb-2 flex items-end justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-racing-red align-middle" />
          最新のタイム投稿
        </h2>
        {shouldLoop && (
          <span className="text-xs text-zinc-500">
            ホバー / スクロールで一時停止
          </span>
        )}
      </div>

      {shouldLoop ? (
        <AutoFlowTrack items={items} originalLength={laps.length} />
      ) : (
        // 件数が少ない時は静止表示。手動スクロールのみ可能。
        <div className="lap-slider lap-slider--static">
          <div className="lap-slider-static">
            {items.map((l) => (
              <LapCard key={l.id} lap={l} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * 自動スクロール + 手動スクロール両対応のトラック。
 *
 * - requestAnimationFrame で scrollLeft をフレームごとに前進
 * - ユーザーが触ったら (ホバー / マウス操作 / タッチ / 直接スクロール) 一時停止
 * - 操作後 RESUME_DELAY_MS 経過したら自動再開
 * - scrollLeft が track 全長の半分まで進んだら 0 にリセット (シームレスループ)
 */
function AutoFlowTrack({
  items,
  originalLength
}: {
  items: SlideLap[];
  originalLength: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const pauseUntil = useRef<number>(0);
  const ignoreScroll = useRef<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ユーザーが「動きの少ないモード」を選んでいるかチェック
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ループのコア: requestAnimationFrame で scrollLeft を増やしていく
  useEffect(() => {
    if (reducedMotion) return; // 動きを抑えたい人にはアニメーションしない
    const el = containerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const step = () => {
      const now = performance.now();
      // 一時停止中はカウントだけ続けて時間が来たら再開
      if (now < pauseUntil.current) {
        rafId.current = requestAnimationFrame(step);
        return;
      }

      // 「半周」 = track 幅の半分 = 1 セット分のアイテム幅
      const halfWidth = track.scrollWidth / 2;
      if (el.scrollLeft >= halfWidth) {
        // シームレスにループさせるため、scroll イベントを無視して位置だけ巻き戻す
        ignoreScroll.current = true;
        el.scrollLeft -= halfWidth;
        // 1 フレーム後にフラグを下ろす
        requestAnimationFrame(() => {
          ignoreScroll.current = false;
        });
      } else {
        ignoreScroll.current = true;
        el.scrollLeft += AUTO_SPEED_PX;
        requestAnimationFrame(() => {
          ignoreScroll.current = false;
        });
      }

      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion]);

  const pause = (extraMs: number = RESUME_DELAY_MS) => {
    pauseUntil.current = performance.now() + extraMs;
  };

  return (
    <div
      ref={containerRef}
      className="lap-slider-scroll"
      onMouseEnter={() => pause(99_999_999)} // ホバー中はずっと止める
      onMouseLeave={() => pause(300)} // 離れたら短い遅延で再開
      onTouchStart={() => pause(99_999_999)}
      onTouchEnd={() => pause(RESUME_DELAY_MS)}
      onWheel={() => pause(RESUME_DELAY_MS)}
      onPointerDown={() => pause(99_999_999)}
      onPointerUp={() => pause(RESUME_DELAY_MS)}
      onScroll={() => {
        // 自動スクロールによる scroll イベントは無視
        if (ignoreScroll.current) return;
        // ユーザーによる手動操作 → 短いポーズで自動再開
        pause(RESUME_DELAY_MS);
      }}
    >
      <div ref={trackRef} className="lap-slider-row">
        {items.map((l, i) => (
          <LapCard
            key={`${l.id}-${i}`}
            lap={l}
            ariaHidden={i >= originalLength}
          />
        ))}
      </div>
    </div>
  );
}

function LapCard({
  lap,
  ariaHidden
}: {
  lap: SlideLap;
  ariaHidden?: boolean;
}) {
  return (
    <Link
      href={`/laps/${lap.id}`}
      className="lap-slide-card"
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
    >
      <p className="text-xs text-zinc-500">
        {lap.circuits.name} · {lap.driven_at}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold lap-time tabular">
        {formatLapMs(lap.total_ms)}
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        @{lap.profiles.username} / {lap.cars.maker} {lap.cars.model}
      </p>
    </Link>
  );
}
