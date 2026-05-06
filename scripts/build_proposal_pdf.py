"""走ログ事業提案書 PDF 生成スクリプト.

docs/PROPOSAL.md の内容を反映した、日本語対応の PDF を docs/PROPOSAL.pdf に書き出す。
ReportLab の組み込み CID フォント (HeiseiKakuGo-W5 / HeiseiMin-W3) を使うため、
TTF ファイル等の追加同梱は不要。

実行:
    python scripts/build_proposal_pdf.py
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors


# Logo path (resolves on platypus image loading)
LOGO_PATH = Path(__file__).resolve().parents[1] / "public" / "logo.png"


# ---------------------------------------------------------------------------
# Fonts (built-in CID, no TTF bundling needed)
# ---------------------------------------------------------------------------
pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
pdfmetrics.registerFont(UnicodeCIDFont("HeiseiMin-W3"))
JP_SANS = "HeiseiKakuGo-W5"
JP_SERIF = "HeiseiMin-W3"


# ---------------------------------------------------------------------------
# Styles
# ---------------------------------------------------------------------------
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    name="JpTitle",
    parent=styles["Title"],
    fontName=JP_SANS,
    fontSize=22,
    leading=30,
    spaceAfter=10,
    textColor=colors.HexColor("#18181b"),
)
subtitle_style = ParagraphStyle(
    name="JpSubtitle",
    parent=styles["Normal"],
    fontName=JP_SANS,
    fontSize=12,
    leading=18,
    textColor=colors.HexColor("#52525b"),
    spaceAfter=20,
)
h1 = ParagraphStyle(
    name="JpH1",
    parent=styles["Heading1"],
    fontName=JP_SANS,
    fontSize=18,
    leading=26,
    textColor=colors.HexColor("#e10600"),
    spaceBefore=18,
    spaceAfter=8,
)
h2 = ParagraphStyle(
    name="JpH2",
    parent=styles["Heading2"],
    fontName=JP_SANS,
    fontSize=14,
    leading=22,
    textColor=colors.HexColor("#18181b"),
    spaceBefore=14,
    spaceAfter=6,
)
h3 = ParagraphStyle(
    name="JpH3",
    parent=styles["Heading3"],
    fontName=JP_SANS,
    fontSize=12,
    leading=18,
    textColor=colors.HexColor("#3f3f46"),
    spaceBefore=10,
    spaceAfter=4,
)
body = ParagraphStyle(
    name="JpBody",
    parent=styles["Normal"],
    fontName=JP_SERIF,
    fontSize=10.5,
    leading=17,
    textColor=colors.HexColor("#18181b"),
    spaceAfter=6,
)
bullet = ParagraphStyle(
    name="JpBullet",
    parent=body,
    leftIndent=14,
    bulletIndent=4,
)
small = ParagraphStyle(
    name="JpSmall",
    parent=body,
    fontSize=9,
    leading=13,
    textColor=colors.HexColor("#71717a"),
)


def p(text: str, style: ParagraphStyle = body):
    """Paragraph helper that escapes HTML-ish chars but keeps <b>/<i>."""
    safe = text.replace("&", "&amp;")
    return Paragraph(safe, style)


def jp_table(rows, col_widths=None, header_bg="#fafafa") -> Table:
    """Render a list-of-lists as a styled table with Japanese font."""
    data = [
        [
            Paragraph(str(cell).replace("&", "&amp;"), body)
            for cell in row
        ]
        for row in rows
    ]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("FONT", (0, 0), (-1, -1), JP_SERIF, 9.5),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_bg)),
                ("FONT", (0, 0), (-1, 0), JP_SANS, 9.5),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#18181b")),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#a1a1aa")),
                ("INNERGRID", (0, 1), (-1, -1), 0.25, colors.HexColor("#e4e4e7")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


# ---------------------------------------------------------------------------
# Build content
# ---------------------------------------------------------------------------
def build_story():
    story = []

    # ===== Cover =====
    story.append(Spacer(1, 30 * mm))
    if LOGO_PATH.exists():
        # logo.png aspect 1181:625; render at 70mm wide centered
        logo_w = 70 * mm
        logo_h = logo_w * (625 / 1181)
        logo = Image(str(LOGO_PATH), width=logo_w, height=logo_h)
        logo.hAlign = "CENTER"
        story.append(logo)
        story.append(Spacer(1, 14 * mm))
    story.append(p("走ログ (Hashilog) 事業提案書", title_style))
    story.append(
        p(
            "日本のサーキットタイムを、もっと面白く。もっと信頼できるものに。",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 40 * mm))
    story.append(
        jp_table(
            [
                ["サービス名", "走ログ (Hashilog)"],
                ["運営事業者", "RBS"],
                ["運営責任者", "久米田 昴"],
                ["Web", "https://hashilog.jp"],
                ["お問い合わせ", "hashilog2024@gmail.com"],
                ["文書バージョン", "v1.0"],
            ],
            col_widths=[50 * mm, 110 * mm],
        )
    )
    story.append(PageBreak())

    # ===== 1. エグゼクティブサマリー =====
    story.append(p("1. エグゼクティブサマリー", h1))
    story.append(
        p(
            "走ログは、日本のサーキットで刻んだラップタイムを、愛車情報と一緒に記録・共有できる Web サービスです。"
            "これまで「ガレージのホワイトボード」「個人ブログ」「SNS のスクショ」「LINE グループ」など、"
            "走行データはバラバラに散在していました。走ログはそれを<b>検索可能・比較可能・SNS 拡散可能</b>な形で"
            "集約し、ドライバー・サーキット・メーカーをつなぐプラットフォームを目指します。"
        )
    )

    story.append(p("提供価値", h2))
    for line in [
        "・ <b>ドライバー</b>: タイム履歴・改造履歴・タイヤ履歴を1か所で管理。SNS で簡単にシェア。同条件ドライバーとの比較。",
        "・ <b>サーキット運営者</b>: 自施設の公式ページを無料で運用。走行会・イベントの告知。来場者の可視化。",
        "・ <b>タイヤ・パーツメーカー</b>: 自社製品の使用実績データ・タイム・条件を実データで把握。",
        "・ <b>イベント主催者</b>: 走行会の集客チャネル。",
    ]:
        story.append(p(line, bullet))

    story.append(p("現在のステータス", h2))
    for line in [
        "・ 本番稼働中: https://hashilog.jp",
        "・ 主要機能はすべて実装済み",
        "・ インフラ: Vercel + Supabase Tokyo + GitHub",
        "・ 提携・データ提供等の問い合わせ受付中",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    # ===== 2. 市場背景・課題認識 =====
    story.append(p("2. 市場背景・課題認識", h1))
    story.append(p("2.1 国内サーキット走行人口", h2))
    for line in [
        "・ 国内のサーキット (ミニサーキット含む) は 30 か所以上",
        "・ 走行会・タイムアタック・耐久などのアマチュアモータースポーツ参加層は数万人規模",
        "・ ドライバーの平均年齢層は 30〜50 代が中心、可処分所得が比較的高い",
    ]:
        story.append(p(line, bullet))

    story.append(p("2.2 既存の情報インフラの課題", h2))
    story.append(
        jp_table(
            [
                ["既存の手段", "課題"],
                ["個人ブログ・X / Instagram", "投稿が散在、検索性ゼロ、過去データに辿り着けない"],
                ["LINE グループ・Discord", "閉じたコミュニティ、外部からは見えない"],
                ["サーキット公式タイム掲示板", "サーキット間で形式バラバラ、車両・タイヤ情報が紐づかない"],
                ["走行会主催者の Excel", "主催者依存、走行会単位で完結、横断比較不可"],
            ],
            col_widths=[60 * mm, 100 * mm],
        )
    )

    story.append(p("2.3 走ログが解決すること", h2))
    for line in [
        "・ <b>検索可能なフォーマット</b>: サーキット × 車種 × タイヤ × タイム のクロス絞り込み",
        "・ <b>エビデンス文化</b>: 計測機器・モニター写真の添付で記録の信頼性を担保",
        "・ <b>オープンな共有</b>: SNS 連携で X / Facebook / Instagram / Threads / LINE / リンクコピー まで網羅",
        "・ <b>公式の運営者ページ</b>: サーキット側がスタッフアカウントで自施設情報・告知を更新可能",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    # ===== 3. サービス概要 =====
    story.append(p("3. サービス概要", h1))
    story.append(p("3.1 サービスの基本フロー", h2))
    for i, line in enumerate(
        [
            "ドライバーが走ログにサインアップ (メール+パスワード、無料)",
            "「マイガレージ」に愛車を登録 (メーカー・モデル・改造内容・写真)",
            "「タイム投稿」でサーキット・タイム・タイヤ・天候等を記録",
            "投稿は自動でランキングに反映、SNS でシェア可能",
            "サーキット運営者は自施設ページで来場者のタイムを把握、走行会告知が可能",
        ],
        start=1,
    ):
        story.append(p(f"{i}. {line}", bullet))

    story.append(p("3.2 主要画面", h2))
    story.append(
        jp_table(
            [
                ["画面", "役割"],
                ["トップ", "サービス紹介・最新タイム・サーキット紹介への導線"],
                ["ランキング", "サーキット × 車種 × タイヤで絞り込めるタイム順位表"],
                ["サーキット一覧 / 詳細", "全国の登録サーキット紹介、施設ごとのタイムランキング、イベント告知"],
                ["マイガレージ", "自分の愛車一覧と改造内容、その車両のベストラップ"],
                ["タイム投稿", "セクタータイム・最高速・天候・路面・気温・路温・前後別タイヤまで記録"],
                ["ユーザーページ", "プロフィール、ベストラップ一覧、SNS リンク"],
                ["アカウント設定", "プロフィール編集、SNS リンク登録、退会"],
            ],
            col_widths=[55 * mm, 105 * mm],
        )
    )
    story.append(PageBreak())

    # ===== 4. 実装済み機能仕様 =====
    story.append(p("4. 実装済み機能仕様 (2026年5月時点)", h1))
    story.append(p("走ログは「設計だけ」ではなく <b>すでに本番稼働している</b> プロダクトです。", body))

    story.append(p("4.1 ユーザー機能", h2))
    for line in [
        "・ アカウント: メール+パスワード認証、確認メール、パスワードリセット、退会 (個人情報保護法対応)",
        "・ プロフィール: ユーザー名 / 表示名 / 自己紹介 / 都道府県 / アバター画像",
        "・ SNS リンク: X / Instagram / Threads / Facebook / YouTube / TikTok / Web サイト",
        "・ 退会: アカウント完全削除 (関連データもカスケード削除)",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.2 愛車 (マイガレージ)", h2))
    for line in [
        "・ 複数台の登録に対応",
        "・ メーカー / モデル / 年式 / カラー / 馬力 / 重量 / 自由記述説明",
        "・ 改造内容: 足回り / エンジン / 駆動系 / ブレーキ / 外装 / 内装 を分野ごとに記述",
        "・ 写真ギャラリー (カバー写真 + 複数枚)",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.3 タイム投稿 (中核機能)", h2))
    for line in [
        "・ タイム: 総合タイム、セクター 1〜4 個別、最高速",
        "・ コンディション: 天候 / 路面 / 気温 / 路温",
        "・ タイヤ: ブランド × 銘柄 ドロップダウン + 「その他」手動入力",
        "・ <b>前後で別銘柄に対応</b> (チェックボックスで切替)、サイズも前後別",
        "・ ユーザー手動入力した銘柄は自動でリストに追加",
        "・ エビデンス写真: 計測器・モニター・車載動画キャプチャを複数枚添付",
        "・ 走行日・メモ: 走行会名、アタック何回目、感想等を自由記述",
        "・ 投稿後の編集・削除に対応",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    story.append(p("4.4 ランキング・検索", h2))
    for line in [
        "・ 多次元フィルター: サーキット × メーカー × 車種 × タイヤブランド × 銘柄",
        "・ ベストタイム表示: 各車両のベストラップ",
        "・ モバイル最適化レイアウト",
        "・ 最新投稿スライダーをトップ・ランキングに表示",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.5 サーキット情報", h2))
    for line in [
        "・ 全国 25+ サーキットを登録済み (国際 / ミニ / ショート)",
        "・ 全長、セクター数、所在地、代表コーナー、特徴、公式 URL、紹介文",
        "・ サーキット詳細ページにそのコースのタイムランキング、走行会告知を集約",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.6 サーキット運営者向け機能 (B2B)", h2))
    story.append(p("走ログの大きな差別化ポイントです。", small))
    for line in [
        "・ 公式アカウント: サーキット運営会社のスタッフ用 (個別付与)",
        "・ 自施設ページの編集: 説明文・代表コーナー・特徴・公式 URL・公開状態",
        "・ イベント・告知の発行: 走行会 / レース / お知らせ / 固定スケジュール",
        "・ 運営者には「このサーキットを編集」ボタンが自動表示",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.7 シェア・SNS 連携", h2))
    for line in [
        "・ すべてのタイム詳細ページに 1-click シェアボタン",
        "・ 対応: X / Facebook / Instagram / Threads / LINE / リンクコピー",
        "・ OGP / Twitter Card 対応 (SNS で美しくプレビュー)",
        "・ JSON-LD 構造化データ (SportsEvent / Place / Organization)",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.8 SEO・公開チャネル", h2))
    for line in [
        "・ メタデータ最適化 (title / description / OG / Twitter Card)",
        "・ sitemap.xml 自動生成 (サーキット・ユーザー・ラップ全件)",
        "・ robots.txt 設定済み",
        "・ 構造化データで Google リッチリザルト対応",
    ]:
        story.append(p(line, bullet))

    story.append(p("4.9 通報・モデレーション", h2))
    story.append(p("・ 投稿 (タイム / 愛車 / プロフィール) への通報機能、運営側で確認・対応", bullet))

    story.append(p("4.10 信頼性・運用", h2))
    for line in [
        "・ インフラ: Vercel (Next.js 14 SSR) + Supabase Tokyo (Postgres + Storage + Auth)",
        "・ 死活監視: /api/health エンドポイント (DB 接続疎通確認)",
        "・ アクセス解析: Cloudflare Web Analytics (Cookie 不要)",
        "・ PWA 対応: スマホで「ホーム画面に追加」可能",
        "・ 個人情報保護: 規約 / プライバシーポリシー / 特商法 整備済み",
        "・ 法令遵守: 暗号化通信、Supabase Tokyo (国内データ保管)、退会時の完全削除",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    # ===== 5. ターゲット =====
    story.append(p("5. ターゲット・ユーザー像", h1))
    story.append(p("5.1 メインユーザー (ドライバー)", h2))
    story.append(
        jp_table(
            [
                ["ペルソナ", "特徴"],
                ["タイムアタッカー", "30〜50 代男性、年間 10〜30 走行日。タイヤ・足回り・パーツに数十万〜百万単位の投資"],
                ["走行会レギュラー", "月 1〜2 回ペース、自己ベスト更新がモチベーション、エビデンス共有で技量を可視化"],
                ["若手ドライバー", "20 代、SNS ネイティブ、自分のタイムを発信、先輩のセッティング参考"],
                ["耐久・チーム参戦組", "チーム単位で複数アカウント、同一車両の異なるドライバーを比較"],
            ],
            col_widths=[40 * mm, 120 * mm],
        )
    )

    story.append(p("5.2 B2B パートナー (提案先)", h2))
    story.append(
        jp_table(
            [
                ["区分", "提供できる価値"],
                ["サーキット運営会社", "公式ページ、走行会告知、来場者コミュニティの可視化"],
                ["タイヤメーカー", "自社銘柄の使用実績データ・タイム・条件、プロモコンテンツ展開"],
                ["パーツメーカー", "改造内容と紐づくタイム実データ"],
                ["自動車メーカー", "車種別のサーキット適性データ、ユーザーボイス"],
                ["走行会主催者", "集客チャネル、参加者のタイム集計"],
                ["モータースポーツ媒体", "コンテンツ提携、データ引用"],
                ["損害保険・ファイナンス", "サーキット走行特化のターゲティング広告"],
            ],
            col_widths=[55 * mm, 105 * mm],
        )
    )
    story.append(PageBreak())

    # ===== 6. 収益化 =====
    story.append(p("6. 収益化モデル", h1))
    story.append(
        p(
            "コア機能 (タイム投稿・閲覧・シェア・ランキング) は永久無料を維持し、以下のレイヤーで収益化します。",
            body,
        )
    )

    story.append(p("6.1 ドライバー向け (B2C)", h2))
    story.append(
        jp_table(
            [
                ["プラン", "月額目安", "提供内容"],
                ["Free", "0円", "全コア機能"],
                [
                    "Premium",
                    "480円程度",
                    "写真大量アップロード、ベストラップ推移グラフ、CSV、広告非表示、プロフィール装飾",
                ],
                [
                    "Pro",
                    "980円程度",
                    "上記+チームアカウント、複数車両のセッティング比較、コーチング機能",
                ],
            ],
            col_widths=[35 * mm, 30 * mm, 95 * mm],
        )
    )
    story.append(p("※ Stripe による課金基盤は実装済み。フラグでON/OFF可。", small))

    story.append(p("6.2 サーキット運営者向け (B2B)", h2))
    story.append(
        jp_table(
            [
                ["プラン", "内容"],
                [
                    "公式運営者アカウント (無料)",
                    "自施設ページ編集、走行会告知 (基本機能)",
                ],
                [
                    "プロモーションプラン (有料・要相談)",
                    "トップページ露出、おすすめサーキット表示、ニュースレター配信、走行会への送客レポート",
                ],
            ],
            col_widths=[55 * mm, 105 * mm],
        )
    )

    story.append(p("6.3 メーカー・パートナー向け (B2B)", h2))
    story.append(
        jp_table(
            [
                ["メニュー", "内容"],
                ["タイヤブランド公式バッジ", "ブランドプリセット表示優先、ブランドページ"],
                ["データ提供 (匿名集計)", "月次レポート (使用シェア / サーキット別タイム分布 / 装着車両分布)"],
                ["タイアップ記事・特集", "新製品リリース時のフィーチャー枠"],
                ["広告枠", "サーキット詳細・ランキングページ等への自然なバナー配信"],
                ["イベントスポンサー連携", "走ログ主催の走行会・タイムアタック大会への協賛"],
            ],
            col_widths=[50 * mm, 110 * mm],
        )
    )
    story.append(PageBreak())

    # ===== 7. 競合・差別化 =====
    story.append(p("7. 競合・差別化", h1))
    story.append(p("7.1 既存の選択肢との比較", h2))
    story.append(
        jp_table(
            [
                ["項目", "ブログ", "SNS", "サーキット公式", "走ログ"],
                ["検索性", "低", "中", "中", "高 (多次元フィルター)"],
                ["データ構造化", "×", "×", "△", "○"],
                ["エビデンス", "△", "△", "○", "○ (写真添付)"],
                ["横断比較", "×", "×", "×", "○"],
                ["公式情報統合", "×", "×", "○ (自社のみ)", "○ (横断)"],
                ["SNS シェア", "△", "○", "×", "○ (OGP最適化)"],
                ["改造内容との紐付け", "△", "△", "×", "○"],
                ["タイヤ前後別記録", "×", "×", "×", "○"],
            ],
            col_widths=[40 * mm, 22 * mm, 22 * mm, 32 * mm, 44 * mm],
        )
    )

    story.append(p("7.2 走ログの強み", h2))
    for line in [
        "1. データ構造の妥協のなさ (タイヤ前後別、セクター 4 個別、気温・路温・最高速)",
        "2. B2B 機能内蔵 (運営者・メーカー向けの管理コンソール構想)",
        "3. 国内データ保管 (Supabase Tokyo)",
        "4. オープンな思想 (SNS のように個人投稿の集合体)",
        "5. モバイルファーストの UI",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    # ===== 8. パートナーシップ提案 =====
    story.append(p("8. パートナーシップ提案", h1))

    story.append(p("8.1 サーキット運営者の皆様へ", h2))
    story.append(p("ご提供内容 (無料)", h3))
    for line in [
        "・ 自施設の公式ページ (説明文・代表コーナー・特徴・地図リンク・公式 URL)",
        "・ 走行会・レース・お知らせの掲載",
        "・ 自施設で出ているラップタイム一覧 (来場者の生の声)",
        "・ スタッフアカウントによる更新権限の付与",
    ]:
        story.append(p(line, bullet))
    story.append(p("必要なもの: ご担当者のメールアドレス / ロゴ・代表写真 (任意)", body))
    story.append(p("期待される効果: 走行会の集客導線、リピート顧客の見える化、自施設のブランディング・SEO 強化", body))

    story.append(p("8.2 タイヤメーカー・パーツメーカーの皆様へ", h2))
    for line in [
        "・ 使用実績データ (御社銘柄の使用サーキット・車両・タイム・条件、月次集計、匿名化済み)",
        "・ 公式バッジ表示 (ブランド公式マーク)",
        "・ 新製品リリース連動 (製品ページ作成、特集枠)",
        "・ サンプリング協力 (モニター企画への参加者募集)",
    ]:
        story.append(p(line, bullet))
    story.append(p("コラボ事例案", h3))
    for line in [
        "・ 「○○ × 走ログ 春のタイムアタック企画」期間中投稿者にプレゼント抽選",
        "・ 「銘柄別ランキング特集」自社銘柄のサーキット別ベストタイム公開",
        "・ 「新製品発表後の最初のタイム投稿で先着 100 名にプレゼント」",
    ]:
        story.append(p(line, bullet))

    story.append(p("8.3 走行会・大会主催者の皆様へ", h2))
    for line in [
        "・ イベント告知ページ (無料)",
        "・ 参加者のタイム集計テンプレート",
        "・ イベント特化ページ作成 (有料・要相談)",
        "・ 主催者ロゴ・告知の常設掲載",
    ]:
        story.append(p(line, bullet))

    story.append(p("8.4 媒体・モータースポーツメディアの皆様へ", h2))
    for line in [
        "・ 走ログ内データの記事引用 (クレジット表記)",
        "・ 共同企画記事",
        "・ 走ログユーザーへのアンケート協力",
        "・ データ提供 (要相談)",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    # ===== 9. データ価値 =====
    story.append(p("9. データ・分析価値", h1))
    story.append(
        p(
            "走ログは「ユーザー投稿型のサーキット走行データベース」として、以下の集計データを保有・蓄積しています。",
            body,
        )
    )
    for line in [
        "・ サーキット別の <b>車種シェア・タイヤシェア・年代シェア</b>",
        "・ 季節別・天候別のタイム分布",
        "・ 同一車種における改造内容とタイムの相関",
        "・ タイヤ銘柄ごとの使用率・好まれるサーキット",
        "・ ユーザーの SNS 連携率、ピーク時間帯、地域分布",
    ]:
        story.append(p(line, bullet))
    story.append(
        p(
            "これらは個人を特定しない集計形式で、メーカー・媒体・サーキット運営者にレポートとして提供可能です。",
            body,
        )
    )

    # ===== 10. ロードマップ =====
    story.append(p("10. 開発状況・ロードマップ", h1))

    story.append(p("10.1 完了済み (2026年5月時点)", h2))
    for line in [
        "・ ユーザー認証、プロフィール、SNS 連携",
        "・ 愛車登録・改造履歴",
        "・ タイム投稿 (前後別タイヤ含む)",
        "・ ランキング・多次元フィルター",
        "・ サーキット 25+ 登録、運営者管理機能",
        "・ イベント告知、通報・モデレーション",
        "・ PWA、SEO、構造化データ",
        "・ 利用規約・プライバシー・特商法",
        "・ 死活監視、アクセス解析",
    ]:
        story.append(p(line, bullet))

    story.append(p("10.2 短期 (次の 3 か月)", h2))
    for line in [
        "・ ベストタイム推移のグラフ可視化",
        "・ 同一車種のタイム比較ダッシュボード",
        "・ 走行会・イベントカレンダー (横断)",
        "・ 通知機能 (記録更新、フォロー中ユーザーの新規投稿)",
        "・ スマホ写真の EXIF からの走行日自動入力",
    ]:
        story.append(p(line, bullet))

    story.append(p("10.3 中期 (6〜12 か月)", h2))
    for line in [
        "・ メーカー向け管理コンソール (自社銘柄の使用統計閲覧)",
        "・ チームアカウント機能",
        "・ API 公開 (パートナー向け)",
        "・ 動画 (オンボード) アップロード",
        "・ AI を用いた走行ライン分析 (将来構想)",
    ]:
        story.append(p(line, bullet))
    story.append(PageBreak())

    # ===== 11. 体制・連絡先 =====
    story.append(p("11. 運営体制", h1))
    story.append(p("11.1 開発・運営", h2))
    for line in [
        "・ 事業者: RBS",
        "・ 責任者: 久米田 昴",
        "・ 開発スタイル: モダン Web 技術スタック (Next.js / TypeScript / Supabase) による継続的デプロイ",
        "・ デプロイ頻度: 機能・バグ修正は即時反映可能",
    ]:
        story.append(p(line, bullet))

    story.append(p("11.2 連絡先", h2))
    story.append(
        jp_table(
            [
                ["用途", "連絡先"],
                ["一般お問い合わせ", "hashilog2024@gmail.com"],
                ["サーキット提携", "hashilog2024@gmail.com"],
                ["メディア・取材", "hashilog2024@gmail.com"],
                ["メーカー協業", "hashilog2024@gmail.com"],
                ["セキュリティ報告", "hashilog2024@gmail.com"],
            ],
            col_widths=[55 * mm, 105 * mm],
        )
    )
    story.append(p("Web フォーム: https://hashilog.jp/contact", small))

    # ===== 12. 締め =====
    story.append(p("12. 最後に", h1))
    story.append(
        p(
            "走ログは「サーキットを走るすべての人が、自分のタイムをもっと誇れる場所」を目指しています。"
            "サーキット運営の方、メーカーの方、走行会主催者の方、媒体の方、いずれにとっても、"
            "走ログは「自分の取り組みをドライバーに見える形で届ける」ためのチャネルになり得ます。"
            "ぜひ一度、サービスを実際に触っていただき、提携の可能性についてお話しさせてください。",
            body,
        )
    )
    story.append(Spacer(1, 12 * mm))
    story.append(p("走ログ (Hashilog)", h2))
    story.append(
        jp_table(
            [
                ["Web", "https://hashilog.jp"],
                ["事業者", "RBS"],
                ["責任者", "久米田 昴"],
                ["お問い合わせ", "hashilog2024@gmail.com"],
            ],
            col_widths=[40 * mm, 120 * mm],
        )
    )

    return story


# ---------------------------------------------------------------------------
# Page numbering footer
# ---------------------------------------------------------------------------
def on_page(canvas, doc):
    canvas.saveState()
    # 1ページ目以外は右上に小さいロゴを置く (カバーは大きく中央なので除外)
    if doc.page > 1 and LOGO_PATH.exists():
        logo_w = 22 * mm
        logo_h = logo_w * (625 / 1181)
        canvas.drawImage(
            str(LOGO_PATH),
            A4[0] - 20 * mm - logo_w,
            A4[1] - 14 * mm - logo_h,
            width=logo_w,
            height=logo_h,
            mask="auto",
        )
    canvas.setFont(JP_SANS, 8)
    canvas.setFillColor(colors.HexColor("#71717a"))
    canvas.drawString(
        20 * mm,
        12 * mm,
        "走ログ (Hashilog) 事業提案書 v1.0  /  RBS  /  hashilog2024@gmail.com",
    )
    canvas.drawRightString(
        A4[0] - 20 * mm,
        12 * mm,
        f"P. {doc.page}",
    )
    canvas.restoreState()


def main():
    out = Path(__file__).resolve().parents[1] / "docs" / "PROPOSAL.pdf"
    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=20 * mm,
        title="走ログ 事業提案書",
        author="RBS / 久米田 昴",
    )
    doc.build(build_story(), onFirstPage=on_page, onLaterPages=on_page)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
