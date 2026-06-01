/**
 * GPS ラップタイミング用のジオメトリ純粋関数群。
 *
 * フレームワーク非依存・副作用なしで書いており、将来 React Native などに
 * そのまま移植できる。緯度経度を平面座標とみなして計算するが、
 * コントロールライン横切り判定のような数十m スケールの局所計算では
 * 球面歪みは無視できる。
 */

export type LatLng = { lat: number; lng: number };

/** GPS サンプル (1点) */
export type GpsSample = {
  t: number; // epoch ミリ秒
  lat: number;
  lng: number;
  speed?: number | null; // m/s (端末が返せば)
  accuracy?: number | null; // 水平精度 m
};

/** コントロールライン (2点で定義する線分) */
export type TimingLine = {
  lat1: number;
  lng1: number;
  lat2: number;
  lng2: number;
};

const R_EARTH = 6371000; // m

/** 2点間の距離 (Haversine, メートル) */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * 移動セグメント p1->p2 がライン a-b を横切るか判定し、
 * 横切る場合は p1->p2 上の交点パラメータ t (0..1) を返す。横切らなければ null。
 *
 * 平面 (lng=x, lat=y) として線分交差を解く。
 */
export function crossingFraction(
  p1: LatLng,
  p2: LatLng,
  line: TimingLine
): number | null {
  const rx = p2.lng - p1.lng;
  const ry = p2.lat - p1.lat;
  const sx = line.lng2 - line.lng1;
  const sy = line.lat2 - line.lat1;

  const denom = rx * sy - ry * sx;
  if (denom === 0) return null; // 平行

  const qpx = line.lng1 - p1.lng;
  const qpy = line.lat1 - p1.lat;

  const t = (qpx * sy - qpy * sx) / denom; // p1->p2 上
  const u = (qpx * ry - qpy * rx) / denom; // a->b 上

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return t;
  return null;
}

/**
 * 2サンプル間を t (0..1) で線形補間したタイムスタンプを返す。
 * GPS は通常 1Hz なので、横切り時刻をサブサンプル精度で求めるのに使う。
 */
export function interpolateTime(
  s1: GpsSample,
  s2: GpsSample,
  t: number
): number {
  return s1.t + (s2.t - s1.t) * t;
}

/**
 * ある地点で、進行方向ベクトルに対して垂直なコントロールラインを生成する。
 * 「コントロールラインを通過した瞬間にボタンを押す」方式でラインを設定するのに使う。
 *
 * @param pos 現在地
 * @param heading 進行方向ベクトル (前サンプル -> 現サンプルの差分など)
 * @param halfWidthMeters ライン半幅 (中心から左右へ伸ばす長さ)
 */
export function perpendicularLine(
  pos: LatLng,
  heading: { dLat: number; dLng: number },
  halfWidthMeters = 20
): TimingLine {
  // 進行方向を正規化 (緯度補正込みで概算)
  const latScale = 111320; // 1度あたり m (緯度方向)
  const lngScale = 111320 * Math.cos(toRad(pos.lat));

  // heading を m 単位に
  const hx = heading.dLng * lngScale;
  const hy = heading.dLat * latScale;
  const len = Math.hypot(hx, hy) || 1;
  const ux = hx / len;
  const uy = hy / len;

  // 垂直ベクトル (-uy, ux)
  const px = -uy;
  const py = ux;

  // 半幅分を緯度経度に戻す
  const dLat = (py * halfWidthMeters) / latScale;
  const dLng = (px * halfWidthMeters) / lngScale;

  return {
    lat1: pos.lat + dLat,
    lng1: pos.lng + dLng,
    lat2: pos.lat - dLat,
    lng2: pos.lng - dLng
  };
}
