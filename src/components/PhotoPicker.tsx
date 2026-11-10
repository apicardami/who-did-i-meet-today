"use client";

import { useId, useRef, useState } from "react";
import Avatar from "./Avatar";
import { FORM_COPY } from "@/lib/constants";

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

  return (
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
  );
}
