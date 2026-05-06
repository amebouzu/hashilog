/**
 * JSON-LD 構造化データ (Schema.org)
 * Google や SNS のリッチスニペット表示用
 */

export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * サイト全体の Organization スキーマ (layout.tsx で1度描画)
 */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "走ログ",
        alternateName: "Hashilog",
        url: SITE,
        logo: `${SITE}/logo.png`,
        description:
          "サーキット走行のラップタイム共有サービス。日本のサーキットで刻んだタイムを愛車情報と一緒に記録・共有できます。",
        sameAs: []
      }}
    />
  );
}

/**
 * サーキット紹介ページの Place スキーマ
 */
export function CircuitSchema({
  name,
  description,
  prefecture,
  url,
  officialUrl,
  imageUrl
}: {
  name: string;
  description?: string | null;
  prefecture: string;
  url: string;
  officialUrl?: string | null;
  imageUrl?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Place",
        name,
        ...(description && { description }),
        url,
        ...(officialUrl && { sameAs: officialUrl }),
        ...(imageUrl && { image: imageUrl }),
        address: {
          "@type": "PostalAddress",
          addressRegion: prefecture,
          addressCountry: "JP"
        }
      }}
    />
  );
}

/**
 * ラップタイム詳細ページの SportsEvent スキーマ
 */
export function LapTimeSchema({
  url,
  circuitName,
  driverName,
  carLabel,
  totalSeconds,
  drivenAt
}: {
  url: string;
  circuitName: string;
  driverName: string;
  carLabel: string;
  totalSeconds: number;
  drivenAt: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `${carLabel} @ ${circuitName} - ${totalSeconds.toFixed(3)}秒`,
        description: `走ログに投稿された ${driverName} の ${carLabel} によるラップタイム。`,
        url,
        startDate: drivenAt,
        location: {
          "@type": "Place",
          name: circuitName
        },
        competitor: {
          "@type": "Person",
          name: driverName
        }
      }}
    />
  );
}
