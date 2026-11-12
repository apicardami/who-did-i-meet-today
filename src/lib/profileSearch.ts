import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { extractCandidates, parseTerms, rankCandidates, type ProfileCandidate } from "./candidates";
import { logger, errorMessage } from "./logger";

export class SearchNotConfiguredError extends Error {}

const DEFAULT_MODEL = "claude-opus-5-5";
const DEFAULT_NETWORK = "Luis Picardami, Alberto Picardami";

/**
 * Uses Claude's server-side web search, restricted to linkedin.com and instagram.com, to find
 * profile candidates for a full name. The SDK client is created per call (never at module scope)
 * so importing this file never requires the key.
 */
export async function searchProfiles(name: string, hint: string | null): Promise<ProfileCandidate[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new SearchNotConfiguredError("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey, timeout: 45_000, maxRetries: 1 });
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const regionHint = process.env.SEARCH_REGION_HINT ?? "Panama";
  const network = parseTerms(process.env.SEARCH_NETWORK_HINT ?? DEFAULT_NETWORK);

  const prompt = [
    `Find the LinkedIn profile and the Instagram account of the person named "${name}".`,
    hint ? `Extra detail from the user: ${hint}.` : "",
    regionHint ? `They may be connected to ${regionHint}; prefer those matches but include other close matches too.` : "",
    network.length
      ? `Prefer people connected to ${network.join(" or ")} (also spelled Picard-ami): same employer, mutual connections, family or mentions of them in the profile; include other close matches after those.`
      : "",
    "Search LinkedIn and Instagram separately. Then reply with one short sentence; the search results are what matters.",
  ]
    .filter(Boolean)
    .join(" ");

  let messages: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: prompt }];
  const blocks: unknown[] = [];

  // A server-tool turn can pause; resume it at most once.
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.beta.messages.create({
      model,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      tools: [
        {
          type: "web_search_20260209",
          name: "web_search",
          max_uses: 4,
          allowed_domains: ["linkedin.com", "instagram.com"],
        },
      ],
      messages,
    });
    blocks.push(...res.content);
    if (res.stop_reason === "refusal") {
      logger.warn("profile search refused", { category: res.stop_details?.category ?? null });
      break;
    }
    if (res.stop_reason !== "pause_turn") break;
    messages = [...messages, { role: "assistant", content: res.content }];
  }

  try {
    return rankCandidates(extractCandidates(blocks), network, parseTerms(regionHint));
  } catch (err) {
    logger.error("candidate extraction failed", { error: errorMessage(err) });
    return [];
  }
}
