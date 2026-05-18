import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サーキット走行用タイヤ 選び方ガイド",
  description:
    "サーキット走行で使うタイヤの選び方を解説。ストリートラジアル・ハイグリップラジアル・セミスリック・Sタイヤの違い、温度依存性、サイズ選び、銘柄別の特徴まで網羅。"
};

export default function TiresGuidePage() {
  return (
    <article className="space-y-8">
      <header className="hero rounded-xl p-5 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-racing-red">
          GUIDE
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          サーキット走行用タイヤ 選び方ガイド
        </h1>
        <p className="mt-4 max-w-3xl leading-relaxed text-zinc-700">
          サーキット走行を始めると、最初に直面するのが「どのタイヤを履けばいいのか」という問題です。
          ハイグリップラジアル、セミスリック、S タイヤ……
          値段もグリップ特性もライフも違うこれらのタイヤを、自分の用途とレベルに合わせてどう選べばよいか。
          本ガイドでは、サーキット用タイヤのカテゴリ分け、判断基準、代表的な銘柄、そしてタイヤ管理のコツまでをまとめました。
        </p>
      </header>

      <Section title="1. タイヤのカテゴリ分けを理解する">
        <p>
          サーキット用途で使うタイヤは、ざっくり下記の 4 カテゴリに分けられます。横軸に「グリップ」、縦軸に「ライフ・公道性能」を取ると、おおむね反比例の関係になります。
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-300 text-left">
              <th className="px-3 py-2">カテゴリ</th>
              <th className="px-3 py-2">グリップ</th>
              <th className="px-3 py-2">公道性能</th>
              <th className="px-3 py-2">ライフ</th>
              <th className="px-3 py-2">価格帯 (1本)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            <tr>
              <td className="px-3 py-2 font-bold">ストリートラジアル</td>
              <td className="px-3 py-2">★★☆☆☆</td>
              <td className="px-3 py-2">★★★★★</td>
              <td className="px-3 py-2">★★★★★</td>
              <td className="px-3 py-2">1.5〜2.5 万円</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold">ハイグリップラジアル</td>
              <td className="px-3 py-2">★★★★☆</td>
              <td className="px-3 py-2">★★★★☆</td>
              <td className="px-3 py-2">★★★☆☆</td>
              <td className="px-3 py-2">2.5〜4 万円</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold">セミスリック (TW100〜200)</td>
              <td className="px-3 py-2">★★★★★</td>
              <td className="px-3 py-2">★★☆☆☆</td>
              <td className="px-3 py-2">★★☆☆☆</td>
              <td className="px-3 py-2">3〜5 万円</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold">S タイヤ (TW40〜100)</td>
              <td className="px-3 py-2">★★★★★+</td>
              <td className="px-3 py-2">★☆☆☆☆</td>
              <td className="px-3 py-2">★☆☆☆☆</td>
              <td className="px-3 py-2">4〜7 万円</td>
            </tr>
          </tbody>
        </table>
        <p>
          ※ TW = Treadwear (摩耗指数)。数値が小さいほど摩耗しやすく、グリップが高い傾向です。S タイヤは TW100 を切り、グリップは公道タイヤの 1.5〜2 倍に達しますが、雨天では使い物にならない・寿命が極端に短いという欠点があります。
        </p>
      </Section>

      <Section title="2. レベル別おすすめカテゴリ">
        <Subsection title="サーキットデビュー〜年 2〜3 回程度">
          <p>
            <strong>ストリートラジアル</strong>のままで充分です。普段履きのまま走行会に参加し、コース幅・ライン取り・ブレーキングを体で覚える時期です。ハイグリップタイヤを履いてもドライバーの技量がないうちは大きな差は出ず、むしろグリップが高すぎてミスの代償が大きくなります。
          </p>
          <p>
            この段階で人気の銘柄: ヨコハマ ADVAN dB / ブリヂストン POTENZA S007A / ミシュラン Pilot Sport 4S。
          </p>
        </Subsection>
        <Subsection title="年 5〜10 回・タイム狙い始めた段階">
          <p>
            <strong>ハイグリップラジアル</strong>に移行する適期です。「セッティング以前にタイヤを変えるべき」と言われるのがこの段階。同じセッティング・同じ腕でも、ハイグリップを履くと 1〜3 秒は縮まります。
          </p>
          <p>
            人気の銘柄:
          </p>
          <ul>
            <li><strong>YOKOHAMA ADVAN NEOVA AD09</strong>: 国内ハイグリップの定番。耐久性と絶対性能のバランスが優秀。</li>
            <li><strong>BRIDGESTONE POTENZA RE-71RS</strong>: タイムアタック界の王道。一発の速さは AD09 と双璧。</li>
            <li><strong>DUNLOP DIREZZA ZIII</strong>: コスパが良く、初めてのハイグリップに選ばれることが多い。</li>
            <li><strong>TOYO PROXES R1R</strong>: 雨に比較的強く、街乗り併用しやすい。</li>
          </ul>
        </Subsection>
        <Subsection title="年 10 回以上・タイムアタック競技を意識">
          <p>
            <strong>セミスリック</strong>のステージです。代表格は YOKOHAMA A052 / ADVAN A050、DUNLOP DIREZZA β02、TOYO R888R、ハンコック RS4 など。SHIBATIRE の TW200 / TW280 も近年このカテゴリで急速にシェアを伸ばしています。
          </p>
          <p>
            このクラスは「サーキットでベストタイムを出すための専用品」と割り切るのが正解。公道での雨天走行や、長距離移動のサーキット行きは別タイヤに履き替えるのが理想です。
          </p>
        </Subsection>
        <Subsection title="プロ・選手権参戦クラス">
          <p>
            <strong>S タイヤ</strong>。ADVAN A050 G/2S compound、DIREZZA 03G、HANKOOK Z214 など、選手権規定で許される範囲の最強グリップ。1 セット (4 本) で 30〜40 万円、5〜10 走行で寿命が来ることもザラ。ここまで来ると車両セットアップとの一体最適化が必要になります。
          </p>
        </Subsection>
      </Section>

      <Section title="3. サイズの選び方">
        <p>
          基本は<strong>純正サイズ + 同等もしくは 1 サイズアップ</strong>。例えば S2000 (AP1) の純正 215/45R17 なら、サーキット用に 225/45R17 or 235/40R17 までが現実的です。それ以上ワイドにすると、フェンダー干渉・ハンドリングの鈍化・燃費悪化のデメリットが上回ります。
        </p>
        <p>
          また、車種によっては<strong>フロントとリアでサイズを変える</strong>セッティングが有効です。例えば FR 車では「フロント 235 / リア 255」のように後輪を太くすることで、トラクションの確保とリアの安定性を両立できます。
        </p>
        <p>
          走ログのタイム投稿フォームでは、フロント / リア別々にタイヤサイズを記録できます。前後でブランドを変える(例: 前 A052 / 後 NEOVA)場合も、それぞれ独立して登録可能です。
        </p>
      </Section>

      <Section title="4. タイヤを生かすセッティング">
        <Subsection title="空気圧">
          <p>
            ハイグリップラジアルやセミスリックの場合、冷間 1.8〜2.0 kgf/cm² で出発し、走行後に温間で 2.1〜2.3 kgf/cm² に収まるのが目安です。空気圧を高くしすぎると接地面が中央に集中してグリップが落ち、低すぎるとサイドウォールがよじれて発熱・偏摩耗の原因になります。
          </p>
          <p>
            S タイヤは指定空気圧がメーカーから公開されています(A050 で 2.0 kgf/cm² など)。守らないとサイドウォールがよじれて 1 走行でゴム剥離することも。
          </p>
        </Subsection>
        <Subsection title="温度依存性">
          <p>
            ハイグリップ以上のタイヤは、トレッド温度 60〜90℃ で最大グリップを発揮します。1 本目の走行は「冷間 → 適温」に持っていくウォームアップ周回が必須。逆に午後の真夏は温度が上がりすぎてオーバーヒートし、グリップが落ちることがあります。
          </p>
        </Subsection>
        <Subsection title="アライメント">
          <p>
            純正キャンバー(0〜マイナス 0.5°)では、サーキットでフロントタイヤの外側だけが偏摩耗しがちです。タイヤを生かしたいなら、フロントキャンバー マイナス 2.0〜3.0° 程度のアライメント変更が有効。ただし公道では直進性の低下・偏摩耗(内側)が出るため、街乗りと両立する場合はマイナス 1.5° 程度に抑えるのが現実的です。
          </p>
        </Subsection>
      </Section>

      <Section title="5. 履き替え・保管のコツ">
        <ul>
          <li>
            <strong>履き替えタイミング</strong>:
            ハイグリップは溝が 3mm を切ると性能が急落します。「半山 + 走行 5 〜 10 回 = 寿命」のイメージ。
          </li>
          <li>
            <strong>ローテーション</strong>:
            ハイグリップでは、フロントを左右入れ替えて偏摩耗を抑える「クロスローテーション」が有効。S タイヤは方向指定があるので NG。
          </li>
          <li>
            <strong>保管</strong>:
            直射日光・湿気を避け、立てて保管。空気圧は 2.0 kgf/cm² 程度に下げてから保管するとサイドウォールの変形を防げます。
          </li>
          <li>
            <strong>ヒートサイクル</strong>:
            セミスリック以上は、サーキット走行 10〜15 セッションでゴムが硬化し本来のグリップが出なくなることがあります。「ライフが残っているのにタイムが落ちる」と感じたら交換時期です。
          </li>
        </ul>
      </Section>

      <Section title="6. 走ログで他のドライバーのタイヤ選択を参考にする">
        <p>
          ランキング画面では、タイヤブランド・タイヤ銘柄でフィルター検索できます。たとえば「日光サーキット × YOKOHAMA × ADVAN A052」で絞ると、A052 で日光サーキットを走った人のタイムが一覧化されます。前後別タイヤで登録されたラップは、フロントだけ一致でもリアだけ一致でも表示される設計です。
        </p>
        <p>
          上位のドライバーが、どのサーキットで、どの銘柄を、どんな空気圧で履いて、どのタイムを出しているのか —— これを横断的に見られる場所として、走ログを育てていきます。
        </p>
        <p>
          <Link
            href="/ranking"
            className="inline-block rounded bg-racing-red px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            ランキングでタイヤ別検索
          </Link>
        </p>
      </Section>

      <Section title="関連ガイド">
        <ul>
          <li>
            <Link href="/guide/intro" className="text-racing-red hover:underline">
              サーキット走行 入門ガイド
            </Link>
            : これからサーキットを走りたい方向け
          </li>
          <li>
            <Link href="/help" className="text-racing-red hover:underline">
              よくある質問 (FAQ)
            </Link>
            : 走ログの使い方
          </li>
        </ul>
      </Section>

      <section className="hero rounded-xl p-5 text-center sm:p-10">
        <h2 className="text-2xl font-bold text-zinc-900">
          履き替えたら、まず1走記録しよう
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          銘柄変更前後のタイム比較が、走ログでは簡単にできます。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded bg-racing-red px-5 py-2.5 font-bold text-white hover:bg-red-700"
          >
            走ログを始める
          </Link>
          <Link
            href="/laps/new"
            className="rounded border border-zinc-300 px-5 py-2.5 font-bold text-zinc-700 hover:bg-zinc-50"
          >
            タイムを投稿する
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
      <div className="space-y-4 text-sm leading-relaxed text-zinc-700 [&_p]:my-2 [&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_table]:my-2 [&_th]:bg-zinc-50 [&_th]:font-semibold">
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
