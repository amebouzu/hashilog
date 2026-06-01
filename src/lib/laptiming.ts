/**
 * ラップタイミングエンジン (フレームワーク非依存・移植可能)。
 *
 * GPS サンプルを 1 点ずつ addSample() に流し込むと、コントロールライン /
 * セクターラインの横切りを検出してラップ・セクターイベントを返す。
 * React (PWA) でも React Native でもそのまま使える純粋ロジック。
 */

import {
  crossingFraction,
  interpolateTime,
  type GpsSample,
  type TimingLine
} from "./geo";

export type TimingConfig = {
  /** スタート/フィニッシュライン */
  startFinish: TimingLine;
  /** セクターライン (任意・順序通り) */
  sectors?: TimingLine[];
};

export type LapEvent = {
  type: "lap";
  lapNumber: number;
  /** ラップタイム (ミリ秒) */
  durationMs: number;
  /** 確定したセクタータイム (ミリ秒) — セクター設定時のみ */
  sectorMs: number[];
  /** 横切り時刻 (epoch ミリ秒) */
  crossedAt: number;
};

export type SectorEvent = {
  type: "sector";
  sectorIndex: number; // 0-based
  splitMs: number; // ラップ開始からの経過
  crossedAt: number;
};

export type TimingEvent = LapEvent | SectorEvent;

/**
 * 連続する GPS サンプルからラップ/セクターを検出するエンジン。
 *
 * 使い方:
 *   const engine = new LapTimingEngine({ startFinish });
 *   for (const sample of stream) {
 *     const ev = engine.addSample(sample);
 *     if (ev?.type === "lap") { ... }
 *   }
 */
export class LapTimingEngine {
  private prev: GpsSample | null = null;
  private lapStartAt: number | null = null;
  private lapNumber = 0;
  private sectorSplits: number[] = [];
  private nextSectorIdx = 0;

  constructor(private config: TimingConfig) {}

  /** S/F ライン未設定時に後から設定する */
  setStartFinish(line: TimingLine) {
    this.config.startFinish = line;
  }

  setSectors(lines: TimingLine[]) {
    this.config.sectors = lines;
  }

  /** 現在計測中のラップが始まっているか */
  get isTiming(): boolean {
    return this.lapStartAt !== null;
  }

  /** 現在のラップ開始時刻 (なければ null) */
  get currentLapStart(): number | null {
    return this.lapStartAt;
  }

  /**
   * サンプルを追加。横切りを検出したらイベントを返す。
   * 1 サンプルで S/F とセクターの両方を跨ぐことは稀なので、
   * 優先的に S/F を判定し、無ければセクターを判定する。
   */
  addSample(s: GpsSample): TimingEvent | null {
    const prev = this.prev;
    this.prev = s;
    if (!prev) return null;

    const sf = this.config.startFinish;

    // --- S/F ライン横切り判定 ---
    const tSF = crossingFraction(prev, s, sf);
    if (tSF !== null) {
      const crossedAt = interpolateTime(prev, s, tSF);
      if (this.lapStartAt === null) {
        // 計測開始 (最初の通過)
        this.lapStartAt = crossedAt;
        this.sectorSplits = [];
        this.nextSectorIdx = 0;
        return null;
      }
      // ラップ確定
      const durationMs = crossedAt - this.lapStartAt;
      const ev: LapEvent = {
        type: "lap",
        lapNumber: ++this.lapNumber,
        durationMs,
        sectorMs: this.computeSectorMs(crossedAt),
        crossedAt
      };
      // 次ラップ開始
      this.lapStartAt = crossedAt;
      this.sectorSplits = [];
      this.nextSectorIdx = 0;
      return ev;
    }

    // --- セクターライン横切り判定 ---
    if (
      this.lapStartAt !== null &&
      this.config.sectors &&
      this.nextSectorIdx < this.config.sectors.length
    ) {
      const line = this.config.sectors[this.nextSectorIdx];
      const tS = crossingFraction(prev, s, line);
      if (tS !== null) {
        const crossedAt = interpolateTime(prev, s, tS);
        const splitMs = crossedAt - this.lapStartAt;
        this.sectorSplits.push(splitMs);
        const idx = this.nextSectorIdx;
        this.nextSectorIdx++;
        return {
          type: "sector",
          sectorIndex: idx,
          splitMs,
          crossedAt
        };
      }
    }

    return null;
  }

  /** ラップ確定時にセクタースプリットから各セクター区間タイムを算出 */
  private computeSectorMs(lapEndAt: number): number[] {
    if (!this.config.sectors || this.sectorSplits.length === 0) return [];
    const start = this.lapStartAt!;
    const points = [...this.sectorSplits.map((sp) => start + sp), lapEndAt];
    const result: number[] = [];
    let prevAbs = start;
    for (const abs of points) {
      result.push(abs - prevAbs);
      prevAbs = abs;
    }
    return result;
  }

  reset() {
    this.prev = null;
    this.lapStartAt = null;
    this.lapNumber = 0;
    this.sectorSplits = [];
    this.nextSectorIdx = 0;
  }
}

/** ミリ秒を "M:SS.mmm" に整形 */
export function formatMs(ms: number): string {
  if (ms == null || !isFinite(ms)) return "--:--.---";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mmm = Math.floor(ms % 1000);
  return `${m}:${s.toString().padStart(2, "0")}.${mmm
    .toString()
    .padStart(3, "0")}`;
}
