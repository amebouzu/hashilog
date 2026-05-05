import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

export function Navbar({
  signedIn,
  username
}: {
  signedIn: boolean;
  username: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="走ログ ホーム">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="走ログ" className="h-8 w-auto sm:h-10" />
        </Link>
        <nav className="flex items-center gap-4 overflow-x-auto whitespace-nowrap text-sm text-zinc-600">
          <Link href="/ranking" className="hover:text-zinc-900">
            ランキング
          </Link>
          <Link href="/circuits" className="hover:text-zinc-900">
            サーキット
          </Link>
          {signedIn && (
            <>
              <Link href="/cars" className="hover:text-zinc-900">
                マイガレージ
              </Link>
              <Link href="/laps/new" className="hover:text-zinc-900">
                タイム投稿
              </Link>
            </>
          )}
          <Link href="/about" className="hover:text-zinc-900">
            走ログとは
          </Link>
          <Link href="/contact" className="hover:text-zinc-900">
            お問い合わせ
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
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
      </div>
    </header>
  );
}
