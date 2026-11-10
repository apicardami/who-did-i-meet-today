import { describe, expect, it } from "vitest";
import { cleanSearchName, extractCandidates } from "@/lib/candidates";

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
