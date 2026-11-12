import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { parseFaceBox, type FaceBox } from "./faceCrop";

export class LocateNotConfiguredError extends Error {}

const DEFAULT_MODEL = "claude-opus-5-5";

const TOOL: Anthropic.Messages.Tool = {
  name: "report_profile_photo",
  description: "Report where the main profile photo (the person's face) is in the screenshot.",
  input_schema: {
    type: "object",
    properties: {
      found: { type: "boolean", description: "False if no person's face is clearly visible." },
      box: {
        type: "object",
        description: "Tight box around the main profile photo's face, as fractions of image width/height (0 to 1). x,y is the top-left corner.",
        properties: { x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } },
        required: ["x", "y", "w", "h"],
      },
    },
    required: ["found"],
  },
};

/**
 * Asks Claude (vision, forced tool call) for the box around the main profile photo in a screenshot.
 * The SDK client is created per call so importing this file never requires the key.
 */
export async function locateFace(jpegBase64: string): Promise<FaceBox | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new LocateNotConfiguredError("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey, timeout: 25_000, maxRetries: 1 });
  const res = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: 300,
    tools: [TOOL],
    tool_choice: { type: "tool", name: TOOL.name },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpegBase64 } },
          {
            type: "text",
            text: "This is a screenshot of a LinkedIn or Instagram profile. Locate the profile owner's main profile photo (usually the largest face near the top, not other people in suggestions or posts). Report it with the tool.",
          },
        ],
      },
    ],
  });
  const use = res.content.find((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use");
  return use ? parseFaceBox(use.input) : null;
}
