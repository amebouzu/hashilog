import Link from "next/link";
import { snsUrl, type Profile } from "@/lib/types";

type Stats = { cars?: number; laps?: number };

const SNS_DEFS = [
  { key: "x", title: "X (Twitter)", svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
  { key: "instagram", title: "Instagram", svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /> },
  { key: "threads", title: "Threads", svg: <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.066-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291 1.024-.06 1.928.005 2.814.21-.04-.85-.288-1.524-.66-1.998-.512-.65-1.302-.985-2.345-.99h-.066c-1.252 0-3.099.34-4.276 2.08L4.51 7.797C5.892 5.677 8.04 4.55 11.234 4.55h.066c5.357.04 9.32 4.4 9.32 11.21 0 .135-.005.265-.013.394.74.398 1.371.92 1.882 1.55C24.25 19.77 23.872 22.25 22 24v-.001c-2.4 1.852-5.376 1.93-7.706 1.875zm-1.226-9.583c-.232 0-.467.007-.704.022-1.084.061-1.953.343-2.508.815-.49.418-.715.93-.679 1.524.078 1.422 1.502 2.085 2.965 2.001 1.336-.077 2.875-.598 2.875-3.708-.616-.156-1.262-.232-1.949-.232z" /> },
  { key: "youtube", title: "YouTube", svg: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> },
  { key: "facebook", title: "Facebook", svg: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
  { key: "tiktok", title: "TikTok", svg: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.71a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.14z" /> }
] as const;

function ProfileSnsLinks({
  profile,
  className = ""
}: {
  profile: Profile;
  className?: string;
}) {
  const items = SNS_DEFS.map((d) => {
    const handle = (profile as any)[`sns_${d.key}`] as string | null | undefined;
    if (!handle) return null;
    return { ...d, url: snsUrl(d.key as any, handle) };
  }).filter(Boolean) as Array<(typeof SNS_DEFS)[number] & { url: string }>;

  if (items.length === 0 && !profile.website_url) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {items.map((it) => (
        <a
          key={it.key}
          href={it.url}
          target="_blank"
          rel="noreferrer"
          aria-label={it.title}
          title={it.title}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            {it.svg}
          </svg>
        </a>
      ))}
      {profile.website_url && (
        <a
          href={profile.website_url}
          target="_blank"
          rel="noreferrer"
          aria-label="Website"
          title="Website"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>
      )}
    </div>
  );
}

function Avatar({
  url,
  fallback,
  size = "md"
}: {
  url?: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "sm"
      ? "h-12 w-12 text-base border-2"
      : size === "lg"
        ? "h-28 w-28 text-4xl border-[3px]"
        : "h-24 w-24 text-3xl border-[3px]";
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-white bg-gradient-to-br from-red-100 to-red-50 font-extrabold text-racing-red shadow ${sizeCls}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

export function ProfileHeader({
  profile,
  stats,
  isMyself,
  className = ""
}: {
  profile: Profile;
  stats?: Stats;
  isMyself?: boolean;
  className?: string;
}) {
  const fallback = (profile.display_name ?? profile.username).charAt(0);
  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar url={profile.avatar_url} fallback={fallback} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h1 className="text-2xl font-bold text-zinc-900">
              {profile.display_name ?? profile.username}
            </h1>
            <span className="text-sm text-zinc-500">@{profile.username}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {profile.prefecture && (
              <span className="inline-block">📍 {profile.prefecture}</span>
            )}
            {stats?.cars != null && (
              <span className={profile.prefecture ? "ml-3 inline-block" : "inline-block"}>
                🏁 愛車 {stats.cars}台
              </span>
            )}
            {stats?.laps != null && (
              <span className="ml-3 inline-block">⏱ {stats.laps}ラップ</span>
            )}
          </p>
          {profile.bio && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">
              {profile.bio}
            </p>
          )}
          <ProfileSnsLinks profile={profile} className="mt-3" />
        </div>
        {isMyself && (
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href="/settings/profile"
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              プロフィール編集
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
