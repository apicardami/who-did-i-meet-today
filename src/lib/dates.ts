const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Local calendar date (the phone's timezone) as YYYY-MM-DD. */
export function localIsoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function stampParts(iso: string): { day: string; month: string; year: string } {
  const [y = "", m = "1", d = ""] = iso.split("-");
  return { day: String(Number(d)), month: MONTHS[Number(m) - 1] ?? "", year: y };
}

/** "Today", "Yesterday", or "Mon, Nov 3" (adds year if not this year). */
export function friendlyDate(iso: string, today: string = localIsoDate()): string {
  if (iso === today) return "Today";
  const [ty, tm, td] = today.split("-").map(Number);
  const yesterday = localIsoDate(new Date(ty ?? 1970, (tm ?? 1) - 1, (td ?? 1) - 1));
  if (iso === yesterday) return "Yesterday";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(y !== ty ? { year: "numeric" } : {}),
  });
}
