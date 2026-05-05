"use client";

import { useState, useTransition } from "react";
import type { Car } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type Action = (formData: FormData) => Promise<void>;

export function CarForm({
  initial,
  action,
  submitLabel
}: {
  initial?: Partial<Car>;
  action: Action;
  submitLabel: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial?.cover_url ?? null
  );
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setCoverFile(f);
    setCoverPreview(f ? URL.createObjectURL(f) : initial?.cover_url ?? null);
  }
  function onGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10);
    setGalleryFiles(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(fd: FormData) {
    setError(null);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("ログインしてください");
    }

    // Upload cover image to Storage if a new file was selected
    if (coverFile) {
      const ext = coverFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("car-covers")
        .upload(path, coverFile, { cacheControl: "3600", upsert: false });
      if (up.error) throw new Error(`カバー画像のアップロードに失敗しました: ${up.error.message}`);
      const { data: pub } = supabase.storage
        .from("car-covers")
        .getPublicUrl(path);
      fd.set("cover_url", pub.publicUrl);
    }
    // Gallery: paths joined by "\n" (consumed by server action)
    if (galleryFiles.length > 0) {
      const uploadedPaths: string[] = [];
      for (const f of galleryFiles) {
        const ext = f.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/gallery/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage
          .from("car-covers")
          .upload(path, f, { cacheControl: "3600", upsert: false });
        if (up.error) {
          console.warn("ギャラリー画像のアップロード失敗", up.error.message);
          continue;
        }
        uploadedPaths.push(path);
      }
      fd.set("gallery_paths", uploadedPaths.join("\n"));
    }

    await action(fd);
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
      <Section title="基本情報">
        <Grid>
          <Text name="name" label="愛車の名前" required defaultValue={initial?.name ?? ""} placeholder="赤いハチロク" />
          <Text name="maker" label="メーカー" required defaultValue={initial?.maker ?? ""} placeholder="TOYOTA" />
          <Text name="model" label="車種" required defaultValue={initial?.model ?? ""} placeholder="AE86 (Trueno)" />
          <Text name="year" label="年式" type="number" defaultValue={initial?.year?.toString() ?? ""} placeholder="1985" />
          <Text name="color" label="ボディカラー" defaultValue={initial?.color ?? ""} placeholder="パンダ (黒/白)" />
          <Text name="power_ps" label="出力 (PS)" type="number" defaultValue={initial?.power_ps?.toString() ?? ""} />
          <Text name="weight_kg" label="車重 (kg)" type="number" defaultValue={initial?.weight_kg?.toString() ?? ""} />
        </Grid>
        <Textarea name="description" label="紹介文" defaultValue={initial?.description ?? ""} placeholder="ノーマル車高でひたすら走り込んでます。" />
      </Section>

      <Section title="愛車の写真" hint="カバー画像 1枚 + ギャラリー写真 (最大10枚) をアップロードできます。">
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-700">
            カバー画像{" "}
            <span className="font-normal text-zinc-400">
              (一覧表示・SNSシェア時に使用)
            </span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onCoverChange}
            className="text-sm text-zinc-700"
          />
          {coverPreview && (
            <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 sm:max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview}
                alt="カバープレビュー"
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-zinc-700">
            ギャラリー{" "}
            <span className="font-normal text-zinc-400">
              (複数枚アップロード可)
            </span>
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onGalleryChange}
            className="text-sm text-zinc-700"
          />
          {galleryPreviews.length > 0 && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {galleryPreviews.map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-zinc-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`gallery ${i + 1}`}
                    className="h-auto w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            推奨: 横向き写真、1枚あたり 5MB 以内 (JPG / PNG / WebP)
          </p>
        </div>
      </Section>

      <Section title="チューニング" hint="改造範囲を自由に記述。空欄は「ノーマル」扱い。">
        <Textarea name="mods_suspension" label="足回り" defaultValue={initial?.mods_suspension ?? ""} placeholder="TEIN車高調 / ピロアッパー / スタビ前後強化" />
        <Textarea name="mods_engine" label="エンジン" defaultValue={initial?.mods_engine ?? ""} placeholder="HKS マフラー / 純正流用ECU" />
        <Textarea name="mods_drivetrain" label="駆動系" defaultValue={initial?.mods_drivetrain ?? ""} placeholder="クスコ機械式LSD 1.5way / 強化クラッチ" />
        <Textarea name="mods_brake" label="ブレーキ" defaultValue={initial?.mods_brake ?? ""} placeholder="プロジェクトμ HC+ / メッシュホース" />
        <Textarea name="mods_exterior" label="外装" defaultValue={initial?.mods_exterior ?? ""} placeholder="GT-WING / カナード / オバフェン+25mm" />
        <Textarea name="mods_interior" label="内装" defaultValue={initial?.mods_interior ?? ""} placeholder="バケットシート / 4点ハーネス / ロールバー" />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-racing-red px-5 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "保存中…" : submitLabel}
      </button>
    </form>
  );
}

function Section({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-zinc-900">{title}</h2>
      {hint && <p className="mb-4 text-xs text-zinc-500">{hint}</p>}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Text({
  name,
  label,
  required,
  defaultValue,
  type = "text",
  placeholder
}: {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-600">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

function Textarea({
  name,
  label,
  defaultValue,
  placeholder
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-600">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-racing-red focus:outline-none focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}
