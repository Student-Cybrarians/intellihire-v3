/**
 * Single AI entry point for IntelliHire.
 *
 * Resolves the Cloudflare Workers AI binding (`env.AI`) from the current
 * request context using the exact same symbol accessor pattern as the database
 * layer (`src/lib/db.ts`). When the binding is present it runs a real model
 * call; otherwise (local `next dev`, `next build`, or unit tests) it returns a
 * deterministic fallback string derived solely from the provided input so the
 * app keeps working without any Aer Workers AI binding and never fabricates
 * user-specific facts.
 */

// Must match the symbol key used by `@cloudflare/next-on-pages`.
const CLOUDFLARE_REQUEST_CONTEXT = Symbol.for("__cloudflare-request-context__");

/** Model used for all generation calls. Fast, low-latency Llama 3.3 70B. */
const DEFAULT_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

/** Default generation cap in tokens. */
const DEFAULT_MAX_TOKENS = 600;

/**
 * Prefix prepended to every deterministic fallback string so callers that want
 * to substitute their own canned text when the real model is unavailable (e.g.
 * the interview routes) can detect the fallback cheaply.
 */
export const AI_FALLBACK_PREFIX = "[AI offline - deterministic fallback]";

export interface AskAIInput {
  /** System prompt. Authorized/retrieved context and instructions go here. */
  system: string;
  /** User turn. Raw user message / submitted content goes here. */
  user: string;
  maxTokens?: number;
}

/** Minimal structural shape of the Workers AI binding actually needed here. */
interface AiBinding {
  run(model: string, input: unknown): Promise<{ response?: string }>;
}

interface CloudflareRequestContextWithAi {
  env?: { AI?: AiBinding };
}

/**
 * Resolve the current request's `env.AI` binding, or `undefined` when absent
 * (local dev / tests). Mirrors `currentCloudflareEnv()` in `db.ts`.
 */
function currentAiBinding(): AiBinding | undefined {
  try {
    const ctx = (globalThis as Record<symbol, unknown>)[CLOUDFLARE_REQUEST_CONTEXT] as
      | CloudflareRequestContextWithAi
      | undefined;
    return ctx?.env?.AI;
  } catch {
    return undefined;
  }
}

/**
 * Deterministic fallback built purely from the caller's own input. It never
 * invents facts: it restates the provided user content in a structured, useful
 * way so the downstream consumer always gets a sensible string to work with.
 */
function fallback(input: AskAIInput): string {
  const trimmed = input.user.trim();
  const display = trimmed.length > 1400 ? `${trimmed.slice(0, 1400)}…` : trimmed || "No input provided.";
  const lines = [
    `${AI_FALLBACK_PREFIX}`,
    "The AI model is not available right now, so here is a structured restatement of what was provided:",
    "",
    display,
    "",
    "When the AI service is reachable this response is replaced with a fully analyzed, grounded answer.",
  ];
  return lines.join("\n");
}

/**
 * Run a real model call through the Workers AI binding, or an `askAI` call with
 * the deterministic fallback when the binding / call / parse fails. Never throws.
 *
 * @returns the model's `response` text, or `fallback(input)` when `env.AI` is
 *   unavailable or the call errors.
 */
export async function askAI(input: AskAIInput): Promise<string> {
  const ai = currentAiBinding();
  if (!ai) {
    return fallback(input);
  }
  try {
    const out = await ai.run(DEFAULT_MODEL, {
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      max_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
    });
    const text = out?.response?.trim();
    if (text) {
      return text;
    }
    return fallback(input);
  } catch (err) {
    console.error("[ai] Workers AI call failed, using deterministic fallback:", err);
    return fallback(input);
  }
}

/** True when `text` was produced by the deterministic fallback (no real model). */
export function isFallback(text: string): boolean {
  return text.startsWith(AI_FALLBACK_PREFIX);
}
