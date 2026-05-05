import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "走ログ 有料プランに関する特定商取引法に基づく表記"
};

export default function TokushohoPage() {
  return (
    <LegalLayout
      title="特定商取引法に基づく表記"
      effectiveDate="2026年5月1日"
    >
      <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        ※ 以下は走ログ Premium / Pro プラン (有料サブスクリプション) に関する表記です。<br />
        ※ 個人事業主として運営する場合、住所・電話番号は請求があったときに遅滞なく提供する形でも認められます。下記の <em>「請求があった場合に開示」</em> 部分は実運営時に確定情報に置き換えてください。
      </p>

      <table>
        <tbody>
          <tr>
            <th style={{ width: "30%" }}>販売事業者</th>
            <td>走ログ運営事務局 (記載準備中)</td>
          </tr>
          <tr>
            <th>運営責任者</th>
            <td>(運営責任者名)</td>
          </tr>
          <tr>
            <th>所在地</th>
            <td>請求があった場合に遅滞なく開示します。</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>請求があった場合に遅滞なく開示します。</td>
          </tr>
          <tr>
            <th>メールアドレス</th>
            <td>support@hashirolog.example</td>
          </tr>
          <tr>
            <th>ウェブサイト</th>
            <td>https://hashirolog.example</td>
          </tr>
          <tr>
            <th>販売価格</th>
            <td>
              各プラン詳細ページに表示する価格 (税込)<br />
              ・Premium プラン: 月額 390 円 / 年額 3,900 円<br />
              ・Pro プラン: 月額 980 円 / 年額 9,800 円
            </td>
          </tr>
          <tr>
            <th>商品代金以外の必要料金</th>
            <td>本サービスの利用に必要な通信料金はお客様負担となります。</td>
          </tr>
          <tr>
            <th>支払方法</th>
            <td>
              クレジットカード決済 (VISA / Mastercard / JCB / American Express / Diners Club)<br />
              決済代行: Stripe, Inc.
            </td>
          </tr>
          <tr>
            <th>支払時期</th>
            <td>
              申込時に初回課金、以降は契約期間 (月額または年額) ごとの自動更新時に課金します。
            </td>
          </tr>
          <tr>
            <th>サービスの提供時期</th>
            <td>決済完了後、即時にプランが有効化されます。</td>
          </tr>
          <tr>
            <th>キャンセル・解約について</th>
            <td>
              いつでも解約手続きが可能です。解約後も契約期間終了までサービスを利用できます。<br />
              すでにお支払いいただいた料金は、当方の重大な責めに帰すべき事由がある場合を除き、原則として返金いたしません。
            </td>
          </tr>
          <tr>
            <th>動作環境</th>
            <td>
              最新版の Google Chrome / Firefox / Safari / Edge を推奨します。<br />
              モバイルブラウザにも対応しています。
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-6 text-xs text-zinc-500">
        本表記の内容は、サービス開始時に確定情報に更新します。
      </p>
    </LegalLayout>
  );
}
