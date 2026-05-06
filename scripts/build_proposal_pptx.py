"""走ログ 事業提案書 PPTX 生成スクリプト (簡潔版).

docs/PROPOSAL.md の内容を約 10 枚のピッチデックに圧縮して docs/PROPOSAL.pptx に書き出す。
- 16:9
- 日本語: Yu Gothic UI (Windows 標準)
- ロゴ: public/logo.png をカバー大表示 + 各スライド右上に小さく配置

実行:
    python scripts/build_proposal_pptx.py
"""

from __future__ import annotations

from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
JP_FONT = "Yu Gothic UI"
ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "logo.png"

# Brand palette
RED = RGBColor(0xE1, 0x06, 0x00)
INK = RGBColor(0x18, 0x18, 0x1B)
GRAY_700 = RGBColor(0x3F, 0x3F, 0x46)
GRAY_500 = RGBColor(0x71, 0x71, 0x7A)
GRAY_200 = RGBColor(0xE4, 0xE4, 0xE7)
GRAY_50 = RGBColor(0xFA, 0xFA, 0xFA)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------
def add_textbox(slide, left, top, width, height, *, fill=None):
    box = slide.shapes.add_textbox(left, top, width, height)
    if fill is not None:
        box.fill.solid()
        box.fill.fore_color.rgb = fill
        box.line.fill.background()
    return box.text_frame


def set_run(run, text, *, size=14, bold=False, color=INK):
    run.text = text
    run.font.name = JP_FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def set_para(tf, text, *, size=14, bold=False, color=INK, align=PP_ALIGN.LEFT, clear=True):
    if clear and tf.paragraphs and tf.paragraphs[0].text == "":
        para = tf.paragraphs[0]
    else:
        para = tf.add_paragraph()
    para.alignment = align
    run = para.add_run()
    set_run(run, text, size=size, bold=bold, color=color)
    return para


def add_bullets(tf, items, *, size=13, color=INK):
    """First call uses the existing first paragraph if it's empty."""
    first_done = False
    for line in items:
        if not first_done and tf.paragraphs and tf.paragraphs[0].text == "":
            para = tf.paragraphs[0]
            first_done = True
        else:
            para = tf.add_paragraph()
        para.alignment = PP_ALIGN.LEFT
        para.line_spacing = 1.2
        run = para.add_run()
        set_run(run, "・ " + line, size=size, color=color)


def slide_blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def add_logo_corner(slide, *, height_in=0.45):
    """Place the logo in the top-right corner of a content slide."""
    if not LOGO.exists():
        return
    # logo.png aspect 1181:625 ~= 1.89
    h = Inches(height_in)
    w = Inches(height_in * (1181 / 625))
    left = Inches(13.333) - w - Inches(0.35)
    top = Inches(0.25)
    slide.shapes.add_picture(str(LOGO), left, top, width=w, height=h)


def add_section_band(slide, num, title):
    """Top band: red strip with section number + title."""
    strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.95))
    strip.fill.solid()
    strip.fill.fore_color.rgb = RED
    strip.line.fill.background()
    tf = strip.text_frame
    tf.margin_left = Inches(0.55)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    set_run(r, f"{num}.  {title}", size=22, bold=True, color=WHITE)


def add_footer(slide):
    tf = add_textbox(slide, Inches(0), Inches(7.05), Inches(13.333), Inches(0.4))
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    set_run(
        r,
        "走ログ (Hashilog)  v1.0  /  RBS  /  hashilog2024@gmail.com  /  https://hashilog.jp",
        size=9,
        color=GRAY_500,
    )


# ---------------------------------------------------------------------------
# Higher-level slide types
# ---------------------------------------------------------------------------
def slide_cover(prs):
    s = slide_blank(prs)

    # Logo (大きめ・中央上)
    if LOGO.exists():
        h = Inches(2.4)
        w = Inches(2.4 * (1181 / 625))
        left = (Inches(13.333) - w) / 2
        s.shapes.add_picture(str(LOGO), left, Inches(0.7), width=w, height=h)

    # Red bar
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(3.55), Inches(13.333), Inches(0.10))
    bar.fill.solid()
    bar.fill.fore_color.rgb = RED
    bar.line.fill.background()

    # Title
    tf = add_textbox(s, Inches(0.7), Inches(3.85), Inches(11.9), Inches(1.2))
    set_para(tf, "事業提案書", size=44, bold=True, color=INK, align=PP_ALIGN.CENTER)

    tf = add_textbox(s, Inches(0.7), Inches(5.1), Inches(11.9), Inches(0.7))
    set_para(
        tf,
        "日本のサーキットタイムを、もっと面白く。もっと信頼できるものに。",
        size=18,
        color=GRAY_500,
        align=PP_ALIGN.CENTER,
    )

    tf = add_textbox(s, Inches(0.7), Inches(6.2), Inches(11.9), Inches(0.8))
    set_para(
        tf,
        "RBS  /  久米田 昴       https://hashilog.jp       hashilog2024@gmail.com",
        size=12,
        color=GRAY_700,
        align=PP_ALIGN.CENTER,
    )


def slide_two_col(prs, num, title, lead, columns):
    """2 カラム式の汎用スライド。"""
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_logo_corner(s)
    add_footer(s)

    if lead:
        tf = add_textbox(s, Inches(0.7), Inches(1.2), Inches(12), Inches(0.8))
        set_para(tf, lead, size=14, color=GRAY_700)
        top = Inches(2.0)
    else:
        top = Inches(1.4)

    col_w = Inches(6.0)
    for i, (heading, items) in enumerate(columns[:2]):
        left = Inches(0.7) + i * (col_w + Inches(0.3))
        # Heading
        tf = add_textbox(s, left, top, col_w, Inches(0.6))
        set_para(tf, heading, size=18, bold=True, color=RED)
        # Bullets
        tf = add_textbox(s, left, top + Inches(0.6), col_w, Inches(4.5))
        add_bullets(tf, items, size=13)


def slide_bullets(prs, num, title, lead, items):
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_logo_corner(s)
    add_footer(s)

    if lead:
        tf = add_textbox(s, Inches(0.7), Inches(1.2), Inches(12), Inches(0.8))
        set_para(tf, lead, size=14, color=GRAY_700)
        top = Inches(2.0)
    else:
        top = Inches(1.4)

    tf = add_textbox(s, Inches(0.7), top, Inches(12), Inches(5.0))
    add_bullets(tf, items, size=15)


def slide_table(prs, num, title, lead, headers, rows, col_widths_emu=None):
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_logo_corner(s)
    add_footer(s)

    if lead:
        tf = add_textbox(s, Inches(0.7), Inches(1.2), Inches(12), Inches(0.8))
        set_para(tf, lead, size=14, color=GRAY_700)
        top = Inches(2.0)
    else:
        top = Inches(1.3)

    cols = len(headers)
    rows_count = len(rows) + 1

    table_height = min(Inches(0.5) + Inches(0.45) * len(rows), Inches(5.2))
    table_shape = s.shapes.add_table(
        rows_count, cols, Inches(0.7), top, Inches(11.9), table_height
    )
    table = table_shape.table

    if col_widths_emu:
        for i, w in enumerate(col_widths_emu):
            table.columns[i].width = w

    # Header
    for ci, h in enumerate(headers):
        cell = table.cell(0, ci)
        cell.fill.solid()
        cell.fill.fore_color.rgb = GRAY_50
        cell.text_frame.clear()
        p = cell.text_frame.paragraphs[0]
        r = p.add_run()
        set_run(r, h, size=12, bold=True, color=INK)

    # Body
    for ri, row in enumerate(rows, start=1):
        for ci, val in enumerate(row):
            cell = table.cell(ri, ci)
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE
            cell.text_frame.clear()
            p = cell.text_frame.paragraphs[0]
            r = p.add_run()
            set_run(r, val, size=11, color=INK)


def slide_three_col(prs, num, title, lead, columns):
    """3 カラム式 (実装済み機能・パートナーシップ等の密度が高いスライド向け)."""
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_logo_corner(s)
    add_footer(s)

    if lead:
        tf = add_textbox(s, Inches(0.7), Inches(1.2), Inches(12), Inches(0.8))
        set_para(tf, lead, size=14, color=GRAY_700)
        top = Inches(2.0)
    else:
        top = Inches(1.4)

    gap = Inches(0.25)
    total_w = Inches(11.9)
    col_w = (total_w - gap * 2) / 3
    for i, (heading, items) in enumerate(columns[:3]):
        left = Inches(0.7) + i * (col_w + gap)
        tf = add_textbox(s, left, top, col_w, Inches(0.6))
        set_para(tf, heading, size=15, bold=True, color=RED)
        tf = add_textbox(s, left, top + Inches(0.55), col_w, Inches(4.5))
        add_bullets(tf, items, size=11)


def slide_closing(prs):
    s = slide_blank(prs)

    # Top red band
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.55))
    bar.fill.solid()
    bar.fill.fore_color.rgb = RED
    bar.line.fill.background()
    add_logo_corner(s, height_in=0.45)
    add_footer(s)

    # Big quote
    tf = add_textbox(s, Inches(0.7), Inches(1.2), Inches(11.9), Inches(2.3))
    set_para(tf, "サーキットを走るすべての人が、", size=32, bold=True, color=INK)
    set_para(
        tf,
        "自分のタイムをもっと誇れる場所へ。",
        size=32,
        bold=True,
        color=RED,
        clear=False,
    )

    tf = add_textbox(s, Inches(0.7), Inches(3.6), Inches(11.9), Inches(1.0))
    set_para(
        tf,
        "ぜひ一度、サービスを実際に触っていただき、提携の可能性についてお話しさせてください。",
        size=16,
        color=GRAY_700,
    )

    # Contact box
    box = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(0.7),
        Inches(4.7),
        Inches(11.9),
        Inches(2.0),
    )
    box.fill.solid()
    box.fill.fore_color.rgb = GRAY_50
    box.line.color.rgb = GRAY_200
    tf = box.text_frame
    tf.margin_left = Inches(0.4)
    tf.margin_top = Inches(0.3)
    set_para(tf, "走ログ (Hashilog)", size=22, bold=True, color=INK)
    set_para(tf, "Web   :  https://hashilog.jp", size=14, color=GRAY_700, clear=False)
    set_para(tf, "事業者:  RBS", size=14, color=GRAY_700, clear=False)
    set_para(tf, "責任者:  久米田 昴", size=14, color=GRAY_700, clear=False)
    set_para(
        tf,
        "お問い合わせ:  hashilog2024@gmail.com",
        size=14,
        color=GRAY_700,
        clear=False,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def build():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # 1. Cover
    slide_cover(prs)

    # 2. Executive Summary + 提供価値
    slide_two_col(
        prs,
        "1",
        "サービス概要・提供価値",
        "サーキットで刻んだタイムを、愛車情報と一緒に共有できる Web サービス。本番稼働中。",
        [
            (
                "ドライバーに",
                [
                    "タイム履歴・改造履歴・タイヤ履歴を1か所で管理",
                    "X / Insta / Threads / FB / LINE で 1-click シェア",
                    "同条件ドライバーのセッティングを参考にできる",
                    "前後別タイヤ・気温・路温まで記録できる細かさ",
                ],
            ),
            (
                "事業者に",
                [
                    "サーキット運営: 公式ページ + 走行会告知 (無料)",
                    "タイヤ・パーツメーカー: 自社銘柄の使用実績データ",
                    "イベント主催者: 走行会の集客チャネル",
                    "媒体: 走行データの記事引用・共同企画",
                ],
            ),
        ],
    )

    # 3. 課題と解決
    slide_two_col(
        prs,
        "2",
        "市場背景と解決アプローチ",
        "国内 30+ サーキット、参加層は数万人。30〜50 代男性中心で可処分所得が高い。",
        [
            (
                "現状の課題",
                [
                    "個人ブログ・SNS のスクショ・LINE グループに散在",
                    "サーキット間で形式バラバラ、車両/タイヤと紐づかない",
                    "走行会の Excel は主催者依存、横断比較できない",
                    "過去データに辿り着けない、検索性ゼロ",
                ],
            ),
            (
                "走ログのアプローチ",
                [
                    "検索可能な構造化フォーマット (多次元フィルター)",
                    "エビデンス文化 (計測機器・モニター写真の添付)",
                    "SNS 連携で OGP 最適化、外部拡散を前提",
                    "サーキット運営者の公式ページを横断的に統合",
                ],
            ),
        ],
    )

    # 4. 実装済み機能 (3カラムに圧縮)
    slide_three_col(
        prs,
        "3",
        "実装済み機能ハイライト",
        "「設計だけ」ではなく、すでに本番稼働しているプロダクト (2026年5月時点)。",
        [
            (
                "ユーザー / 愛車",
                [
                    "メール+パスワード認証、退会で完全削除",
                    "プロフィール: 自己紹介・都道府県・SNS 6 種",
                    "マイガレージ: 複数台、改造内容を分野別に",
                    "写真ギャラリー (カバー + 複数枚)",
                ],
            ),
            (
                "タイム投稿 (中核)",
                [
                    "総合タイム、セクター 1〜4、最高速",
                    "天候・路面・気温・路温",
                    "前後別タイヤ銘柄・サイズ (差別化)",
                    "ユーザー入力銘柄は自動登録",
                    "エビデンス写真複数枚、編集・削除可",
                ],
            ),
            (
                "ランキング / B2B / 信頼性",
                [
                    "サーキット × 車種 × タイヤで多次元フィルター",
                    "全国 25+ サーキット登録済み",
                    "サーキット運営者の公式アカウント・告知機能",
                    "OGP/JSON-LD/PWA/sitemap 完備",
                    "Vercel + Supabase Tokyo (国内データ保管)",
                ],
            ),
        ],
    )

    # 5. ターゲット & B2B 候補
    slide_two_col(
        prs,
        "4",
        "ターゲット",
        "ドライバーは可処分所得が高くロイヤリティが高い。B2B は複数業界に展開可能。",
        [
            (
                "メインユーザー (ドライバー)",
                [
                    "タイムアタッカー: 30〜50 代、年 10〜30 走行日",
                    "走行会レギュラー: 月 1〜2 回、エビデンス志向",
                    "若手 SNS ネイティブ: 20 代、発信意欲旺盛",
                    "耐久・チーム参戦: 同一車両で複数ドライバー比較",
                ],
            ),
            (
                "B2B パートナー候補",
                [
                    "サーキット運営会社 (公式ページ+告知)",
                    "タイヤ・パーツメーカー (使用実績データ)",
                    "自動車メーカー (車種別サーキット適性)",
                    "走行会主催者・モータースポーツ媒体",
                    "損保・ファイナンス (ターゲティング広告)",
                ],
            ),
        ],
    )

    # 6. 収益化
    slide_table(
        prs,
        "5",
        "収益化モデル",
        "コア機能は永久無料を維持。Stripe 課金基盤実装済 (フラグでON/OFF)。",
        ["対象", "プラン / メニュー", "内容"],
        [
            ["B2C", "Free  (0円)", "全コア機能 (タイム投稿・閲覧・シェア・ランキング)"],
            ["B2C", "Premium  (480円/月程度)", "写真大量UL、推移グラフ、CSV、広告非表示"],
            ["B2C", "Pro  (980円/月程度)", "チームアカウント、複数車両比較、コーチング"],
            ["B2B サーキット", "公式運営者 (無料)", "自施設ページ編集・走行会告知"],
            ["B2B サーキット", "プロモーション (要相談)", "トップ露出・ニュースレター・送客レポート"],
            ["B2B メーカー", "公式バッジ / データ提供", "ブランド表示優先・月次集計レポート"],
            ["B2B メーカー", "タイアップ・広告枠・スポンサー", "新製品特集・バナー・走ログ大会協賛"],
        ],
        col_widths_emu=[Inches(2.0), Inches(3.6), Inches(6.3)],
    )

    # 7. 競合・差別化
    slide_table(
        prs,
        "6",
        "競合・差別化",
        "既存の選択肢と比較した走ログのポジション。",
        ["項目", "ブログ", "SNS", "サーキット公式", "走ログ"],
        [
            ["検索性", "低", "中", "中", "高 (多次元)"],
            ["データ構造化", "×", "×", "△", "○"],
            ["エビデンス", "△", "△", "○", "○"],
            ["横断比較", "×", "×", "×", "○"],
            ["公式情報統合", "×", "×", "○ (自社のみ)", "○ (横断)"],
            ["SNS シェア最適化", "△", "○", "×", "○"],
            ["改造内容と紐付け", "△", "△", "×", "○"],
            ["タイヤ前後別記録", "×", "×", "×", "○"],
        ],
    )

    # 8. パートナーシップ提案 (3カラムに圧縮)
    slide_three_col(
        prs,
        "7",
        "パートナーシップ提案",
        "業種別にご提供できる内容。詳細は個別ご相談ください。",
        [
            (
                "サーキット運営者",
                [
                    "公式ページ編集 (説明・代表コーナー・URL)",
                    "走行会・レース・お知らせ告知",
                    "自施設のラップタイム集計",
                    "スタッフアカウント発行",
                    "→ 必要なのはご担当のメアドのみ。無料。",
                ],
            ),
            (
                "タイヤ・パーツメーカー",
                [
                    "使用実績データ (匿名化集計、月次)",
                    "ブランド公式バッジ表示",
                    "新製品リリース連動の特集枠",
                    "コラボ企画 (タイムアタック / プレゼント)",
                    "サンプリング協力 (モニター募集)",
                ],
            ),
            (
                "走行会主催者・媒体",
                [
                    "イベント告知ページ (無料)",
                    "参加者のタイム集計テンプレート",
                    "イベント特化ページ作成 (要相談)",
                    "走ログ内データの記事引用 (媒体)",
                    "共同企画記事・アンケート協力",
                ],
            ),
        ],
    )

    # 9. ロードマップ
    slide_two_col(
        prs,
        "8",
        "ロードマップ",
        None,
        [
            (
                "完了済み (2026年5月)",
                [
                    "認証 / プロフィール / SNS 連携",
                    "愛車登録・改造履歴",
                    "タイム投稿 (前後別タイヤ含む)",
                    "ランキング・多次元フィルター",
                    "サーキット 25+ 登録 / 運営者管理",
                    "通報・モデレーション",
                    "PWA / SEO / 構造化データ",
                    "規約・プライバシー・特商法整備",
                ],
            ),
            (
                "短期〜中期 (3〜12 か月)",
                [
                    "ベストタイム推移グラフ",
                    "同一車種比較ダッシュボード",
                    "走行会・イベントカレンダー (横断)",
                    "通知機能 (記録更新・フォロー)",
                    "メーカー向け管理コンソール",
                    "チームアカウント / API 公開",
                    "動画オンボードアップロード",
                    "AI 走行ライン分析 (将来)",
                ],
            ),
        ],
    )

    # 10. クロージング
    slide_closing(prs)

    out = ROOT / "docs" / "PROPOSAL.pptx"
    prs.save(str(out))
    print(f"Wrote {out} ({len(prs.slides)} slides)")


if __name__ == "__main__":
    build()
