export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  prefecture: string | null;
  sns_x: string | null;
  sns_instagram: string | null;
  sns_threads: string | null;
  sns_youtube: string | null;
  sns_facebook: string | null;
  sns_tiktok: string | null;
  website_url: string | null;
  created_at: string;
};

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
] as const;

export type Prefecture = (typeof PREFECTURES)[number];

/** SNS のユーザー名から URL を生成 */
export function snsUrl(
  kind: "x" | "instagram" | "threads" | "facebook" | "youtube" | "tiktok",
  handle: string
): string {
  const h = handle.replace(/^@/, "").trim();
  switch (kind) {
    case "x": return `https://x.com/${h}`;
    case "instagram": return `https://instagram.com/${h}`;
    case "threads": return `https://www.threads.net/@${h}`;
    case "facebook": return `https://www.facebook.com/${h}`;
    case "youtube":
      // @handle 形式 / channel/UCXXX 形式 / 旧 user/ どちらにも対応
      return h.startsWith("UC") || h.includes("/")
        ? `https://www.youtube.com/${h}`
        : `https://www.youtube.com/@${h}`;
    case "tiktok": return `https://www.tiktok.com/@${h}`;
  }
}

export type Car = {
  id: string;
  user_id: string;
  name: string;
  maker: string;
  model: string;
  year: number | null;
  color: string | null;
  cover_url: string | null;
  description: string | null;
  mods_suspension: string | null;
  mods_engine: string | null;
  mods_exterior: string | null;
  mods_interior: string | null;
  mods_brake: string | null;
  mods_drivetrain: string | null;
  power_ps: number | null;
  weight_kg: number | null;
  created_at: string;
};

export type CarPhoto = {
  id: string;
  car_id: string;
  storage_path: string;
  caption: string | null;
  position: number;
  created_at: string;
};

export type Circuit = {
  id: string;
  slug: string;
  name: string;
  prefecture: string;
  length_m: number | null;
  sectors: number;
  description: string | null;
  features: string[] | null;
  famous_corners: string[] | null;
  official_url: string | null;
  is_published: boolean;
  updated_at: string;
};

export type CircuitStaff = {
  id: string;
  user_id: string;
  circuit_id: string;
  role: "editor" | "admin";
  created_at: string;
};

export type CircuitEvent = {
  id: string;
  circuit_id: string;
  event_type: "session" | "event" | "race" | "news";
  title: string;
  body: string | null;
  starts_at: string | null;
  ends_at: string | null;
  date_label: string | null;
  external_url: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const EVENT_TYPE_LABEL: Record<CircuitEvent["event_type"], string> = {
  session: "走行会",
  event: "イベント",
  race: "レース",
  news: "お知らせ"
};

export type Tire = {
  id: string;
  brand: string;
  model: string;
  /** @deprecated カテゴリ分類は廃止。null 許容 */
  category?: "street" | "sports" | "semi_slick" | "slick" | "rain" | null;
};

export type LapTime = {
  id: string;
  user_id: string;
  car_id: string;
  circuit_id: string;
  tire_id: string | null;
  tire_size: string | null;       // 互換用 (旧)
  tire_size_front: string | null;
  tire_size_rear: string | null;
  total_ms: number;
  sector1_ms: number | null;
  sector2_ms: number | null;
  sector3_ms: number | null;
  sector4_ms: number | null;
  top_speed_kmh: number | null;
  weather:
    | "sunny"
    | "cloudy"
    | "rain"
    | "heavy_rain"
    | "snow"
    | "mixed";
  track_condition: "dry" | "damp" | "wet";
  air_temp_c: number | null;
  track_temp_c: number | null;
  driven_at: string;
  note: string | null;
  created_at: string;
};

export type LapPhoto = {
  id: string;
  lap_time_id: string;
  storage_path: string;
  caption: string | null;
};

export const WEATHER_LABEL: Record<LapTime["weather"], string> = {
  sunny: "晴れ",
  cloudy: "曇り",
  rain: "雨",
  heavy_rain: "大雨",
  snow: "雪",
  mixed: "変わりやすい"
};

export const TRACK_LABEL: Record<LapTime["track_condition"], string> = {
  dry: "ドライ",
  damp: "ハーフウェット",
  wet: "ウェット"
};


export function formatLapMs(ms: number): string {
  if (ms == null || Number.isNaN(ms)) return "--:--.---";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${millis
    .toString()
    .padStart(3, "0")}`;
}

export function parseLapToMs(input: string): number | null {
  // accepts "1:23.456" / "1.23.456" / "83.456"
  const trimmed = input.trim();
  if (!trimmed) return null;
  const colon = trimmed.match(/^(\d+):(\d{1,2})\.(\d{1,3})$/);
  if (colon) {
    const [, m, s, ms] = colon;
    return (
      parseInt(m, 10) * 60000 +
      parseInt(s, 10) * 1000 +
      parseInt(ms.padEnd(3, "0"), 10)
    );
  }
  const sec = trimmed.match(/^(\d+)\.(\d{1,3})$/);
  if (sec) {
    const [, s, ms] = sec;
    return parseInt(s, 10) * 1000 + parseInt(ms.padEnd(3, "0"), 10);
  }
  const onlyInt = trimmed.match(/^\d+$/);
  if (onlyInt) return parseInt(trimmed, 10) * 1000;
  return null;
}
