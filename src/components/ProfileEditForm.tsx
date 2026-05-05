"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "@/app/actions/profile";
import { PREFECTURES, type Profile } from "@/lib/types";

const SNS_FIELDS = [
  { key: "sns_x", label: "X (Twitter)", placeholder: "ユーザー名 (例: hashiro_taro)" },
  { key: "sns_instagram", label: "Instagram", placeholder: "ユーザー名" },
  { key: "sns_threads", label: "Threads", placeholder: "ユーザー名" },
  { key: "sns_youtube", label: "YouTube", placeholder: "@ハンドル または UCxxx チャンネルID" },
  { key: "sns_facebook", label: "Facebook", placeholder: "ユーザー名" },
  { key: "sns_tiktok", label: "TikTok", placeholder: "ユーザー名" }
] as const;

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url ?? null
  );

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    setAvatarPreview(f ? URL.createObjectURL(f) : profile.avatar_url ?? null);
  }

  async function handleSubmit(fd: FormData) {
    setError(null);
    if (avatarFile) {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインしてください");
      const ext = avatarFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const up = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true, cacheControl: "3600" });
      if (up.error)
        throw new Error("プロフィール画像のアップロードに失敗: " + up.error.message);
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      fd.set("avatar_url", pub.publicUrl);
    } else if (profile.avatar_url) {
      fd.set("avatar_url", profile.avatar_url);
    }
    await updateProfileAction(fd);
  }

  return (
    <form
      action={(fd) =>
        start(async () => {
          try {
            await handleSubmit(fd);
          } catch (e: any) {
            setError(e?.message ?? "保存に失敗しました");
          }
        })
      }
      className="space-y-6"
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900">基本情報</h2>
        <div className="flex items-start gap-4">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br from-red-100 to-red-50 text-3xl font-extrabold text-racing-red shadow">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>
                {(profile.display_name ?? profile.username).charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-600">プロフィール画像</span>
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="text-sm text-zinc-700"
              />
              <p className="mt-1 text-xs text-zinc-500">推奨: 正方形・最大 2MB</p>
            </label>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="表示名">
            <input
              name="display_name"
              defaultValue={profile.display_name ?? ""}
              maxLength={50}
              className="input"
            />
          </Field>
          <Field label="ユーザー名 (URLに使用、変更不可)">
            <input
              defaultValue={profile.username}
              readOnly
              className="input bg-zinc-50 text-zinc-500"
            />
          </Field>
          <Field label="居住地">
            <select
              name="prefecture"
              defaultValue={profile.prefecture ?? ""}
              className="input"
            >
              <option value="">選択しない</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ウェブサイト">
            <input
              name="website_url"
              type="url"
              defaultValue={profile.website_url ?? ""}
              placeholder="https://example.com"
              className="input"
            />
          </Field>
        </div>
        <Field label="自己紹介">
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={4}
            maxLength={500}
            placeholder="ホームコース、得意な車種、走行頻度、目標タイムなど自由にどうぞ"
            className="input"
          />
        </Field>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 space-y-3">
        <h2 className="text-lg font-bold text-zinc-900">SNSアカウント</h2>
        <p className="text-xs text-zinc-500">
          @マークは不要。ユーザー名のみ入力してください。
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SNS_FIELDS.map((s) => (
            <Field key={s.key} label={s.label}>
              <input
                name={s.key}
                defaultValue={(profile as any)[s.key] ?? ""}
                placeholder={s.placeholder}
                maxLength={100}
                className="input"
              />
            </Field>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-racing-red px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存する"}
        </button>
        <Link
          href="/cars"
          className="rounded border border-zinc-300 px-5 py-2 text-zinc-700 hover:bg-zinc-50"
        >
          キャンセル
        </Link>
      </div>
      <style jsx>{`
        .input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d4d4d8;
          border-radius: 6px;
          padding: 8px 10px;
          color: #18181b;
          font-size: 14px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-600">{label}</span>
      {children}
    </label>
  );
}
