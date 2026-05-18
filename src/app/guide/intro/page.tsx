import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サーキット走行 入門ガイド",
  description:
    "これからサーキット走行を始めたい方向けの入門ガイド。スポーツ走行と走行会の違い、参加までの準備、当日の流れ、必要な装備、初心者がやりがちな失敗、上達のコツまで網羅。"
};

export default function CircuitIntroGuidePage() {
  return (
    <article className="prose-article space-y-8">
      <header className="hero rounded-xl p-5 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-racing-red">
          GUIDE
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          サーキット走行 入門ガイド
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-zinc-700">
          「サーキットを走ってみたいけど、何から始めればいい?」という方のための入門ガイド。
          スポーツ走行と走行会の違い、参加までの準備、当日の流れ、必要な装備、初心者がやりがちな失敗、
          そしてタイムを縮めるための基本的なコツまで、最初のサーキット走行に必要な情報をまとめました。
        </p>
      </header>

      <Section title="1. サーキット走行の3つの形態">
        <p>
          一口に「サーキット走行」と言っても、参加形態は大きく3種類に分かれます。それぞれ料金、自由度、安全性のバランスが異なるため、自分の目的に合った形を選ぶことが大切です。
        </p>
        <Subsection title="スポーツ走行(フリー走行)">
          <p>
            サーキットが個別に開催する「自由に走れる枠」です。参加者数だけ料金を払って、決まった時間帯にコースを走ります。多くのサーキットで平日に「スポーツ走行枠」が設定されており、富士スピードウェイ・鈴鹿サーキット・もてぎなどでは枠ごとにライセンス区分が分かれています(初心者は同乗指導付きの枠から始めるのが一般的)。
          </p>
          <p>
            料金は1時間あたり 5,000円〜15,000円程度。コースによっては<strong>サーキットライセンス</strong>(各サーキット発行の認定証)が必要です。鈴鹿・富士・もてぎなどの国際サーキットは、初回にライセンス講習の受講(数千円〜)が必須となります。
          </p>
        </Subsection>
        <Subsection title="走行会">
          <p>
            ショップ・主催者団体・雑誌などが企画する有料イベント。1日かけて、20分×3〜5本のセッションで走ります。料金は3万円〜5万円が相場で、参加者をクラス分けしてスピードレンジの近い人と走るため、<strong>初心者にとって最も入りやすい</strong>形態です。
          </p>
          <p>
            主催者によっては、同乗インストラクター・走行ライン解説・初心者講習会などが付いてくることもあります。サーキットライセンスが不要なことも多く、最初の1台目は走行会から始めるのが一般的です。
          </p>
        </Subsection>
        <Subsection title="競技 (タイムアタック大会・レース)">
          <p>
            筑波スーパーバトル、Attack つくば、富士チャンピオンレースシリーズなど、競技として参加する形態。事前エントリー・参加資格・車両規定があり、ハードルは高めです。ただし、結果は記録に残り、車種別ランキングの上位に入れば業界での認知度が上がります。
          </p>
        </Subsection>
      </Section>

      <Section title="2. 参加するまでの準備">
        <Subsection title="① 自分の車をチェックする">
          <p>
            「サーキットを走れる車」と「公道で走れる車」の境界は意外と曖昧です。マニュアル / オートマ問わず、純正状態のスポーツカーであれば多くのサーキットで走行できます。ただし以下は事前に必ず確認してください。
          </p>
          <ul>
            <li><strong>タイヤの残溝</strong>: 3mm 以下だと熱ダレが早く、ハイグリップタイヤでも安全マージンが減ります。新品〜半山程度が理想。</li>
            <li><strong>ブレーキパッド残量</strong>: 3mm 以下は要交換。サーキットでは公道の何倍ものブレーキ熱が発生し、ベーパーロックの原因になります。</li>
            <li><strong>ブレーキフルード</strong>: 走行前に交換推奨。DOT4 以上の指定の銘柄を使用。</li>
            <li><strong>エンジンオイル</strong>: 走行前に交換 or 量チェック。高負荷で消費量が増えます。</li>
            <li><strong>各部のボルト・配管・タイロッド・ホイールナットの締結状態</strong>: 増し締めで確認。</li>
          </ul>
        </Subsection>

        <Subsection title="② 装備を揃える">
          <p>
            最低限必要な装備は次の通りです。サーキットによっては規定で必須となるものもあります。
          </p>
          <ul>
            <li><strong>ヘルメット</strong>: SNELL / JIS 規格の四輪用フルフェイス。1万円台から購入可能。レンタルがあるサーキットも一部あり。</li>
            <li><strong>長袖・長ズボン</strong>: 化学繊維(ナイロン等)は溶けると体に張り付くので避ける。綿100%が無難。レーシングスーツがあれば理想。</li>
            <li><strong>グローブ</strong>: 軍手でも可だが、ドライビンググローブがあるとハンドル操作が安定する。</li>
            <li><strong>運転靴</strong>: ペダル操作しやすい薄底のシューズ。スニーカーで OK。サンダル・ヒールは NG。</li>
            <li><strong>けん引フック</strong>: コースアウト時の救援用。前後に取り付ける義務がある場合あり。</li>
            <li><strong>ガムテープ・養生テープ</strong>: ヘッドライト・ナンバープレートの飛散防止用。</li>
          </ul>
        </Subsection>

        <Subsection title="③ 当日のスケジュールを把握する">
          <p>
            走行会の場合、一般的に下記のような流れで進みます。
          </p>
          <ul>
            <li><strong>8:00 集合・受付</strong>: ピットに駐車し、ゼッケン・参加者カードを受け取る。</li>
            <li><strong>8:30 ドライバーズミーティング</strong>: 走行ルール・旗の意味・コース図の説明。<strong>絶対に聞き逃さない。</strong></li>
            <li><strong>9:00 1本目走行 (20分程度)</strong>: 慣熟走行。タイヤと体を温める。</li>
            <li><strong>10:00 2本目</strong>: ペースアップ。タイム計測開始。</li>
            <li><strong>11:00 3本目</strong>: 自己ベスト狙い。</li>
            <li><strong>12:00 昼食</strong>: 主催者から弁当が出ることが多い。</li>
            <li><strong>13:30〜 午後の走行 × 2〜3本</strong>: 午後はタイヤが熱ダレしやすい時間帯。</li>
            <li><strong>16:00 終了・解散</strong>: 帰路は車を冷ましてからゆっくり走る。</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="3. 初心者がやりがちな失敗ベスト5">
        <Subsection title="① いきなりタイムを狙う">
          <p>
            最初の1〜2本は「慣熟走行」と割り切って、タイムは無視しましょう。コース幅・ブレーキングポイント・コーナーのライン取り・路面状況を全身で覚えることが先決です。ベテランほど「最初の走行は7割で流す」と言います。
          </p>
        </Subsection>
        <Subsection title="② オーバーペースでブレーキを焼く">
          <p>
            公道のクセで、コーナー手前で奥までブレーキを引きずると、ローター・パッドが急激に温度上昇し、3〜5周でフェード(効かなくなる)します。サーキットでは<strong>「短く、強く、早く離す」</strong>のブレーキングが基本。1周ごとにブレーキが冷えるリズムを作りましょう。
          </p>
        </Subsection>
        <Subsection title="③ タイヤの空気圧を高過ぎ・低過ぎに設定">
          <p>
            ハイグリップタイヤの場合、冷間 1.8〜2.0 kgf/cm² 程度から始めて、走行後に温間 2.1〜2.3 kgf/cm² に収まるのが目安です。空気圧が高いとグリップが落ち、低すぎるとよじれて発熱しすぎる。サーキットの売店でエアゲージが売っているので必ず計測しましょう。
          </p>
        </Subsection>
        <Subsection title="④ 1周しかしないで全力アタック">
          <p>
            タイヤ・ブレーキ・エンジン油温は、3〜5 周走ってからベストパフォーマンスに到達します。1 本のセッションで「ウォームアップ 2 周 → アタック 3〜4 周 → クールダウン 2 周」が理想。クールダウンを省くとブレーキが歪み、エンジンも痛みます。
          </p>
        </Subsection>
        <Subsection title="⑤ コースアウトしてパニックでフルブレーキ">
          <p>
            砂利に飛び出した場合、ブレーキを踏み続けるとタイヤがロックしてさらに姿勢が乱れます。<strong>「クラッチ切る → ブレーキ離す → ハンドルまっすぐ → 自然減速」</strong>を冷静に。コースに復帰する際は後続の流れを確認してから本コースへ。
          </p>
        </Subsection>
      </Section>

      <Section title="4. タイムを縮める基本的なコツ">
        <Subsection title="① ブレーキング地点を一定にする">
          <p>
            毎周バラついている人は、まずブレーキングポイントを固定しましょう。コーナー手前のキロポスト、看板、舗装の継ぎ目などを目印にして、必ず同じ位置でブレーキを踏み始めます。「より遅く踏む」のは、ライン取りとブレーキ操作が安定してからです。
          </p>
        </Subsection>
        <Subsection title="② アウト・イン・アウトを意識する">
          <p>
            コーナーの基本ライン。コーナー進入はアウト側 → クリッピングポイントでイン側 → 立ち上がりはアウト側に開く。この最短ラインを取ることで、コーナーリング速度を最大化できます。中速 〜 高速コーナーでは特に効果が大きいです。
          </p>
        </Subsection>
        <Subsection title="③ ステアリングは「ゆっくり切って・ゆっくり戻す」">
          <p>
            荷重移動が穏やかになり、タイヤが破綻しにくくなります。「クイックに切る」のはむしろ初心者がやりがちな失敗。ベテランの車載動画を見ると、ステアリング操作は驚くほどスムーズです。
          </p>
        </Subsection>
        <Subsection title="④ 同じセッティングのドライバーを参考にする">
          <p>
            走ログでは、同じサーキット・同じ車種・同じタイヤ銘柄でフィルター検索できます。上位の人がどんなセッティングで何分何秒を出しているかを見れば、自分の現在地と次の一歩が見えてきます。
          </p>
          <p>
            <Link
              href="/ranking"
              className="inline-block rounded bg-racing-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              ランキングを見る
            </Link>
          </p>
        </Subsection>
        <Subsection title="⑤ 走行後に必ずタイムを記録する">
          <p>
            記憶は風化します。「天候・気温・路温・タイヤ・空気圧・改造内容・出たベストタイム」を毎回記録しておくと、半年後・1年後に振り返ったときに自分の成長と「効いたセッティング」が見えてきます。
          </p>
          <p>
            走ログは、まさにこの<strong>「記録する習慣」をシンプルに支援するツール</strong>として作られています。タイム投稿フォームに毎回入れていけば、自然と振り返り可能な走行履歴が積み上がります。
          </p>
        </Subsection>
      </Section>

      <Section title="5. もっと深く知りたい人へ">
        <p>
          このページでは入門レベルの内容に絞りましたが、もっと専門的なテーマも順次ガイド化していく予定です。
        </p>
        <ul>
          <li>
            <Link href="/guide/tires" className="text-racing-red hover:underline">
              タイヤ選びガイド
            </Link>
            : ハイグリップ / セミスリック / Sタイヤの違いと選び方
          </li>
          <li>
            <Link href="/help" className="text-racing-red hover:underline">
              よくある質問
            </Link>
            : 走ログの使い方やタイム投稿のコツ
          </li>
        </ul>
      </Section>

      <section className="hero rounded-xl p-5 text-center sm:p-10">
        <h2 className="text-2xl font-bold text-zinc-900">
          最初の1走、記録しませんか?
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          無料で登録できます。クレジットカード不要。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
          >
            走ログを始める
          </Link>
          <Link
            href="/circuits"
            className="rounded border border-zinc-300 px-5 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
          >
            サーキット一覧を見る
          </Link>
        </div>
      </section>
    </article>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-l-4 border-racing-red pl-3 text-2xl font-bold text-zinc-900">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-700 [&_p]:my-2 [&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}

function Subsection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <h3 className="mb-2 text-lg font-bold text-zinc-900">{title}</h3>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-700">
        {children}
      </div>
    </div>
  );
}
