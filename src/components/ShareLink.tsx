"use client";

export function ShareLink({ platform }: { platform: "x" | "line" }) {
  function onClick() {
    const url = location.href;
    const text = document.title;
    if (platform === "x") {
      const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`;
      window.open(u, "_blank", "noopener,noreferrer");
    } else {
      const u = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        url
      )}`;
      window.open(u, "_blank", "noopener,noreferrer");
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-50"
    >
      {platform === "x" ? "X (Twitter) でシェア" : "LINEでシェア"}
    </button>
  );
}
