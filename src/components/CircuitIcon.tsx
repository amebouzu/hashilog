import Link from "next/link";

type IconStyle = { color: string; path: string };

// 各サーキットのレイアウトを 64×32 viewBox に簡略化したアイコン用パス。
// Wikipedia のレイアウト図を参照し、特徴的な形状を抽出している。
const ICONS: Record<string, IconStyle> = {
  // ===== 国際サーキット =====
  fuji: {
    color: "#dc2626",
    path: "M6 26 L48 26 C58 26 60 18 52 14 C44 10 40 18 32 16 C22 14 18 8 12 12 C6 16 4 22 6 26 Z"
  },
  suzuka: {
    color: "#0284c7",
    path: "M8 10 C8 4 20 4 26 10 C32 16 38 22 48 22 C58 22 58 28 50 28 C40 28 32 22 26 16 C20 10 14 14 12 18 C10 22 8 16 8 10 Z"
  },
  motegi: {
    color: "#16a34a",
    path: "M8 24 L20 24 L24 16 L36 16 L40 24 L56 24 L56 12 L44 8 L20 8 L8 14 Z"
  },
  okayama: {
    color: "#7c3aed",
    path: "M10 22 C6 14 14 6 26 8 C40 10 50 12 56 18 C60 22 56 26 50 24 C44 22 40 18 32 20 C24 22 14 28 10 22 Z"
  },
  autopolis: {
    color: "#ea580c",
    path: "M8 16 C10 6 24 6 30 12 C38 18 44 8 52 12 C60 16 56 26 46 24 C36 22 28 26 20 24 C10 22 6 22 8 16 Z"
  },
  "sportsland-sugo": {
    color: "#db2777",
    path: "M8 22 C12 8 22 24 30 16 C38 8 46 24 56 10 C58 8 60 14 56 20 C50 28 40 22 32 24 C24 26 14 30 8 22 Z"
  },

  // ===== その他 =====
  central: {
    color: "#0d9488",
    path: "M10 20 C6 10 18 6 28 10 C38 14 46 8 54 14 C60 18 54 26 44 24 C34 22 26 26 18 24 C12 22 10 22 10 20 Z"
  },
  sodegaura: {
    color: "#65a30d",
    path: "M10 18 C8 8 22 6 30 12 C40 18 48 8 54 14 C60 20 50 26 40 22 C30 18 20 28 12 24 C8 22 10 20 10 18 Z"
  },
  tokachi: {
    color: "#9333ea",
    path: "M10 16 C10 6 30 6 40 10 C52 14 58 14 56 20 C54 26 40 26 28 24 C16 22 10 24 10 16 Z"
  },
  "tsukuba-2000": {
    color: "#be123c",
    path: "M14 16 C14 8 22 8 26 12 L40 14 C44 10 52 10 52 16 C52 22 44 22 40 18 L26 20 C22 24 14 24 14 16 Z"
  },
  "tsukuba-1000": {
    color: "#1e40af",
    path: "M12 16 C12 8 22 8 32 8 C42 8 52 8 52 16 C52 24 42 24 32 24 C22 24 12 24 12 16 Z"
  },
  "suzuka-twin": {
    color: "#c2410c",
    path: "M6 16 C6 8 14 8 18 12 C22 16 22 20 16 22 C8 24 6 22 6 16 Z M28 16 C28 8 40 6 50 10 C60 14 58 24 48 24 C36 24 28 22 28 16 Z"
  },
  "ebisu-east": {
    color: "#0891b2",
    path: "M10 22 C6 14 14 6 24 10 C34 14 38 6 48 10 C58 14 56 24 46 24 C36 24 28 28 20 26 C14 24 12 24 10 22 Z"
  },
  "ebisu-west": {
    color: "#84cc16",
    path: "M8 18 C8 8 22 6 28 12 C32 16 30 22 36 22 C44 22 48 12 56 16 C62 18 58 26 48 26 C36 26 24 28 16 26 C10 24 8 22 8 18 Z"
  },
  "sportsland-yamanashi": {
    color: "#525252",
    path: "M10 16 C10 8 22 6 32 10 C44 14 54 8 56 16 C58 24 44 26 32 22 C22 18 10 24 10 16 Z"
  },
  "spa-nishiura": {
    color: "#a16207",
    path: "M8 16 C8 8 18 6 26 12 C32 16 38 8 46 10 C56 12 60 22 50 24 C40 26 30 22 22 24 C12 26 8 22 8 16 Z"
  },
  mihama: {
    color: "#7c2d12",
    path: "M12 18 C8 10 22 6 30 10 C38 14 50 8 54 16 C58 24 42 26 32 22 C22 18 14 24 12 18 Z"
  },
  kouta: {
    color: "#0d9488",
    path: "M10 20 C8 10 20 8 28 12 C36 16 46 10 54 14 C60 18 56 24 46 24 C36 24 26 28 18 24 C12 22 10 22 10 20 Z"
  },
  nakayama: {
    color: "#65a30d",
    path: "M10 18 C8 8 24 8 30 14 C36 20 48 10 54 18 C58 24 44 26 32 22 C22 18 12 24 10 18 Z"
  },
  tsukude: {
    color: "#9333ea",
    path: "M10 16 C8 8 22 6 30 12 C36 16 46 10 52 16 C58 22 48 26 38 22 C28 18 14 24 10 16 Z"
  },
  "mobara-west": {
    color: "#be123c",
    path: "M8 16 C8 8 18 8 22 12 C26 16 24 22 16 22 C8 22 6 22 8 16 Z"
  },
  "mobara-east": {
    color: "#1e40af",
    path: "M30 16 C30 8 42 6 50 10 C58 14 60 22 50 24 C40 24 30 24 30 16 Z"
  },
  nikko: {
    color: "#525252",
    path: "M12 16 C12 8 24 8 32 8 C40 8 52 8 52 16 C52 24 40 24 32 24 C24 24 12 24 12 16 Z"
  },
  honjo: {
    color: "#a16207",
    path: "M14 16 C14 10 24 10 32 10 C40 10 50 10 50 16 C50 22 40 22 32 22 C24 22 14 22 14 16 Z"
  },
  "fuji-short": {
    color: "#dc2626",
    path: "M10 22 L40 22 C50 22 52 14 46 12 C38 10 32 16 24 14 C16 12 10 14 10 22 Z"
  }
};

const DEFAULT: IconStyle = {
  color: "#71717a",
  path: "M8 16 C8 8 18 6 32 8 C46 10 56 8 56 16 C56 24 46 26 32 24 C18 22 8 24 8 16 Z"
};

function shortName(name: string) {
  return name
    .replace("サーキット", "")
    .replace("スピードウェイ", "")
    .replace("国際", "")
    .replace("モビリティリゾート", "")
    .replace("スポーツランド", "")
    .replace("フォレストレースウェイ", "")
    .replace("モータースポーツランド", "MSL")
    .replace("フェスティカ", "")
    .trim();
}

export function CircuitIcon({
  slug,
  name,
  prefecture
}: {
  slug: string;
  name: string;
  prefecture: string;
}) {
  const style = ICONS[slug] ?? DEFAULT;

  return (
    <Link href={`/circuits/${slug}`} className="circuit-icon">
      <span className="circuit-icon-mark">
        <svg viewBox="0 0 64 32">
          <path
            d={style.path}
            stroke={style.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      <span className="circuit-icon-name">{shortName(name)}</span>
      <span className="circuit-icon-pref">{prefecture}</span>
    </Link>
  );
}
