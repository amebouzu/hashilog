"""走ログ 事業提案書 PPTX 生成スクリプト.

docs/PROPOSAL.md の内容を元に、ピッチデック形式の PowerPoint を docs/PROPOSAL.pptx に書き出す。
日本語フォントは Windows 標準の "Yu Gothic UI" を使用 (代替: "メイリオ" / "Noto Sans JP")。

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


JP_FONT = "Yu Gothic UI"

# Brand palette
RED = RGBColor(0xE1, 0x06, 0x00)        # racing red
INK = RGBColor(0x18, 0x18, 0x1B)        # near-black
GRAY_700 = RGBColor(0x3F, 0x3F, 0x46)
GRAY_500 = RGBColor(0x71, 0x71, 0x7A)
GRAY_200 = RGBColor(0xE4, 0xE4, 0xE7)
GRAY_50 = RGBColor(0xFA, 0xFA, 0xFA)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)


def add_textbox(slide, left, top, width, height, *, fill=None) -> "_Frame":
    box = slide.shapes.add_textbox(left, top, width, height)
    if fill is not None:
        box.fill.solid()
        box.fill.fore_color.rgb = fill
        box.line.fill.background()
    return box.text_frame


def set_run(run, text: str, *, size=14, bold=False, color=INK):
    run.text = text
    run.font.name = JP_FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def set_para(tf, text: str, *, size=14, bold=False, color=INK, align=PP_ALIGN.LEFT, clear=True):
    if clear and tf.paragraphs and tf.paragraphs[0].text == "":
        para = tf.paragraphs[0]
    else:
        para = tf.add_paragraph()
    para.alignment = align
    run = para.add_run()
    set_run(run, text, size=size, bold=bold, color=color)
    return para


def add_bullets(tf, items, *, size=14, color=INK, indent_first=True):
    """Add list-style bullets. First call uses the existing first paragraph."""
    first_done = False
    for line in items:
        if not first_done and indent_first and tf.paragraphs and tf.paragraphs[0].text == "":
            para = tf.paragraphs[0]
            first_done = True
        else:
            para = tf.add_paragraph()
        para.alignment = PP_ALIGN.LEFT
        run = para.add_run()
        set_run(run, "・ " + line, size=size, color=color)


# ---------------------------------------------------------------------------
# Slide builders
# ---------------------------------------------------------------------------
def add_section_band(slide, num: str, title: str):
    """Slide top band with section number on the left and title centered."""
    # Red strip
    strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.55))
    strip.fill.solid()
    strip.fill.fore_color.rgb = RED
    strip.line.fill.background()
    tf = strip.text_frame
    tf.margin_left = Inches(0.5)
    tf.margin_top = Inches(0.05)
    para = tf.paragraphs[0]
    para.alignment = PP_ALIGN.LEFT
    run = para.add_run()
    set_run(run, f"  {num}.  {title}", size=18, bold=True, color=WHITE)


def add_footer(slide):
    tf = add_textbox(slide, Inches(0), Inches(7.05), Inches(13.333), Inches(0.4))
    para = tf.paragraphs[0]
    para.alignment = PP_ALIGN.CENTER
    run = para.add_run()
    set_run(
        run,
        "走ログ (Hashilog) 事業提案書  v1.0  /  RBS  /  hashilog2024@gmail.com",
        size=9,
        color=GRAY_500,
    )


def slide_blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])  # blank


def slide_cover(prs):
    s = slide_blank(prs)
    # red bar
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(2.6), Inches(13.333), Inches(0.12))
    bar.fill.solid()
    bar.fill.fore_color.rgb = RED
    bar.line.fill.background()

    # Title
    tf = add_textbox(s, Inches(0.7), Inches(2.85), Inches(11.9), Inches(1.6))
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    set_run(r, "走ログ (Hashilog) 事業提案書", size=44, bold=True, color=INK)

    # Sub
    tf = add_textbox(s, Inches(0.7), Inches(4.4), Inches(11.9), Inches(0.8))
    p = tf.paragraphs[0]
    r = p.add_run()
    set_run(
        r,
        "日本のサーキットタイムを、もっと面白く。もっと信頼できるものに。",
        size=20,
        color=GRAY_500,
    )

    # Footer block
    tf = add_textbox(s, Inches(0.7), Inches(6.0), Inches(11.9), Inches(0.9))
    p = tf.paragraphs[0]
    r = p.add_run()
    set_run(r, "RBS  /  久米田 昴", size=14, bold=True, color=INK)
    p2 = tf.add_paragraph()
    r2 = p2.add_run()
    set_run(
        r2,
        "https://hashilog.jp    hashilog2024@gmail.com",
        size=12,
        color=GRAY_500,
    )


def slide_section(prs, num: str, title: str, lead: str | None, bullets: list[str] | None = None,
                  *, columns: list[tuple[str, list[str]]] | None = None):
    """Generic section slide: top band + (lead) + bullets, or 2-column variant."""
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_footer(s)

    if lead:
        tf = add_textbox(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.7))
        set_para(tf, lead, size=14, color=GRAY_700)

    top = Inches(1.6) if lead else Inches(1.0)

    if columns:
        col_w = Inches(6.0)
        for i, (heading, items) in enumerate(columns[:2]):
            left = Inches(0.7) + i * (col_w + Inches(0.3))
            tf = add_textbox(s, left, top, col_w, Inches(5.0))
            set_para(tf, heading, size=18, bold=True, color=RED)
            add_bullets(tf, items, size=13)
        return

    if bullets:
        tf = add_textbox(s, Inches(0.7), top, Inches(12), Inches(5.4))
        add_bullets(tf, bullets, size=15)


def slide_table(prs, num: str, title: str, lead: str | None, headers: list[str], rows: list[list[str]],
                col_widths_emu: list[int] | None = None):
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_footer(s)

    if lead:
        tf = add_textbox(s, Inches(0.7), Inches(0.85), Inches(12), Inches(0.7))
        set_para(tf, lead, size=14, color=GRAY_700)

    top = Inches(1.6) if lead else Inches(1.0)
    cols = len(headers)
    rows_count = len(rows) + 1  # + header

    table_height = Inches(0.45) + Inches(0.45) * len(rows)
    if table_height > Inches(5.3):
        table_height = Inches(5.3)

    table_shape = s.shapes.add_table(
        rows_count, cols, Inches(0.7), top, Inches(11.9), table_height
    )
    table = table_shape.table

    # Column widths
    if col_widths_emu:
        for i, w in enumerate(col_widths_emu):
            table.columns[i].width = w

    # Header row
    for ci, h in enumerate(headers):
        cell = table.cell(0, ci)
        cell.fill.solid()
        cell.fill.fore_color.rgb = GRAY_50
        cell.text_frame.clear()
        p = cell.text_frame.paragraphs[0]
        r = p.add_run()
        set_run(r, h, size=12, bold=True, color=INK)

    # Body rows
    for ri, row in enumerate(rows, start=1):
        for ci, val in enumerate(row):
            cell = table.cell(ri, ci)
            cell.fill.solid()
            cell.fill.fore_color.rgb = WHITE
            cell.text_frame.clear()
            p = cell.text_frame.paragraphs[0]
            r = p.add_run()
            set_run(r, val, size=11, color=INK)


def slide_quote(prs, num: str, title: str, big_text: str, sub_text: str | None = None):
    s = slide_blank(prs)
    add_section_band(s, num, title)
    add_footer(s)

    tf = add_textbox(s, Inches(0.7), Inches(2.0), Inches(11.9), Inches(2.5))
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r = p.add_run()
    set_run(r, big_text, size=32, bold=True, color=INK)

    if sub_text:
        tf2 = add_textbox(s, Inches(0.7), Inches(4.5), Inches(11.9), Inches(2.0))
        p2 = tf2.paragraphs[0]
        r2 = p2.add_run()
        set_run(r2, sub_text, size=18, color=GRAY_500)


# ---------------------------------------------------------------------------
# Main build
# ---------------------------------------------------------------------------
def build():
    prs = Presentation()
    # 16:9
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # ----- Cover -----
    slide_cover(prs)

    # ----- 1. Executive Summary -----
    slide_quote(
        prs,
        "1",
        "エグゼクティブサマリー",
        "サーキットで刻んだタイムを、愛車情報と一緒に共有できる Web サービス。",
        "個人ブログ・SNS・LINE グループに散在していた走行データを、検索・比較・拡散できる形に集約します。",
    )

    slide_section(
        prs,
        "1",
        "提供価値",
        None,
        columns=[
            (
                "ドライバーに",
                [
                    "タイム履歴・改造履歴・タイヤ履歴を1か所で管理",
                    "SNS で簡単にシェア (X, Insta, Threads, FB, LINE)",
                    "同条件ドライバーとの比較",
                ],
            ),
            (
                "事業者に",
                [
                    "サーキット運営: 公式ページと走行会告知 (無料)",
                    "タイヤ・パーツメーカー: 自社銘柄の使用実績データ",
                    "イベント主催者: 走行会の集客チャネル",
                ],
            ),
        ],
    )

    # ----- 2. Market -----
    slide_section(
        prs,
        "2",
        "市場背景・課題認識",
        "国内のサーキットは 30 か所以上、参加層は数万人規模。30〜50 代男性が中心で可処分所得が高い。",
        bullets=[
            "ガレージのホワイトボード、個人ブログ、SNS のスクショ、LINE グループ。走行データはバラバラ。",
            "サーキット間で形式バラバラ、車両・タイヤ情報が紐づかない。",
            "走行会の Excel は主催者依存、横断比較ができない。",
            "→ 走ログは「検索可能なフォーマット」と「エビデンス文化」で課題を解決。",
        ],
    )

    # ----- 3. Service Flow -----
    slide_section(
        prs,
        "3",
        "サービスフロー",
        None,
        bullets=[
            "1. 無料サインアップ (メール+パスワード)",
            "2. マイガレージに愛車を登録 (改造内容・写真)",
            "3. タイム投稿: サーキット・タイム・タイヤ・天候・路面・気温・路温・最高速・写真",
            "4. ランキング自動反映、SNS でワンクリックシェア",
            "5. サーキット運営者は公式アカウントで走行会告知・自施設ページ更新",
        ],
    )

    # ----- 4. Implemented Features -----
    slide_section(
        prs,
        "4",
        "実装済み機能 (1/3) ユーザー / 愛車",
        "「設計だけ」ではなく、すでに本番稼働しているプロダクト。",
        columns=[
            (
                "ユーザー機能",
                [
                    "メール+パスワード認証、確認、リセット",
                    "プロフィール: 表示名・自己紹介・都道府県・アバター",
                    "SNS リンク: X / Insta / Threads / FB / YT / TikTok",
                    "退会で関連データ完全削除 (個人情報保護法対応)",
                ],
            ),
            (
                "マイガレージ (愛車)",
                [
                    "複数台登録 (メーカー / モデル / 年式 / 馬力 / 重量)",
                    "改造内容: 足回り・エンジン・駆動系・ブレーキ・外装・内装",
                    "写真ギャラリー (カバー + 複数枚)",
                ],
            ),
        ],
    )

    slide_section(
        prs,
        "4",
        "実装済み機能 (2/3) タイム投稿 (中核)",
        None,
        columns=[
            (
                "記録項目",
                [
                    "総合タイム、セクター 1〜4 個別、最高速",
                    "天候 (晴/曇/雨/大雨/雪/変)、路面 (Dry/Damp/Wet)",
                    "気温・路温",
                    "走行日・メモ (走行会名、感想)",
                ],
            ),
            (
                "タイヤ (差別化)",
                [
                    "ブランド × 銘柄 ドロップダウン + 「その他」手入力",
                    "前後で別銘柄に対応 (チェックボックス切替)",
                    "前後別サイズ記録 (例: F:245/40 R:265/35)",
                    "ユーザー入力銘柄は自動でリスト追加",
                    "エビデンス写真複数枚添付",
                ],
            ),
        ],
    )

    slide_section(
        prs,
        "4",
        "実装済み機能 (3/3) ランキング / B2B / 信頼性",
        None,
        columns=[
            (
                "閲覧・横断機能",
                [
                    "サーキット × 車種 × タイヤで多次元フィルター",
                    "全国 25+ サーキット登録済み",
                    "サーキット詳細にタイムランキング & イベント告知",
                    "OGP/Twitter Card / JSON-LD 構造化データ完備",
                    "PWA / モバイル最適化",
                ],
            ),
            (
                "B2B / 運用",
                [
                    "サーキット運営者: 公式アカウントで自施設編集",
                    "走行会・レース・お知らせ告知",
                    "通報・モデレーション機能",
                    "Vercel + Supabase Tokyo (国内データ保管)",
                    "/api/health 死活監視、Cloudflare Web Analytics",
                ],
            ),
        ],
    )

    # ----- 5. Target -----
    slide_table(
        prs,
        "5",
        "ターゲット (ドライバー)",
        "メインユーザー像。可処分所得が高くロイヤリティの高い層。",
        ["ペルソナ", "特徴"],
        [
            ["タイムアタッカー", "30〜50 代、年 10〜30 走行日、車両・タイヤに数十〜百万単位の投資"],
            ["走行会レギュラー", "月 1〜2 回、自己ベスト更新がモチベーション、エビデンス共有志向"],
            ["若手ドライバー", "20 代、SNS ネイティブ、発信意欲旺盛、先輩のセッティング参考"],
            ["耐久・チーム参戦", "チーム単位で複数アカウント、同一車両のドライバー比較"],
        ],
    )

    slide_table(
        prs,
        "5",
        "B2B パートナー候補",
        None,
        ["区分", "提供できる価値"],
        [
            ["サーキット運営会社", "公式ページ、走行会告知、来場者コミュニティの可視化"],
            ["タイヤメーカー", "自社銘柄の使用実績データ、プロモコンテンツ展開"],
            ["パーツメーカー", "改造内容と紐づくタイム実データ"],
            ["自動車メーカー", "車種別のサーキット適性データ、ユーザーボイス"],
            ["走行会主催者", "集客チャネル、参加者のタイム集計"],
            ["モータースポーツ媒体", "コンテンツ提携、データ引用"],
        ],
    )

    # ----- 6. Monetization -----
    slide_table(
        prs,
        "6",
        "収益化 (1/2) ドライバー向け",
        "コア機能は永久無料。プレミアム機能で課金。Stripe 基盤は実装済み (フラグでON/OFF)。",
        ["プラン", "月額目安", "提供内容"],
        [
            ["Free", "0円", "全コア機能 (タイム投稿・閲覧・シェア・ランキング)"],
            ["Premium", "480円程度", "写真大量UL、ベスト推移グラフ、CSV、広告非表示、装飾"],
            ["Pro", "980円程度", "上記+チームアカウント、複数車両比較、コーチング機能"],
        ],
    )

    slide_table(
        prs,
        "6",
        "収益化 (2/2) B2B",
        None,
        ["メニュー", "内容"],
        [
            ["公式運営者アカウント (無料)", "サーキット運営会社向け。自施設ページ編集・告知"],
            ["プロモーションプラン (要相談)", "トップ露出、おすすめ表示、ニュースレター、送客レポート"],
            ["タイヤブランド公式バッジ", "ブランドプリセット表示優先、ブランドページ"],
            ["データ提供 (匿名集計)", "月次レポート (使用シェア / タイム分布 / 装着車両分布)"],
            ["タイアップ・特集", "新製品リリース時のフィーチャー枠"],
            ["イベントスポンサー連携", "走ログ主催走行会への協賛"],
        ],
    )

    # ----- 7. Differentiation -----
    slide_table(
        prs,
        "7",
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

    # ----- 8. Partnership -----
    slide_section(
        prs,
        "8",
        "サーキット運営者の皆様へ",
        "公式アカウント (無料) を発行します。自施設の公式ページを直接編集いただけます。",
        columns=[
            (
                "ご提供内容 (無料)",
                [
                    "公式ページ (説明・代表コーナー・公式 URL)",
                    "走行会・レース・お知らせの掲載",
                    "自施設のラップタイム一覧 (来場者の生の声)",
                    "スタッフアカウントでの更新権限",
                ],
            ),
            (
                "期待される効果",
                [
                    "走行会の集客導線の追加",
                    "リピート顧客の見える化",
                    "SEO・ブランディング強化",
                    "ご担当メアドのみで開始可能",
                ],
            ),
        ],
    )

    slide_section(
        prs,
        "8",
        "タイヤ・パーツメーカーの皆様へ",
        "走ログには「銘柄 × サーキット × タイム × 条件」のリアルな走行データが集まります。",
        columns=[
            (
                "ご提供できること",
                [
                    "使用実績データ (匿名化集計、月次)",
                    "公式バッジ表示でブランド信頼性アップ",
                    "新製品リリース連動の特集枠",
                    "サンプリング協力 (モニター募集)",
                ],
            ),
            (
                "コラボ事例案",
                [
                    "「○○ × 走ログ 春のタイムアタック」プレゼント抽選",
                    "「銘柄別ランキング特集」サーキット別ベスト公開",
                    "新製品先行投稿者100名にプレゼント",
                ],
            ),
        ],
    )

    slide_section(
        prs,
        "8",
        "走行会主催者・媒体の皆様へ",
        None,
        columns=[
            (
                "走行会・大会主催者",
                [
                    "イベント告知ページ (無料)",
                    "参加者のタイム集計テンプレート",
                    "イベント特化ページ (有料・要相談)",
                    "主催者ロゴ・告知の常設掲載",
                ],
            ),
            (
                "モータースポーツ媒体",
                [
                    "走ログ内データの記事引用 (クレジット表記)",
                    "共同企画記事",
                    "走ログユーザーへのアンケート協力",
                    "データ提供 (要相談)",
                ],
            ),
        ],
    )

    # ----- 9. Data value -----
    slide_section(
        prs,
        "9",
        "データ・分析価値",
        "走ログは「ユーザー投稿型のサーキット走行データベース」として下記指標を蓄積。",
        bullets=[
            "サーキット別の車種シェア・タイヤシェア・年代シェア",
            "季節別・天候別のタイム分布",
            "同一車種における改造内容とタイムの相関",
            "タイヤ銘柄ごとの使用率・好まれるサーキット",
            "ユーザーの SNS 連携率、ピーク時間帯、地域分布",
            "→ 個人を特定しない集計形式でメーカー・媒体に提供可能。",
        ],
    )

    # ----- 10. Roadmap -----
    slide_section(
        prs,
        "10",
        "ロードマップ",
        None,
        columns=[
            (
                "完了済み (2026年5月)",
                [
                    "認証 / プロフィール / SNS 連携",
                    "愛車・改造履歴",
                    "タイム投稿 (前後別タイヤ含む)",
                    "ランキング・多次元フィルター",
                    "サーキット 25+ 登録 / 運営者管理",
                    "通報・モデレーション",
                    "PWA / SEO / 構造化データ",
                    "規約・プライバシー・特商法",
                ],
            ),
            (
                "短期〜中期 (3〜12 か月)",
                [
                    "ベストタイム推移グラフ",
                    "同一車種比較ダッシュボード",
                    "走行会・イベントカレンダー (横断)",
                    "通知機能 (記録更新、フォロー先)",
                    "メーカー向け管理コンソール",
                    "チームアカウント",
                    "API 公開",
                    "AI 走行ライン分析 (将来)",
                ],
            ),
        ],
    )

    # ----- 11. Closing -----
    s = slide_blank(prs)
    bar = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.55))
    bar.fill.solid()
    bar.fill.fore_color.rgb = RED
    bar.line.fill.background()
    add_footer(s)

    tf = add_textbox(s, Inches(0.7), Inches(1.1), Inches(11.9), Inches(2.0))
    p = tf.paragraphs[0]
    r = p.add_run()
    set_run(
        r,
        "サーキットを走るすべての人が、",
        size=30,
        bold=True,
        color=INK,
    )
    p2 = tf.add_paragraph()
    r2 = p2.add_run()
    set_run(
        r2,
        "自分のタイムをもっと誇れる場所へ。",
        size=30,
        bold=True,
        color=RED,
    )

    tf = add_textbox(s, Inches(0.7), Inches(3.3), Inches(11.9), Inches(2.0))
    p = tf.paragraphs[0]
    r = p.add_run()
    set_run(
        r,
        "ぜひ一度、サービスを実際に触っていただき、提携の可能性についてお話しさせてください。",
        size=16,
        color=GRAY_700,
    )

    # Contact box
    box = s.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        Inches(0.7),
        Inches(4.6),
        Inches(11.9),
        Inches(2.1),
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

    # ----- Save -----
    out = Path(__file__).resolve().parents[1] / "docs" / "PROPOSAL.pptx"
    prs.save(str(out))
    print(f"Wrote {out} ({len(prs.slides)} slides)")


if __name__ == "__main__":
    build()
