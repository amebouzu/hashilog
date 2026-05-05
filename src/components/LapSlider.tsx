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

export function LapSlider({ laps }: { laps: SlideLap[] }) {
  if (!laps || laps.length === 0) return null;
  // duplicate for seamless loop
  const items = [...laps, ...laps];

  return (
    <section>
      <div className="mb-2 flex items-end justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-racing-red align-middle" />
          最新のタイム投稿
        </h2>
        <span className="text-xs text-zinc-500">
          マウスを乗せると停止
        </span>
      </div>
      <div className="lap-slider">
        <div className="lap-slider-track">
          {items.map((l, i) => (
            <Link
              key={`${l.id}-${i}`}
              href={`/laps/${l.id}`}
              className="lap-slide-card"
              aria-hidden={i >= laps.length || undefined}
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
