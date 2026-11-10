import { stampParts } from "@/lib/dates";

export default function DateStamp({ date, size = "md" }: { date: string; size?: "sm" | "md" }) {
  const { day, month, year } = stampParts(date);
  const dim = size === "sm" ? "h-14 w-14" : "h-16 w-16";
  return (
    <span className={`stamp inline-flex ${dim} shrink-0 flex-col items-center justify-center leading-none`} aria-label={date}>
      <span className="font-display text-xl font-bold">{day}</span>
      <span className="text-[10px] font-semibold tracking-widest">{month}</span>
      <span className="text-[9px] tracking-wider">{year}</span>
    </span>
  );
}
