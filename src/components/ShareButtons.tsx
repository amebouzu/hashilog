"use client";

/**
 * 汎用 SNS シェアボタン
 * X / Facebook / Instagram / Threads / LINE / リンクコピー の 6プラットフォーム対応。
 */

type Platform = "twitter" | "facebook" | "instagram" | "threads" | "line" | "copy";

const SVG: Record<Platform, JSX.Element> = {
  twitter: (
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  ),
  facebook: (
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  ),
  instagram: (
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  ),
  threads: (
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.066-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291 1.024-.06 1.928.005 2.814.21-.04-.85-.288-1.524-.66-1.998-.512-.65-1.302-.985-2.345-.99h-.066c-1.252 0-3.099.34-4.276 2.08L4.51 7.797C5.892 5.677 8.04 4.55 11.234 4.55h.066c5.357.04 9.32 4.4 9.32 11.21 0 .135-.005.265-.013.394.74.398 1.371.92 1.882 1.55C24.25 19.77 23.872 22.25 22 24v-.001c-2.4 1.852-5.376 1.93-7.706 1.875zm-1.226-9.583c-.232 0-.467.007-.704.022-1.084.061-1.953.343-2.508.815-.49.418-.715.93-.679 1.524.078 1.422 1.502 2.085 2.965 2.001 1.336-.077 2.875-.598 2.875-3.708-.616-.156-1.262-.232-1.949-.232z" />
  ),
  line: (
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  ),
  copy: (
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  )
};

const LABEL: Record<Platform, string> = {
  twitter: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  line: "LINE",
  copy: "リンクをコピー"
};

const HOVER: Record<Platform, string> = {
  twitter: "hover:border-zinc-900 hover:bg-zinc-50",
  facebook: "hover:border-blue-600 hover:bg-blue-50 hover:text-[#1877F2]",
  instagram: "hover:border-pink-500 hover:bg-pink-50 hover:text-[#E1306C]",
  threads: "hover:border-zinc-900 hover:bg-zinc-50",
  line: "hover:border-green-600 hover:bg-green-50 hover:text-[#06C755]",
  copy: "hover:bg-zinc-50"
};

export function ShareButtons({
  text,
  url,
  size = "md",
  showCopy = true,
  className = ""
}: {
  /** シェア時の本文 */
  text: string;
  /** シェア対象のURL (省略時は location.href) */
  url?: string;
  size?: "sm" | "md";
  showCopy?: boolean;
  className?: string;
}) {
  function fire(platform: Platform) {
    const targetUrl = url ?? location.href;
    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(targetUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}&quote=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "threads":
        window.open(
          `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + targetUrl)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "line":
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "instagram":
        navigator.clipboard
          .writeText(`${text}\n${targetUrl}`)
          .then(
            () =>
              alert(
                "Instagram用にテキストをコピーしました。\nInstagramアプリで貼り付けてください。"
              ),
            () => alert("コピーに失敗しました")
          );
        break;
      case "copy":
        navigator.clipboard
          .writeText(targetUrl)
          .then(
            () => alert("リンクをコピーしました"),
            () => alert("コピーに失敗しました")
          );
        break;
    }
  }

  const platforms: Platform[] = [
    "twitter",
    "facebook",
    "instagram",
    "threads",
    "line",
    ...(showCopy ? (["copy"] as const) : ([] as const))
  ];

  if (size === "sm") {
    return (
      <div className={`flex flex-wrap gap-0.5 ${className}`}>
        {platforms.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => fire(p)}
            aria-label={`${LABEL[p]}でシェア`}
            title={`${LABEL[p]}でシェア`}
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              {SVG[p]}
            </svg>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {platforms.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => fire(p)}
          aria-label={`${LABEL[p]}でシェア`}
          className={`flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 ${HOVER[p]}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            {SVG[p]}
          </svg>
          <span>{LABEL[p]}</span>
        </button>
      ))}
    </div>
  );
}
