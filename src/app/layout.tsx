import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { OrganizationSchema } from "@/components/StructuredData";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#e10600",
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "走ログ — サーキットタイム共有",
    template: "%s | 走ログ"
  },
  description:
    "日本のサーキットで刻んだタイムを愛車情報と一緒にシェア。セクタータイム・最高速・タイヤ・天候まで。",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png"
  },
  openGraph: {
    type: "website",
    siteName: "走ログ",
    title: "走ログ — サーキットタイム共有",
    description: "サーキットのタイムを愛車情報と一緒にシェア",
    images: ["/logo.png"],
    locale: "ja_JP"
  },
  twitter: {
    card: "summary_large_image",
    title: "走ログ",
    images: ["/logo.png"]
  },
  verification: {
    // Google Search Console 所有権確認用 (HTML タグ方式)
    google: "Dz99t5SKYpipiKmd0HqsirlyE-6fNzA5BBRNLSkXOWg"
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = data?.username ?? null;
  }

  const cfBeacon = process.env.NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN;

  return (
    <html lang="ja">
      <body>
        <OrganizationSchema />
        <Navbar signedIn={!!user} username={username} />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a href="/about" className="text-zinc-600 hover:text-zinc-900">
                走ログとは
              </a>
              <a href="/contact" className="text-zinc-600 hover:text-zinc-900">
                お問い合わせ
              </a>
              <a href="/terms" className="text-zinc-600 hover:text-zinc-900">
                利用規約
              </a>
              <a href="/privacy" className="text-zinc-600 hover:text-zinc-900">
                プライバシーポリシー
              </a>
              <a
                href="/legal/tokushoho"
                className="text-zinc-600 hover:text-zinc-900"
              >
                特商法表記
              </a>
              <a
                href="/circuit-login"
                className="text-zinc-600 hover:text-zinc-900"
              >
                サーキット運営者ログイン
              </a>
            </nav>
            <p className="mt-4 text-xs text-zinc-500">
              © 2026 走ログ · サーキットタイム共有サービス
            </p>
          </div>
        </footer>
        {cfBeacon && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${cfBeacon}"}`}
          />
        )}
      </body>
    </html>
  );
}
