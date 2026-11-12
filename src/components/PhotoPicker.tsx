"use client";

import { useEffect, useId, useRef, useState } from "react";
import Avatar from "./Avatar";
import { FORM_COPY, PHOTO_COPY } from "@/lib/constants";
import { cropFaceFromImage } from "@/lib/imageCrop";

const MAX_EDGE = 480;

/** Downscale on-device so a phone photo becomes a ~40KB JPEG before it ever leaves the phone. */
async function resizeToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

interface Props {
  name: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  existingContactId?: string;
  existingHasPhoto?: boolean;
}

export default function PhotoPicker({ name, value, onChange, existingContactId, existingHasPhoto }: Props) {
  const inputId = useId();
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shotId = useId();
  const [finding, setFinding] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const showing = value !== null || (existingHasPhoto ?? false);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await resizeToDataUrl(file));
    } catch {
      setError(FORM_COPY.photoError);
    } finally {
      setBusy(false);
    }
  };

  const fromScreenshot = async (blob: Blob) => {
    setError(null);
    setPreview(null);
    setFinding(true);
    try {
      const url = await cropFaceFromImage(blob);
      if (url) setPreview(url);
      else setError(PHOTO_COPY.noFace);
    } catch {
      setError(PHOTO_COPY.noFace);
    } finally {
      setFinding(false);
    }
  };

  const pickShot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void fromScreenshot(file);
  };

  // Pasting an image anywhere on the page feeds the same flow (skips pastes into text fields).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        void fromScreenshot(file);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Avatar name={name || "?"} src={value} contactId={existingContactId} hasPhoto={value === null && existingHasPhoto} size={72} />
        <div className="flex flex-col items-start gap-1">
          <label
            htmlFor={inputId}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-canal px-4 text-sm font-medium text-canal hover:bg-wash"
          >
            {busy ? "…" : showing ? FORM_COPY.changePhoto : FORM_COPY.addPhoto}
          </label>
          <input ref={ref} id={inputId} type="file" accept="image/*" className="sr-only" onChange={pick} />
          <label
            htmlFor={shotId}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm font-medium text-canal hover:border-canal"
          >
            {finding ? PHOTO_COPY.finding : PHOTO_COPY.fromScreenshot}
          </label>
          <input id={shotId} type="file" accept="image/*" className="sr-only" onChange={pickShot} disabled={finding} />
          {value !== null && (
            <button type="button" onClick={() => onChange(null)} className="min-h-11 text-sm text-muted underline underline-offset-4">
              {FORM_COPY.removePhoto}
            </button>
          )}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
      {preview && (
        <div className="flex items-center gap-4 rounded-xl border border-line bg-card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
          <img src={preview} alt={PHOTO_COPY.previewAlt} width={72} height={72} className="size-[72px] rounded-full object-cover" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(preview);
                setPreview(null);
              }}
              className="min-h-11 rounded-xl bg-canal px-5 text-sm font-semibold text-canal-ink"
            >
              {PHOTO_COPY.useThis}
            </button>
            <label htmlFor={shotId} className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm text-muted underline underline-offset-4">
              {PHOTO_COPY.tryAnother}
            </label>
          </div>
        </div>
      )}
      <p className="text-xs text-muted">{PHOTO_COPY.pasteHint}</p>
    </div>
  );
}