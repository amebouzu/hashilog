"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

type NavItem = { href: string; label: string; icon?: string; auth?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "トップ", icon: "🏁" },
  { href: "/ranking", label: "ランキング", icon: "🏆" },
  { href: "/circuits", label: "サーキット", icon: "🛣" },
  { href: "/cars", label: "マイガレージ", icon: "🏎", auth: true },
  { href: "/laps/new", label: "タイム投稿", icon: "⏱", auth: true },
  { href: "/about", label: "走ログとは", icon: "ℹ" },
  { href: "/contact", label: "お問い合わせ", icon: "✉" }
];

export function Navbar({
  signedIn,
  username
}: {
  signedIn: boolean;
  username: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ページ遷移したらメニューを閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // メニューが開いている時、ESC で閉じる
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  const visibleItems = NAV_ITEMS.filter((i) => !i.auth || signedIn);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2"
          aria-label="走ログ ホーム"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="走ログ" className="h-9 w-auto sm:h-10" />
        </Link>

        {/* Desktop nav (lg+) */}
        <nav className="hidden lg:flex items-center gap-5 text-sm text-zinc-600">
          {visibleItems
            .filter((i) => i.href !== "/") // トップは ロゴクリックで戻れるので nav からは省く
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Right side: auth + hamburger */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          {/* Desktop auth */}
          <div className="hidden lg:flex items-center gap-2">
            {signedIn ? (
              <>
                {username && (
                  <Link
                    href={`/u/${username}`}
                    className="text-zinc-600 hover:text-zinc-900"
                  >
                    @{username}
                  </Link>
                )}
                <Link
                  href="/settings/account"
                  className="text-zinc-600 hover:text-zinc-900"
                  aria-label="アカウント設定"
                  title="アカウント設定"
                >
                  ⚙
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded border border-zinc-300 px-2 py-1 text-zinc-600 hover:bg-zinc-50"
                  >
                    ログアウト
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-50"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="rounded bg-racing-red px-3 py-1 font-medium text-white hover:bg-red-700"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={open}
          >
            {open ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M6 18L18 6"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu (lg 未満) */}
      {open && (
        <div className="border-t border-zinc-200 bg-white lg:hidden">
          <nav className="mx-auto grid max-w-6xl gap-1 px-4 py-3 text-sm">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2.5 text-left text-zinc-700 hover:bg-zinc-50"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-zinc-200 pt-2">
              {signedIn ? (
                <div className="grid gap-1">
                  {username && (
                    <Link
                      href={`/u/${username}`}
                      onClick={() => setOpen(false)}
                      className="rounded px-3 py-2.5 text-left text-zinc-700 hover:bg-zinc-50"
                    >
                      <span className="mr-2">👤</span>@{username}
                    </Link>
                  )}
                  <Link
                    href="/settings/account"
                    onClick={() => setOpen(false)}
                    className="rounded px-3 py-2.5 text-left text-zinc-700 hover:bg-zinc-50"
                  >
                    <span className="mr-2">⚙</span>アカウント設定
                  </Link>
                  <form
                    action={signOutAction}
                    onSubmit={() => setOpen(false)}
                  >
                    <button
                      type="submit"
                      className="w-full rounded border border-zinc-300 px-3 py-2.5 text-left text-zinc-700 hover:bg-zinc-50"
                    >
                      ログアウト
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded bg-racing-red px-3 py-2.5 text-center font-bold text-white hover:bg-red-700"
                  >
                    新規登録
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded border border-zinc-300 px-3 py-2.5 text-center text-zinc-700 hover:bg-zinc-50"
                  >
                    ログイン
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
