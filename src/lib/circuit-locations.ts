/**
 * サーキットの代表座標 (中心付近)。
 * GPSロガーで「今どのサーキットにいるか」を自動判定するために使う。
 *
 * ここで必要な精度は「最寄りサーキットを1つに絞れる」レベルで十分。
 * 各サーキットは通常数十km以上離れているため、数百m〜数km の誤差は
 * 自動判定に影響しない (コントロールラインの m 単位精度とは別物)。
 *
 * 座標未登録のサーキットは自動判定の対象外 (手動選択にフォールバック)。
 * 同一敷地内のコース (ツイン/ショート等) は最寄り判定では区別できないため、
 * 検出後にユーザーが手動で正しいコースへ切り替えられるようにしている。
 *
 * 出典: 各サーキット公式情報・一般的な地図情報をもとにした概算値 (要現地校正)。
 */

export type CircuitCoord = { lat: number; lng: number };

const LOCATIONS: Record<string, CircuitCoord> = {
  fuji: { lat: 35.3717, lng: 138.9269 },
  "fuji-short": { lat: 35.3717, lng: 138.9269 },
  suzuka: { lat: 34.8431, lng: 136.5407 },
  "suzuka-twin": { lat: 34.83, lng: 136.46 },
  motegi: { lat: 36.5316, lng: 140.2272 },
  okayama: { lat: 34.915, lng: 134.2206 },
  autopolis: { lat: 33.0272, lng: 131.0642 },
  "sportsland-sugo": { lat: 38.1431, lng: 140.7758 },
  central: { lat: 35.0, lng: 134.87 },
  sodegaura: { lat: 35.4123, lng: 140.0102 },
  tokachi: { lat: 42.8762, lng: 143.4497 },
  "tsukuba-2000": { lat: 36.1519, lng: 139.9082 },
  "tsukuba-1000": { lat: 36.1519, lng: 139.9082 },
  "ebisu-east": { lat: 37.6486, lng: 140.4922 },
  "ebisu-west": { lat: 37.6486, lng: 140.4922 },
  mihama: { lat: 34.7785, lng: 136.9085 },
  kouta: { lat: 34.8517, lng: 137.1622 },
  "mobara-west": { lat: 35.4231, lng: 140.3036 },
  "mobara-east": { lat: 35.4231, lng: 140.3036 },
  "spa-nishiura": { lat: 34.7997, lng: 137.0556 },
  tsukude: { lat: 34.9847, lng: 137.4622 },
  nakayama: { lat: 34.9514, lng: 134.1817 },
  nikko: { lat: 36.6889, lng: 139.685 },
  honjo: { lat: 36.2078, lng: 139.1758 },
  "sportsland-yamanashi": { lat: 35.55, lng: 138.55 }
};

const R_EARTH = 6371000;
function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function distanceM(a: CircuitCoord, b: CircuitCoord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * 現在地から最も近いサーキットの slug を返す。
 * maxKm 以内に該当が無ければ null (= 圏外、手動選択へ)。
 */
export function nearestCircuitSlug(
  lat: number,
  lng: number,
  maxKm = 10
): { slug: string; distanceKm: number } | null {
  let best: { slug: string; distanceKm: number } | null = null;
  for (const [slug, coord] of Object.entries(LOCATIONS)) {
    const km = distanceM({ lat, lng }, coord) / 1000;
    if (km <= maxKm && (!best || km < best.distanceKm)) {
      best = { slug, distanceKm: km };
    }
  }
  return best;
}

export function getCircuitCoord(slug: string): CircuitCoord | null {
  return LOCATIONS[slug] ?? null;
}
