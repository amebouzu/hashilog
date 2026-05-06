import Link from "next/link";
import { formatLapMs } from "@/lib/types";

export type LapRowData = {
  id: string;
  rank: number;
  total_ms: number;
  top_speed_kmh: number | null;
  track_condition: string;
  driven_at: string;
  tire_size?: string | null;          // 旧フィールド (互換)
  tire_size_front?: string | null;
  tire_size_rear?: string | null;
  profiles: {
    username: string;
    avatar_url?: string | null;
    display_name?: string | null;
  };
  cars: { name?: string | null; maker: string; model: string };
  circuits?: { name: string; slug: string } | null;
  tires?: { brand: string; model: string } | null;
  tires_front?: { brand: string; model: string } | null;
  tires_rear?: { brand: string; model: string } | null;
};

/**
 * 行内に置く小さな円形アバター。avatar_url が無ければ username の先頭1文字を
 * グレー丸に表示するフォールバック。
 */
function InlineAvatar({
  url,
  username,
  size = 18
}: {
  url?: string | null;
  username: string;
  size?: number;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`@${username}`}
        width={size}
        height={size}
        className="inline-block flex-shrink-0 rounded-full object-cover align-middle"
        style={{ width: size, height: size }}
      />
    );
  }
  const fallback = username.slice(0, 1).toUpperCase();
  return (
    <span
      aria-hidden
      className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-zinc-200 align-middle text-[10px] font-semibold text-zinc-600"
      style={{ width: size, height: size }}
    >
      {fallback}
    </span>
  );
}

function tireSizeInline(l: LapRowData): string {
  const front = l.tire_size_front ?? l.tire_size ?? null;
  const rear = l.tire_size_rear ?? null;
  if (!front && !rear) return "-";
  if (!rear || rear === front) return front ?? "-";
  return `F:${front} / R:${rear}`;
}

function tireSizeStacked(l: LapRowData): { front: string; rear: string | null } {
  const front = l.tire_size_front ?? l.tire_size ?? "-";
  const rear = l.tire_size_rear ?? null;
  if (!rear || rear === front) return { front, rear: null };
  return { front, rear };
}

/**
 * モバイル: カードレイアウト (タイム大、その他は積み重ね)
 * デスクトップ: 6列グリッド (sm: 以上)
 */
export function LapRow({ lap }: { lap: LapRowData }) {
  const carLabel = `${lap.cars.maker} ${lap.cars.model}`;
  const circuitLabel = lap.circuits?.name ?? null;

  // フロント/リアタイヤを最優先、無ければ旧 tires にフォールバック
  const frontTire = lap.tires_front ?? lap.tires ?? null;
  const rearTire = lap.tires_rear ?? lap.tires ?? null;
  const sameTire =
    (frontTire?.brand ?? null) === (rearTire?.brand ?? null) &&
    (frontTire?.model ?? null) === (rearTire?.model ?? null);

  const brand = sameTire
    ? frontTire?.brand ?? "-"
    : `F:${frontTire?.brand ?? "-"} / R:${rearTire?.brand ?? "-"}`;
  const model = sameTire
    ? frontTire?.model ?? "-"
    : `F:${frontTire?.model ?? "-"} / R:${rearTire?.model ?? "-"}`;

  const sizeInline = tireSizeInline(lap);
  const sizeStacked = tireSizeStacked(lap);
  const speed = lap.top_speed_kmh ? `${lap.top_speed_kmh} km/h` : "-";
  const time = formatLapMs(lap.total_ms);

  return (
    <li className="px-4 py-3">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-zinc-400 tabular">#{lap.rank}</span>
          <Link
            href={`/laps/${lap.id}`}
            className="font-mono text-2xl font-bold lap-time tabular"
          >
            {time}
          </Link>
          <span className="ml-auto text-xs text-zinc-500">{speed}</span>
        </div>
        <p className="mt-1 text-sm text-zinc-800">
          {circuitLabel ? (
            <>
              {lap.circuits && (
                <Link
                  href={`/circuits/${lap.circuits.slug}`}
                  className="hover:text-zinc-900"
                >
                  {circuitLabel}
                </Link>
              )}
              <span className="text-zinc-400"> · </span>
            </>
          ) : null}
          {carLabel}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
          <Link
            href={`/u/${lap.profiles.username}`}
            className="flex items-center gap-1 hover:text-zinc-800"
          >
            <InlineAvatar
              url={lap.profiles.avatar_url}
              username={lap.profiles.username}
              size={18}
            />
            <span>@{lap.profiles.username}</span>
          </Link>
          <span>· {lap.track_condition} · {lap.driven_at}</span>
        </p>
        <p className="mt-1 text-xs">
          <span className="font-semibold text-zinc-700">{brand}</span>
          <span className="text-zinc-400"> · </span>
          <span className="text-zinc-800">{model}</span>
          <span className="text-zinc-400"> · </span>
          <span className="font-mono text-zinc-500">{sizeInline}</span>
        </p>
      </div>

      {/* Desktop */}
      <div className="hidden grid-cols-[40px_120px_1fr_90px_110px_70px] items-center gap-3 sm:grid">
        <span className="text-sm text-zinc-400 tabular">#{lap.rank}</span>
        <Link
          href={`/laps/${lap.id}`}
          className="font-mono text-xl font-bold lap-time tabular"
        >
          {time}
        </Link>
        <div>
          <p className="text-sm text-zinc-800">
            {lap.circuits && (
              <>
                <Link
                  href={`/circuits/${lap.circuits.slug}`}
                  className="hover:text-zinc-900"
                >
                  {circuitLabel}
                </Link>
                <span className="text-zinc-400"> · </span>
              </>
            )}
            {carLabel}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <Link
              href={`/u/${lap.profiles.username}`}
              className="flex items-center gap-1 hover:text-zinc-800"
            >
              <InlineAvatar
                url={lap.profiles.avatar_url}
                username={lap.profiles.username}
                size={18}
              />
              <span>@{lap.profiles.username}</span>
            </Link>
            <span>· {lap.track_condition} · {lap.driven_at}</span>
          </p>
        </div>
        <span className="text-xs font-semibold text-zinc-700">{brand}</span>
        <div className="text-xs">
          <p className="text-zinc-800">{model}</p>
          <p className="font-mono text-zinc-500">
            {sizeStacked.rear
              ? `F:${sizeStacked.front} / R:${sizeStacked.rear}`
              : sizeStacked.front}
          </p>
        </div>
        <span className="text-right text-xs text-zinc-500">{speed}</span>
      </div>
    </li>
  );
}

export function LapTableHeader() {
  return (
    <div className="hidden grid-cols-[40px_120px_1fr_90px_110px_70px] gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:grid">
      <span>順位</span>
      <span>タイム</span>
      <span>サーキット / 車種</span>
      <span>ブランド</span>
      <span>銘柄 / サイズ</span>
      <span className="text-right">最高速</span>
    </div>
  );
}
