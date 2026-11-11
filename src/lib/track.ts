import { GALLERY_TRACK_URL } from "@/lib/constants";

const SESSION_KEY = "__fgsid";

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

export function trackPageView(slug: string): void {
  if (typeof window === "undefined") return;
  fetch(GALLERY_TRACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, session_id: getSessionId() }),
    keepalive: true,
  }).catch(() => {});
}
