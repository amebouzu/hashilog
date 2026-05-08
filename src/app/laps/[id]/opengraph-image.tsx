/**
 * ラップ詳細ページの動的 OG 画像 (1200×630).
 * X / Threads / Facebook / LINE 等で URL がシェアされた時に
 * 「タイム + サーキット名 + 車種 + ユーザー名」が大判で表示される。
 *
 * Next.js 14 の File-based Open Graph Image API を使用 (next/og)。
 * Edge Runtime で 1 リクエストごとに PNG をストリーミング生成する。
 */

import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { formatLapMs } from "@/lib/types";

export const runtime = "edge";
export const alt = "走ログ ラップタイム";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og (Satori) は TTF/OTF のみ対応。Google Fonts は UA によって woff2 を返してくるため、
// jsDelivr 上の @fontsource/noto-sans-jp が公開している TTF を直接フェッチする。
async function loadJpFont(weight: 400 | 700) {
  const url = `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.1.0/files/noto-sans-jp-japanese-${weight}-normal.ttf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch Japanese font (${res.status})`);
  return await res.arrayBuffer();
}

export default async function LapOgImage({
  params
}: {
  params: { id: string };
}) {
  // ラップ情報の取得は best-effort。失敗しても OG 画像自体は生成し続ける。
  let lap: any = null;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("lap_times")
      .select(
        `total_ms, driven_at,
         profiles(username),
         cars(maker, model),
         circuits(name)`
      )
      .eq("id", params.id)
      .maybeSingle();
    lap = data;
  } catch (e) {
    console.warn("OG image: failed to load lap", e);
  }

  // データが見つからない時は静的 OG にフォールバックさせるべく、最小情報で生成
  const time = lap ? formatLapMs(lap.total_ms) : "走ログ";
  const circuit = lap?.circuits?.name ?? "サーキットタイム共有";
  const carMaker = lap?.cars?.maker ?? "";
  const carModel = lap?.cars?.model ?? "";
  const carLabel = [carMaker, carModel].filter(Boolean).join(" ") || "Hashilog";
  const username = lap?.profiles?.username
    ? `@${lap.profiles.username}`
    : "hashilog.jp";

  const [fontRegular, fontBold] = await Promise.all([
    loadJpFont(400),
    loadJpFont(700)
  ]).catch(() => [undefined, undefined]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#18181b",
          color: "#fafafa",
          padding: "60px 80px",
          position: "relative"
        }}
      >
        {/* 左端の赤帯 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 14,
            height: "100%",
            background: "#e10600"
          }}
        />

        {/* 上部: ラベル + サーキット名 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 12,
              height: 12,
              background: "#e10600"
            }}
          />
          <span
            style={{
              fontSize: 22,
              color: "#a1a1aa",
              letterSpacing: 4,
              fontWeight: 700
            }}
          >
            HASHILOG / LAP TIME
          </span>
        </div>
        <div
          style={{
            fontSize: 38,
            color: "#fafafa",
            marginTop: 18,
            fontWeight: 700,
            display: "flex"
          }}
        >
          {circuit}
        </div>

        {/* 中央: 大きなタイム */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 30,
            color: "#e10600",
            fontWeight: 700,
            fontFamily: "monospace",
            lineHeight: 1
          }}
        >
          <span style={{ fontSize: 200 }}>{time}</span>
        </div>

        {/* 中央下: 車種 */}
        <div
          style={{
            fontSize: 36,
            color: "#fafafa",
            marginTop: 20,
            fontWeight: 700,
            display: "flex"
          }}
        >
          {carLabel}
        </div>

        {/* フッター: ユーザー名 + サイト URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            color: "#a1a1aa",
            fontSize: 24
          }}
        >
          <span>{username}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 8, height: 8, background: "#e10600" }} />
            hashilog.jp
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts:
        fontRegular && fontBold
          ? [
              {
                name: "Noto Sans JP",
                data: fontRegular as ArrayBuffer,
                weight: 400 as const,
                style: "normal" as const
              },
              {
                name: "Noto Sans JP",
                data: fontBold as ArrayBuffer,
                weight: 700 as const,
                style: "normal" as const
              }
            ]
          : undefined
    }
  );
}
