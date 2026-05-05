import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/settings/",
          "/api/",
          "/auth/callback",
          "/circuit-login",
          "/forgot-password",
          "/reset-password",
          "/billing"
        ]
      }
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE
  };
}
