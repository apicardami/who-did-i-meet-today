/* eslint-disable @next/next/no-img-element -- photos are private, auth-gated API responses or local data URLs */
interface Props {
  name: string;
  contactId?: string;
  hasPhoto?: boolean;
  src?: string | null;
  size?: number;
  version?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase() || "?";
}

export default function Avatar({ name, contactId, hasPhoto, src, size = 48, version }: Props) {
  const url = src ?? (hasPhoto && contactId ? `/api/contacts/${contactId}/photo${version ? `?v=${encodeURIComponent(version)}` : ""}` : null);
  const style = { width: size, height: size };
  if (url) {
    return (
      <img
        src={url}
        alt={`Photo of ${name}`}
        width={size}
        height={size}
        style={style}
        className="shrink-0 rounded-full border border-line object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: size * 0.38 }}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-wash font-display font-semibold text-canal"
    >
      {initials(name)}
    </span>
  );
}
