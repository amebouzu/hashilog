/**
 * サーキットごとの計測ライン (コントロールライン / セクターライン) の予定義データ。
 *
 * ここに座標があるサーキットは、走ログロガーで「ライン設定」操作なしに
 * すぐ計測を開始できる。未定義のサーキットは、走行中に
 * 「コントロールラインを通過した瞬間にタップ」して動的に設定する。
 *
 * 座標は現地での実測・キャリブレーションで精度が上がる。Phase 1 では
 * 「通過時タップ設定」を主たる手段とし、ここは順次充実させていく方針。
 *
 * TimingLine: スタート/フィニッシュ地点を横断する線分を 2 点で定義する。
 */

import type { TimingConfig } from "./laptiming";

// slug -> 計測設定
const TIMING: Record<string, TimingConfig> = {
  // 例: 未キャリブレーションのため現状は空。
  // 実測座標が用意でき次第、下記のように追加する。
  //
  // "tsukuba-2000": {
  //   startFinish: { lat1: 36.1530, lng1: 139.9080, lat2: 36.1532, lng2: 139.9082 },
  //   sectors: [
  //     { lat1: ..., lng1: ..., lat2: ..., lng2: ... },
  //   ]
  // },
};

/**
 * 予定義の計測設定を返す。無ければ null (= 通過時タップで設定)。
 */
export function getCircuitTiming(slug: string): TimingConfig | null {
  return TIMING[slug] ?? null;
}

/** 予定義ラインを持つサーキットの slug 一覧 */
export function circuitsWithTiming(): string[] {
  return Object.keys(TIMING);
}
