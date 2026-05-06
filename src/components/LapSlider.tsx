import Link from "next/link";
import { formatLapMs } from "@/lib/types";

type SlideLap = {
  id: string;
  total_ms: number;
  driven_at: string;
  profiles: { username: string };
  cars: { maker: string; model: string };
  circuits: { name: string };
};

// マーキー（無限ループスクロール）に必要な最小件数
// これ未満は複製せず静止表示にする (重複表示防止)
const MARQUEE_MIN = 5;

export function LapSlider({ laps }: { laps: SlideLap[] }) {
  if (!laps || laps.length === 0) return null;

  const shouldLoop = laps.length >= MARQUEE_MIN;
  // ループ表示する時だけ seamless loop 用に複製
  const items = shouldLoop ? [...laps, ...laps] : laps;

  return (
    <section>
      <div className="mb-2 flex items-end justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-racing-red align-middle" />
          最新のタイム投稿
        </h2>
        {shouldLoop && (
          <span className="text-xs text-zinc-500">マウスを乗せると停止</span>
        )}
      </div>
      <div className="lap-slider">
        <div className={shouldLoop ? "lap-slider-track" : "lap-slider-static"}>
          {items.map((l, i) => (
            <Link
              key={`${l.id}-${i}`}
              href={`/laps/${l.id}`}
              className="lap-slide-card"
              aria-hidden={shouldLoop && i >= laps.length ? true : undefined}
            >
              <p className="text-xs text-zinc-500">
                {l.circuits.name} · {l.driven_at}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold lap-time tabular">
                {formatLapMs(l.total_ms)}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                @{l.profiles.username} / {l.cars.maker} {l.cars.model}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
