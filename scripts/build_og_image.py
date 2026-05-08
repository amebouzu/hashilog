"""走ログ デフォルト OG 画像生成スクリプト.

X / Facebook / Threads / LINE などで URL がシェアされた時に表示される
1200×630 のサムネイル画像を Pillow で生成し、public/og.png に書き出す。
- 左端に縦の赤アクセント帯
- 中央上にロゴ (透過 PNG)
- タイトル「走ログ」+ サブタイトル「Hashilog」
- 下部にタグライン
- 右下に hashilog.jp

実行:
    python scripts/build_og_image.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "public" / "logo.png"
OUT_PATH = ROOT / "public" / "og.png"

# Brand palette
RED = (225, 6, 0, 255)
INK = (24, 24, 27, 255)
GRAY_700 = (63, 63, 70, 255)
GRAY_500 = (113, 113, 122, 255)
WHITE = (255, 255, 255, 255)
OFFWHITE = (252, 252, 253, 255)

W, H = 1200, 630


# Windows 上で使える日本語フォントを順に試して最初に見つかった物を使う
JP_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\YuGothB.ttc",   # Yu Gothic Bold
    r"C:\Windows\Fonts\YuGothM.ttc",   # Yu Gothic Medium
    r"C:\Windows\Fonts\YuGothic.ttc",  # Yu Gothic Regular
    r"C:\Windows\Fonts\meiryob.ttc",   # Meiryo Bold
    r"C:\Windows\Fonts\meiryo.ttc",    # Meiryo
    r"C:\Windows\Fonts\msgothic.ttc",  # MS Gothic
]
EN_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\arial.ttf",
]


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont:
    for p in candidates:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def text_width(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]


def text_height(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[3] - bbox[1]


def build():
    # キャンバス
    img = Image.new("RGB", (W, H), OFFWHITE[:3])
    draw = ImageDraw.Draw(img, "RGBA")

    # 左端の縦の赤アクセント帯
    draw.rectangle([0, 0, 64, H], fill=RED)

    # 微妙な右側のグラデ風アクセント (繰返し赤の薄ライン)
    for i in range(0, 30):
        alpha = int(8 - i * 0.25)  # 徐々に薄く
        if alpha <= 0:
            break
        x = W - 60 + i * 2
        draw.line([(x, 0), (x, H)], fill=(225, 6, 0, alpha), width=1)

    # 右上の小さな赤角アクセント
    draw.rectangle([W - 200, 60, W - 180, 80], fill=RED)
    en_label_font = load_font(EN_FONT_CANDIDATES, 22)
    draw.text(
        (W - 170, 56),
        "BUSINESS PROPOSAL".replace("BUSINESS PROPOSAL", "RACING TIME LOG"),
        font=en_label_font,
        fill=RED,
    )

    # ロゴ (左寄せ・中央高さ)
    if LOGO_PATH.exists():
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo_h = 200
        logo_w = int(logo.width * (logo_h / logo.height))
        logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
        # 配置: 左から 130px、上から 90px
        img.paste(logo, (130, 90), logo)

    # タイトル「走ログ」 (大判)
    title_font = load_font(JP_FONT_CANDIDATES, 130)
    draw.text((130, 320), "走ログ", font=title_font, fill=INK)

    # サブタイトル「Hashilog」(英字)
    sub_font = load_font(EN_FONT_CANDIDATES, 56)
    title_w = text_width(draw, "走ログ", title_font)
    draw.text((130 + title_w + 30, 380), "Hashilog", font=sub_font, fill=GRAY_500)

    # 細い赤アンダーライン
    draw.rectangle([130, 482, 230, 488], fill=RED)

    # タグライン
    tag_font = load_font(JP_FONT_CANDIDATES, 32)
    draw.text(
        (130, 506),
        "サーキットタイムを、愛車情報と一緒にシェア。",
        font=tag_font,
        fill=GRAY_700,
    )

    # 右下: hashilog.jp
    url_font = load_font(EN_FONT_CANDIDATES, 26)
    url_text = "hashilog.jp"
    url_w = text_width(draw, url_text, url_font)
    draw.text((W - url_w - 60, H - 60), url_text, font=url_font, fill=GRAY_500)

    # 保存 (PNG) — RGBA → RGB に統合済み
    img.save(OUT_PATH, "PNG", optimize=True)
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
