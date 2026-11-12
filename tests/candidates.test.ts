import { describe, expect, it } from "vitest";
import { cleanSearchName, extractCandidates, parseTerms, rankCandidates, type ProfileCandidate } from "@/lib/candidates";

const blocks = [
  { type: "server_tool_use", id: "x", name: "web_search", input: { query: "Juan Perez" } },
  {
    type: "web_search_tool_result",
    tool_use_id: "x",
    content: [
      { type: "web_search_result", url: "https://pa.linkedin.com/in/juan-perez-4a1b2c", title: "Juan Pérez - Product Manager - Copa Airlines | LinkedIn" },
      { type: "web_search_result", url: "https://www.linkedin.com/in/juan-perez-4a1b2c/", title: "duplicate" },
      { type: "web_search_result", url: "https://www.linkedin.com/company/copa-airlines/", title: "Copa Airlines | LinkedIn" },
      { type: "web_search_result", url: "https://www.instagram.com/juanp.pty/", title: "Juan Pérez (@juanp.pty) • Instagram photos and videos" },
      { type: "web_search_result", url: "https://www.instagram.com/p/Cabc123/", title: "a post" },
    ],
  },
  { type: "web_search_tool_result", tool_use_id: "y", content: { type: "web_search_tool_result_error", error_code: "max_uses_exceeded" } },
  { type: "text", text: "Here you go." },
];

describe("extractCandidates", () => {
  it("keeps LinkedIn and Instagram profiles, drops companies/posts/duplicates and error blocks", () => {
    const c = extractCandidates(blocks);
    expect(c).toEqual([
      { source: "linkedin", url: "https://www.linkedin.com/in/juan-perez-4a1b2c/", handle: null, name: "Juan Pérez", headline: "Product Manager · Copa Airlines" },
      { source: "instagram", url: "https://www.instagram.com/juanp.pty/", handle: "juanp.pty", name: "Juan Pérez", headline: null },
    ]);
  });

  it("returns nothing for junk input", () => {
    expect(extractCandidates([null, 1, "x", { type: "web_search_tool_result" }])).toEqual([]);
  });
});

describe("cleanSearchName", () => {
  it("keeps letters, accents, apostrophes and hyphens; strips quotes and symbols", () => {
    expect(cleanSearchName(' María-José O\'Neil "ignore previous" <b> ')).toBe("María-José O'Neil ignore previous b");
  });
});

const cand = (name: string, headline: string | null = null, url = "https://www.linkedin.com/in/x/"): ProfileCandidate => ({
  source: "linkedin",
  url,
  handle: null,
  name,
  headline,
});

describe("rankCandidates", () => {
  const a = cand("Juan Pérez", "Engineer · Acme");
  const b = cand("Juan Pérez", "Analyst · Copa Airlines · Panama");
  const c = cand("Juan Pérez", "Works with Luis Picard-ami at Beta");

  it("puts network matches first, then region matches, otherwise keeps order", () => {
    expect(rankCandidates([a, b, c], ["Luis Picardami"], ["Panama"])).toEqual([c, b, a]);
  });

  it("matches ignoring case, accents, spaces and hyphens", () => {
    expect(rankCandidates([a, cand("Juan", "PICARD AMI group")], ["picardami"])[0]?.headline).toBe("PICARD AMI group");
  });

  it("is a no-op with no terms and does not mutate the input", () => {
    const input = [a, b];
    expect(rankCandidates(input, [])).toEqual([a, b]);
    expect(input).toEqual([a, b]);
  });
});

describe("parseTerms", () => {
  it("splits, trims and drops empties", () => {
    expect(parseTerms(" Luis Picardami, ,Alberto ")).toEqual(["Luis Picardami", "Alberto"]);
    expect(parseTerms(undefined)).toEqual([]);
  });
});
