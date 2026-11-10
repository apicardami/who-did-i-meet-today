import { describe, expect, it } from "vitest";
import { decodeEntities, interpretInstagram, interpretLinkedIn, interpretWebsite, parseMeta } from "@/lib/meta";

describe("parseMeta", () => {
  it("reads og tags in either attribute order and decodes entities", () => {
    const html = `<html><head><title>Fallback</title>
      <meta content="Juan P&eacute;rez - PM - Copa Airlines | LinkedIn" property="og:title">
      <meta property='og:description' content='Location: Panama City · 500+ connections'>
      <meta property="og:image" content="https://media.example.com/p.jpg?a=1&amp;b=2"></head></html>`;
    const m = parseMeta(html);
    expect(m.title).toBe("Juan P&eacute;rez - PM - Copa Airlines | LinkedIn");
    expect(m.description).toBe("Location: Panama City · 500+ connections");
    expect(m.image).toBe("https://media.example.com/p.jpg?a=1&b=2");
  });

  it("falls back to <title>", () => {
    expect(parseMeta("<title>Hello &amp; welcome</title>").title).toBe("Hello & welcome");
  });

  it("decodes numeric entities", () => {
    expect(decodeEntities("P&#233;rez &#x1F44B;")).toBe("Pérez 👋");
  });
});

describe("interpret", () => {
  it("splits a LinkedIn title into name / headline / company", () => {
    const g = interpretLinkedIn({ title: "Juan Pérez - Product Manager - Copa Airlines | LinkedIn", description: "Location: Panama City · Experience: Copa", image: null });
    expect(g).toEqual({ name: "Juan Pérez", headline: "Product Manager", company: "Copa Airlines", location: "Panama City" });
  });

  it("ignores LinkedIn auth-wall titles", () => {
    expect(interpretLinkedIn({ title: "Sign Up | LinkedIn", description: null, image: null }).name).toBeNull();
  });

  it("reads Instagram name and bio", () => {
    const g = interpretInstagram(
      {
        title: "María López (@maria.lopez) • Instagram photos and videos",
        description: '1,204 Followers, 300 Following, 88 Posts - María López (@maria.lopez) on Instagram: "Surf + coffee in Santa Catalina"',
        image: null,
      },
      "maria.lopez",
    );
    expect(g.name).toBe("María López");
    expect(g.headline).toBe("Surf + coffee in Santa Catalina");
  });

  it("falls back to follower count for Instagram without a bio", () => {
    const g = interpretInstagram({ title: "Ana (@ana) • Instagram", description: "12.5K Followers, 10 Following, 5 Posts - See Instagram photos", image: null }, "ana");
    expect(g.headline).toBe("12.5K followers on Instagram");
  });

  it("uses the first title segment for generic sites", () => {
    expect(interpretWebsite({ title: "Jane Doe | Designer", description: "I design things", image: null }).name).toBe("Jane Doe");
  });
});
