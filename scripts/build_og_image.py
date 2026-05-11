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
    """ロゴ中心のミニマルな OG 画像を生成する。
    元々はキャッチコピー入りのバナー風だったが、ユーザー要望により
    「ロゴだけが目立つ」シンプルなデザインに変更。
    """
    # キャンバス (白背景)
    img = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img, "RGBA")

    # 上下のごく薄い赤アクセント (12px ずつ)
    draw.rectangle([0, 0, W, 12], fill=RED)
    draw.rectangle([0, H - 12, W, H], fill=RED)

    # ロゴを中央配置 (高さの 55% を占める大判表示)
    if LOGO_PATH.exists():
        logo = Image.open(LOGO_PATH).convert("RGBA")
        target_h = int(H * 0.55)  # 約 346px
        target_w = int(logo.width * (target_h / logo.height))
        logo = logo.resize((target_w, target_h), Image.LANCZOS)
        x = (W - target_w) // 2
        # 中央より少し上寄せ (下に URL を入れるスペースを確保)
        y = int(H * 0.18)
        img.paste(logo, (x, y), logo)

    # ロゴの下: hashilog.jp (落ち着いた灰色)
    url_font = load_font(EN_FONT_CANDIDATES, 36)
    url_text = "hashilog.jp"
    url_w = text_width(draw, url_text, url_font)
    draw.text(
        ((W - url_w) // 2, int(H * 0.78)),
        url_text,
        font=url_font,
        fill=GRAY_500,
    )

    # 保存 (PNG)
    img.save(OUT_PATH, "PNG", optimize=True)
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
