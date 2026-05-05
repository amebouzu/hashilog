import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // 静的ページ
  const staticEntries: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/ranking",
    "/circuits",
    "/contact",
    "/terms",
    "/privacy",
    "/legal/tokushoho",
    "/login",
    "/signup"
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1.0 : 0.7
  }));

  // サーキットページ (公開中のみ)
  const { data: circuits } = await supabase
    .from("circuits")
    .select("slug, updated_at")
    .eq("is_published", true);
  const circuitEntries: MetadataRoute.Sitemap = (circuits ?? []).map((c) => ({
    url: `${SITE}/circuits/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  // 公開ユーザーページ (アクティブなプロフィール)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username")
    .order("created_at", { ascending: false })
    .limit(1000);
  const userEntries: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${SITE}/u/${p.username}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5
  }));

  // 最近のラップ詳細 (新しいものを優先)
  const { data: laps } = await supabase
    .from("lap_times")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  const lapEntries: MetadataRoute.Sitemap = (laps ?? []).map((l) => ({
    url: `${SITE}/laps/${l.id}`,
    lastModified: l.created_at ? new Date(l.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.4
  }));

  return [
    ...staticEntries,
    ...circuitEntries,
    ...userEntries,
    ...lapEntries
  ];
}
