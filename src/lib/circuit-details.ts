/**
 * 各サーキットの紹介情報。
 * 基本データ (名称・所在地・距離・セクター数) は DB の `circuits` テーブルが正。
 * このファイルは描画用の補助メタデータ (説明文・特徴・公式サイト等) を保持する。
 *
 * 出典: Wikipedia, 各サーキット公式サイト (2026年4月時点)
 */

export type CircuitDetail = {
  slug: string;
  description: string;
  corners?: number;
  elevation_m?: number;
  features?: string[];
  events?: string[];
  famous_corners?: string[];
  typical_use?: string[];
  opened_year?: number;
  city?: string;
  official_url?: string;
};

const ENTRIES: CircuitDetail[] = [
  // ========= フルコース =========
  {
    slug: "fuji",
    description:
      "1965年に開設された富士スピードウェイは、2005年にヘルマン・ティルケの設計で全面改修された日本を代表する国際レーシングコース。1.475kmのホームストレートと多彩なコーナーを備え、F1日本GPやWECも開催してきた国内最高峰のサーキット。",
    corners: 16,
    elevation_m: 40,
    features: [
      "全長1.475kmのホームストレート",
      "高低差約40mの起伏に富むレイアウト",
      "高速・テクニカルが融合したコース",
      "国内最大級のフルコース全長4.563km"
    ],
    events: ["SUPER GT", "SUPER FORMULA", "WEC富士6時間", "スーパー耐久"],
    famous_corners: ["TGRコーナー", "プリウスコーナー", "ダンロップコーナー"],
    opened_year: 1965,
    city: "静岡県駿東郡小山町",
    official_url: "https://www.fsw.tv/"
  },
  {
    slug: "suzuka",
    description:
      "1962年に本田技研工業のテストコースとして開設された鈴鹿サーキットは、世界的にも珍しい立体交差を持つ8の字レイアウトが特徴。F1日本GPの常連開催地であり、鈴鹿8耐の舞台としても国内モータースポーツの聖地と称される。",
    corners: 18,
    elevation_m: 40,
    features: [
      "世界唯一の立体交差8の字コース",
      "高速S字とデグナーの名物セクション",
      "全長5.807kmの国際格式コース",
      "130Rなど世界的に有名な高速コーナー"
    ],
    events: [
      "F1日本グランプリ",
      "SUPER GT",
      "SUPER FORMULA",
      "鈴鹿8時間耐久ロードレース"
    ],
    famous_corners: ["S字", "デグナーカーブ", "130R", "スプーンカーブ"],
    opened_year: 1962,
    city: "三重県鈴鹿市",
    official_url: "https://www.suzukacircuit.jp/"
  },
  {
    slug: "motegi",
    description:
      "1997年にホンダによって開設されたモビリティリゾートもてぎは、ストップ&ゴー型のテクニカルなロードコースとオーバルコースを併設する複合施設。MotoGP日本グランプリの開催地として知られ、SUPER GTやSUPER FORMULAも開催される国内主要サーキット。",
    corners: 14,
    elevation_m: 30,
    features: [
      "ストップ&ゴー型のテクニカルレイアウト",
      "全長4.801kmのロードコース",
      "ブレーキングが攻略の鍵",
      "オーバルコースを併設した複合施設"
    ],
    events: [
      "MotoGP日本グランプリ",
      "SUPER GT",
      "SUPER FORMULA",
      "全日本ロードレース"
    ],
    famous_corners: ["90度コーナー", "V字コーナー", "ヘアピンカーブ"],
    opened_year: 1997,
    city: "栃木県芳賀郡茂木町",
    official_url: "https://www.mr-motegi.jp/"
  },
  {
    slug: "okayama",
    description:
      "1990年にTIサーキット英田として開設された岡山国際サーキットは、1994年と1995年にF1パシフィックグランプリが開催された歴史を持つ国際格式コース。テクニカルなレイアウトと豊かな自然環境が特徴で、SUPER GTなど主要シリーズが開催される。",
    corners: 13,
    elevation_m: 35,
    features: [
      "全長3.703kmのテクニカルレイアウト",
      "アップダウンに富んだコース構成",
      "F1開催歴を持つ国際格式コース",
      "中・低速コーナーが連続する"
    ],
    events: [
      "SUPER GT",
      "SUPER FORMULA",
      "スーパー耐久",
      "全日本F3選手権"
    ],
    famous_corners: ["アトウッドカーブ", "リボルバー", "ヘアピン"],
    opened_year: 1990,
    city: "岡山県美作市",
    official_url: "https://www.okayama-international-circuit.jp/"
  },
  {
    slug: "autopolis",
    description:
      "1990年に阿蘇山近くの山中に開設されたオートポリスは、九州地区を代表する国際サーキット。標高約800mの高地に位置し、雄大な景観と立体的なレイアウトが特徴で、SUPER GTやSUPER FORMULAが開催される。",
    corners: 19,
    elevation_m: 52,
    features: [
      "標高約800mの高地に位置するコース",
      "全長4.674kmのアップダウン豊富なレイアウト",
      "高速コーナーと立体交差を持つ",
      "九州随一の国際格式サーキット"
    ],
    events: ["SUPER GT", "SUPER FORMULA", "スーパー耐久"],
    famous_corners: ["第1コーナー", "ヘアピン", "アトウッドカーブ"],
    opened_year: 1990,
    city: "大分県日田市",
    official_url: "https://www.autopolis.jp/"
  },
  {
    slug: "sportsland-sugo",
    description:
      "1975年に二輪専用コースとして開設され、後に四輪併用化されたスポーツランドSUGOは、東北地区を代表するサーキット。アップダウンと高速セクションが続く挑戦的なレイアウトで、全日本ロードレースやSUPER GTが開催される。",
    corners: 11,
    elevation_m: 70,
    features: [
      "高低差約70mの大きな起伏",
      "全長3.737kmの高速レイアウト",
      "上り基調のテクニカルセクション",
      "東北地区随一の国際格式コース"
    ],
    events: ["SUPER GT", "全日本ロードレース選手権", "スーパー耐久"],
    famous_corners: ["SPインコーナー", "馬の背コーナー", "最終コーナー"],
    opened_year: 1975,
    city: "宮城県柴田郡村田町",
    official_url: "https://www.sportsland-sugo.co.jp/"
  },
  {
    slug: "central",
    description:
      "1973年に中山サーキットとして開設され、後にセントラルサーキットへと改称された関西地区のサーキット。全長2.803kmで、高低差とテクニカルなコーナーが連続するレイアウトが特徴。走行会や草レースの定番コース。",
    corners: 13,
    elevation_m: 30,
    features: [
      "全長2.803kmのテクニカルコース",
      "アップダウンに富んだレイアウト",
      "関西圏のアマチュアレースの拠点",
      "走行会・タイムアタックに人気"
    ],
    events: ["スーパー耐久", "走行会", "全日本カート選手権"],
    famous_corners: ["ヘアピン", "最終コーナー"],
    opened_year: 1973,
    city: "兵庫県多可郡多可町",
    official_url: "https://www.central-circuit.com/"
  },
  {
    slug: "sodegaura",
    description:
      "2010年に開設された袖ケ浦フォレストレースウェイは、千葉県袖ケ浦市の豊かな自然に囲まれた国内では比較的新しいサーキット。全長2.436kmで、首都圏からのアクセスも良く走行会やアマチュアレースで人気が高い。",
    corners: 13,
    elevation_m: 23,
    features: [
      "全長2.436kmのフラットなコース",
      "首都圏から好アクセス",
      "高速コーナーが続くレイアウト",
      "走行会・スポーツ走行で人気"
    ],
    events: ["スーパー耐久", "全日本ロードレース選手権", "走行会"],
    famous_corners: ["第1コーナー", "ヘアピン"],
    opened_year: 2010,
    city: "千葉県袖ケ浦市",
    official_url: "https://www.sodegaura-raceway.com/"
  },
  {
    slug: "tokachi",
    description:
      "1991年に開設された十勝スピードウェイは、北海道十勝平野にある国際格式サーキット。複数のコースレイアウトを持ち、雄大な自然環境と長いストレートが特徴で、24時間耐久レースやスーパー耐久などが開催される。",
    corners: 12,
    features: [
      "北海道唯一の国際格式コース",
      "複数のコースレイアウトに対応",
      "全長5.091kmのフルコース",
      "24時間耐久レースの舞台"
    ],
    events: ["スーパー耐久", "十勝24時間レース", "走行会"],
    famous_corners: ["ヘアピン", "最終コーナー"],
    opened_year: 1991,
    city: "北海道河西郡更別村",
    official_url: "https://www.tokachi-i-speedway.jp/"
  },

  // ========= ショート / ミニサーキット =========
  {
    slug: "tsukuba-2000",
    description:
      "1970年に開設された筑波サーキットのコース2000は、全長2.045kmの平坦でテクニカルなレイアウト。首都圏に近くアマチュアからプロまで幅広い層に親しまれ、走行会やタイムアタックの聖地として知られる。",
    corners: 11,
    features: [
      "全長2.045kmのコンパクトなコース",
      "平坦でテクニカルなレイアウト",
      "首都圏からアクセス良好",
      "タイムアタックの聖地"
    ],
    events: [
      "スーパー耐久",
      "全日本ロードレース選手権",
      "筑波スーパーバトル"
    ],
    famous_corners: ["第1ヘアピン", "最終コーナー", "ダンロップコーナー"],
    typical_use: ["走行会", "タイムアタック"],
    opened_year: 1970,
    city: "茨城県下妻市",
    official_url: "https://www.jasc.or.jp/"
  },
  {
    slug: "tsukuba-1000",
    description:
      "筑波サーキット内にある全長1.039kmの小規模コースで、初心者からカート、ミニバイクまで幅広く利用される入門向けレイアウト。安全性と練習性を重視した設計で、走行会やドライビングスクールの定番コース。",
    corners: 8,
    features: [
      "全長1.039kmのショートコース",
      "初心者の練習に最適",
      "ミニバイクやカートも利用可能",
      "首都圏アクセス良好"
    ],
    typical_use: ["走行会", "ミニバイクレース", "ドライビングスクール"],
    opened_year: 1970,
    city: "茨城県下妻市",
    official_url: "https://www.jasc.or.jp/"
  },
  {
    slug: "ebisu-east",
    description:
      "エビスサーキット内にある東コースは、ドリフトの聖地として国内外に知られるテクニカルレイアウト。全長約1kmのコンパクトなコースで、急勾配の下りセクションが特徴的なドリフトイベントD1グランプリなどの開催地として有名。",
    corners: 10,
    elevation_m: 30,
    features: [
      "ドリフト走行の聖地",
      "急勾配の下りセクション",
      "全長約1kmのコンパクト構成",
      "国内外のドリフターが集結"
    ],
    events: ["D1グランプリ", "ドリフトマツリ", "走行会"],
    famous_corners: ["最終コーナー", "ジャンピングスポット"],
    opened_year: 1965,
    city: "福島県二本松市",
    official_url: "https://www.ebisu-circuit.com/"
  },
  {
    slug: "ebisu-west",
    description:
      "エビスサーキットの西コースは福島県二本松市にある全長約2kmのテクニカルコース。アップダウンと多彩なコーナーが連続し、走行会やドリフト、タイムアタックまで幅広く楽しめる人気サーキット。",
    corners: 13,
    features: [
      "アップダウンの激しいテクニカルレイアウト",
      "ドリフト・走行会の聖地",
      "全7コースを擁する複合施設の一部"
    ],
    typical_use: ["走行会", "ドリフト", "タイムアタック"],
    city: "福島県二本松市",
    official_url: "https://www.ebisu-circuit.com/"
  },
  {
    slug: "mihama",
    description:
      "1965年開業の老舗ミニサーキットで、全長約790mのコンパクトなコース。ジムカーナ的なテクニカルレイアウトで、走行会・ドリフト・ミニバイクなど多目的に利用される愛知の入門スポット。",
    features: [
      "全長約790mのミニサーキット",
      "タイトコーナー主体のテクニカル構成",
      "バイク・四輪両対応の走行会場"
    ],
    typical_use: ["走行会", "ジムカーナ", "ミニバイク", "ドリフト"],
    opened_year: 1965,
    city: "愛知県知多郡美浜町",
    official_url: "https://mihama-circuit.jp/"
  },
  {
    slug: "kouta",
    description:
      "愛知県幸田町にある全長約1,050mのミニサーキット。コンパクトながら高低差とテクニカルなコーナーを持ち、四輪・二輪の走行会や練習走行の場として親しまれている。",
    corners: 9,
    features: [
      "全長約1,050mのテクニカルコース",
      "高低差のあるコーナー構成",
      "四輪・二輪の走行会で人気"
    ],
    typical_use: ["走行会", "練習走行", "ミニバイク"],
    city: "愛知県額田郡幸田町",
    official_url: "https://www.kouta-circuit.com/"
  },
  {
    slug: "suzuka-twin",
    description:
      "三重県鈴鹿市にある全長約2kmのフルコースと約1.4kmのショートコースを持つサーキット。鈴鹿サーキットの近隣でアクセスがよく、走行会・スクール・タイムアタックなど中部圏の練習拠点として人気。",
    features: [
      "フル/ショート2レイアウト構成",
      "鈴鹿エリアのアクセス良好",
      "走行会・スクール多数開催"
    ],
    typical_use: ["走行会", "スクール", "タイムアタック"],
    city: "三重県鈴鹿市",
    official_url: "https://www.suzuka-twin.com/"
  },
  {
    slug: "mobara-west",
    description:
      "千葉県茂原市の茂原ツインサーキットの西コースは全長約1,612mで、テクニカルな高速複合区間を持つメインレイアウト。走行会・タイムアタックを中心に四輪が多く走る関東の人気コース。",
    features: [
      "全長約1,612mのメインレイアウト",
      "中高速コーナーが連続",
      "走行会・タイムアタックの定番"
    ],
    typical_use: ["走行会", "タイムアタック", "ドリフト"],
    city: "千葉県茂原市",
    official_url: "https://www.mobara-twin.com/"
  },
  {
    slug: "mobara-east",
    description:
      "茂原ツインサーキットの東コースは全長約747mのショートレイアウトで、ミニサーキット感覚で楽しめるテクニカルコース。バイクの走行会やドリフト練習、初心者の練習走行に多用される。",
    features: [
      "全長約747mのショートコース",
      "ミニバイク・四輪初心者向け",
      "ドリフト練習でも利用"
    ],
    typical_use: ["走行会", "ミニバイク", "ドリフト練習"],
    city: "千葉県茂原市",
    official_url: "https://www.mobara-twin.com/"
  },
  {
    slug: "spa-nishiura",
    description:
      "愛知県蒲郡市の海沿いにあるスパ西浦モーターパークは、全長1,591mのテクニカルなショートサーキット。アップダウンと多彩なコーナーが連続するレイアウトで、走行会・タイムアタック・ドリフトまで幅広く利用される中部圏の人気コース。",
    features: [
      "全長1,591mのテクニカル構成",
      "アップダウンに富んだレイアウト",
      "海沿い・中部圏アクセス良好"
    ],
    typical_use: ["走行会", "タイムアタック", "ドリフト"],
    city: "愛知県蒲郡市西浦町",
    official_url: "https://spa-nishiura.com/"
  },
  {
    slug: "tsukude",
    description:
      "愛知県新城市作手にある全長約830mのミニサーキット。タイトコーナーが連続するテクニカルレイアウトで、ジムカーナ・ミニバイク・走行会など多目的に利用される中部圏の入門スポット。",
    features: [
      "全長約830mのミニサーキット",
      "タイトコーナー主体のテクニカル構成",
      "ジムカーナ・走行会の定番"
    ],
    typical_use: ["ジムカーナ", "走行会", "ミニバイク"],
    city: "愛知県新城市作手",
    official_url: "https://tsukude.jp/"
  },
  {
    slug: "nakayama",
    description:
      "岡山県美作市にある全長1,595mのテクニカルなショートサーキット。1972年開業の老舗で、コンパクトながらアップダウンと多彩なコーナーを備え、走行会・タイムアタック・ドリフト練習に幅広く使われる中国地方の人気コース。",
    features: [
      "全長1,595mのテクニカル構成",
      "アップダウンに富むレイアウト",
      "1972年開業の老舗ミニサーキット"
    ],
    typical_use: ["走行会", "タイムアタック", "ドリフト"],
    opened_year: 1972,
    city: "岡山県美作市",
    official_url: "https://www.nakayama-circuit.com/"
  },
  {
    slug: "nikko",
    description:
      "栃木県日光市にある全長約1,065mのミニサーキット。タイトな複合コーナーが連続するテクニカルコースで、走行会・タイムアタック・ジムカーナ的練習に多く使われる関東の人気スポット。",
    corners: 10,
    features: [
      "全長約1,065mのテクニカル構成",
      "タイトな複合コーナー多数",
      "関東の走行会定番コース"
    ],
    typical_use: ["走行会", "タイムアタック", "練習走行"],
    city: "栃木県日光市",
    official_url: "https://www.nikko-circuit.com/"
  },
  {
    slug: "honjo",
    description:
      "埼玉県本庄市にある全長約1,150mのミニサーキット。コンパクトながら高低差とテクニカルセクションを持ち、四輪・二輪の走行会、ドリフト、ジムカーナまで幅広く対応する首都圏アクセス良好な施設。",
    features: [
      "全長約1,150mのミニサーキット",
      "高低差のあるテクニカル構成",
      "首都圏からアクセス良好"
    ],
    typical_use: ["走行会", "ドリフト", "ミニバイク"],
    city: "埼玉県本庄市",
    official_url: "https://honjo-circuit.com/"
  },
  {
    slug: "fuji-short",
    description:
      "富士スピードウェイ内のショートコースは全長約972mのテクニカルレイアウト。本コースに比べて入門者向けで、走行会・ライセンス取得・ドライビングスクールなどエントリー層の練習に多く使われる。",
    features: [
      "全長約972mのショート公式コース",
      "入門者・スクール向け",
      "FSWライセンス練習でも利用"
    ],
    typical_use: ["走行会", "スクール", "ライセンス講習"],
    city: "静岡県駿東郡小山町",
    official_url: "https://www.fsw.tv/"
  },
  {
    slug: "sportsland-yamanashi",
    description:
      "山梨県南アルプス市にある全長約1,200mのコンパクトサーキット。タイトなコーナーが続くテクニカルレイアウトで、四輪・二輪の走行会、ドリフト練習、カート走行など多目的に利用される。",
    features: [
      "タイトコーナー連続のテクニカル構成",
      "四輪・二輪・カート対応",
      "甲府盆地からアクセス良好"
    ],
    typical_use: ["走行会", "ドリフト", "カート"],
    city: "山梨県南アルプス市",
    official_url: "https://sportsland-yamanashi.com/"
  }
];

export const CIRCUIT_DETAILS: Record<string, CircuitDetail> = Object.fromEntries(
  ENTRIES.map((e) => [e.slug, e])
);

export function getCircuitDetail(slug: string): CircuitDetail | null {
  return CIRCUIT_DETAILS[slug] ?? null;
}
