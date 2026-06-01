/**
 * AdSense ads.txt を動的に配信する route ハンドラ。
 * GET /ads.txt で text/plain を返す。
 *
 * パブリッシャー ID はリポジトリにベタ書きせず、環境変数
 * NEXT_PUBLIC_ADSENSE_CLIENT (例: ca-pub-1234567890123456) から生成する。
 * ads.txt の仕様では先頭の "ca-" を除いた "pub-XXXX" を記載する。
 *
 * 形式:
 *   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 *
 * 末尾の f08c47fec0942fa0 は Google AdSense 固定の認証局 (TAG) ID。
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();

  if (!client) {
    // ID 未設定時は空の (コメントのみ) ads.txt を返す
    return new Response(
      "# ads.txt — NEXT_PUBLIC_ADSENSE_CLIENT is not set yet\n",
      {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" }
      }
    );
  }

  // "ca-pub-1234..." -> "pub-1234..."
  const pub = client.replace(/^ca-/, "");

  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // ads.txt はあまり変わらないので 1 時間キャッシュ
      "cache-control": "public, max-age=3600"
    }
  });
}
