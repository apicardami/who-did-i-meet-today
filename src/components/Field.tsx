"use client";

import { useId } from "react";

const base =
  "w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base text-ink placeholder:text-muted/80 focus:border-canal focus:outline-none focus-visible:outline-2 focus-visible:outline-mola";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
}

export default function Field({ label, value, onChange, placeholder, type = "text", required, multiline, inputMode, autoComplete = "off", maxLength }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-mola"> *</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={maxLength}
          className={`${base} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`${base} min-h-11`}
        />
      )}
    </div>
  );
}
