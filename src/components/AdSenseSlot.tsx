"use client";

import { useEffect } from "react";
import { getAdsenseClient } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Google AdSense ディスプレイ広告枠 (Client Component).
 *
 * 既存の AdSlot.tsx (DB ベースの汎用 HTML 枠) とは別物。
 * AdSense は <ins class="adsbygoogle"> + adsbygoogle.push({}) の組合せが必須なので
 * クライアント側で push を実行するこのコンポーネントを使う。
 *
 * 使い方:
 *   <AdSenseSlot slot="1234567890" />                  // 自動レイアウト (推奨)
 *   <AdSenseSlot slot="1234567890" format="rectangle" />
 *
 * 環境変数 NEXT_PUBLIC_ADSENSE_CLIENT (例: ca-pub-1234567890123456) が
 * 未設定の場合は何もレンダリングしない。
 * これによりローカル開発や PR プレビューには広告が出ない。
 */
export function AdSenseSlot({
  slot,
  format = "auto",
  responsive = true,
  style,
  className = ""
}: {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const client = getAdsenseClient();

  useEffect(() => {
    if (!client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 二重 push などはサイレントに無視
      console.warn("AdSense push failed", e);
    }
  }, [client, slot]);

  if (!client) return null;

  return (
    <div className={className} aria-label="広告">
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
