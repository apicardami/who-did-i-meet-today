import { afterEach, describe, expect, it, vi } from "vitest";
import { trackPageView } from "@/lib/track";
import { GALLERY_TRACK_URL } from "@/lib/constants";

afterEach(() => vi.unstubAllGlobals());

describe("trackPageView", () => {
  it("does nothing on the server", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    trackPageView("who-did-i-meet-today");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts slug and session id to the gallery, and swallows failures", async () => {
    const store = new Map<string, string>();
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("window", {});
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
    trackPageView("who-did-i-meet-today");
    trackPageView("who-did-i-meet-today");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const calls = fetchMock.mock.calls as [string, { body: string }][];
    expect(calls[0]?.[0]).toBe(GALLERY_TRACK_URL);
    const first = JSON.parse(calls[0]?.[1].body ?? "{}");
    const second = JSON.parse(calls[1]?.[1].body ?? "{}");
    expect(first.slug).toBe("who-did-i-meet-today");
    expect(first.session_id).toBe(second.session_id);
    await Promise.resolve();
  });
});
