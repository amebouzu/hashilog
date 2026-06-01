/**
 * AdSense パブリッシャー ID を環境変数から安全に取り出すヘルパー。
 *
 * NEXT_PUBLIC_ADSENSE_CLIENT には理想的には "ca-pub-1234567890123456" だけを
 * 設定するが、運用ミスで <script> タグ全体が貼られることがある。
 * その場合でも正規表現で "ca-pub-XXXX" を抽出して使えるようにする。
 *
 * @returns "ca-pub-1234567890123456" 形式の文字列、見つからなければ null
 */
export function getAdsenseClient(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  if (!raw) return null;
  // 既に正しい形式ならそのまま、タグ等が混じっていても ca-pub-数字 を拾う
  const m = raw.match(/ca-pub-\d{10,20}/);
  return m ? m[0] : null;
}

/**
 * ads.txt 用の "pub-XXXX" 形式 (先頭 ca- を除いたもの) を返す。
 */
export function getAdsensePubId(): string | null {
  const client = getAdsenseClient();
  return client ? client.replace(/^ca-/, "") : null;
}
