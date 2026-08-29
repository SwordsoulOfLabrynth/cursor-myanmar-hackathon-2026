import type {
  CustomerId,
  RecommendRequest,
  RecommendResponse,
} from "../../shared/api-contract";
import { getCustomerContext, listPackages } from "../../shared/demoCatalog";
import { recommend } from "../../shared/recommendEngine";

const CUSTOMER_IDS = new Set<CustomerId>(["su-su", "ko-ko", "ma-ma"]);

type LlmCopy = Pick<
  RecommendResponse,
  | "situationMm"
  | "whyCurrentDoesNotFitMm"
  | "whyRecommendedMm"
  | "estimatedBenefitMm"
>;

function isRequest(value: unknown): value is RecommendRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.customerId === "string" &&
    CUSTOMER_IDS.has(input.customerId as CustomerId) &&
    typeof input.message === "string" &&
    input.message.trim().length > 0 &&
    input.message.length <= 500
  );
}

function isLlmCopy(value: unknown): value is LlmCopy {
  if (!value || typeof value !== "object") return false;
  const copy = value as Record<string, unknown>;
  return [
    "situationMm",
    "whyCurrentDoesNotFitMm",
    "whyRecommendedMm",
    "estimatedBenefitMm",
  ].every(
    (key) =>
      typeof copy[key] === "string" &&
      (copy[key] as string).trim().length > 0 &&
      (copy[key] as string).length <= 500,
  );
}

function buildPrompt(
  request: RecommendRequest,
  base: RecommendResponse,
): string {
  return JSON.stringify({
    instruction:
      "Return JSON only with situationMm, whyCurrentDoesNotFitMm, whyRecommendedMm, estimatedBenefitMm. Write concise natural Burmese. Never change the locked decision or invent packages, prices, benefits, IDs, or customer facts.",
    question: request.message,
    syntheticCustomer: getCustomerContext(request.customerId),
    allowedPackageCatalog: listPackages(),
    lockedDecision: base,
  });
}

async function requestLlmCopy(
  request: RecommendRequest,
  base: RecommendResponse,
): Promise<string | null> {
  const gatewayUrl = process.env.NETLIFY_AI_GATEWAY_URL;
  const openAiKey = process.env.OPENAI_API_KEY;
  const gatewayKey =
    process.env.NETLIFY_AI_GATEWAY_TOKEN ?? process.env.AI_GATEWAY_API_KEY;

  if (gatewayUrl || openAiKey) {
    const response = await fetch(
      gatewayUrl ?? `${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${gatewayKey ?? openAiKey ?? ""}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are ATOM Mind, a Burmese telecom concierge. Use only supplied synthetic facts and the allowed catalog.",
            },
            { role: "user", content: buildPrompt(request, base) },
          ],
        }),
      },
    );
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return null;
    const choices = (payload as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const content = (
      choices[0] as { message?: { content?: unknown } }
    ).message?.content;
    return typeof content === "string" ? content : null;
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
      max_tokens: 700,
      temperature: 0.2,
      system:
        "You are ATOM Mind, a Burmese telecom concierge. Return one JSON object only. Use only supplied synthetic facts and the allowed catalog.",
      messages: [{ role: "user", content: buildPrompt(request, base) }],
    }),
  });
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return null;
  const content = (payload as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;
  const textBlock = content.find(
    (block): block is { type: "text"; text: string } =>
      typeof block === "object" &&
      block !== null &&
      (block as { type?: unknown }).type === "text" &&
      typeof (block as { text?: unknown }).text === "string",
  );
  return textBlock?.text ?? null;
}

async function enrichWithLlm(
  request: RecommendRequest,
  base: RecommendResponse,
): Promise<RecommendResponse> {
  const content = await requestLlmCopy(request, base);
  if (!content) return base;

  try {
    const copy: unknown = JSON.parse(content);
    if (!isLlmCopy(copy)) return base;
    return { ...base, ...copy, source: "llm" };
  } catch {
    return base;
  }
}

export default async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const input: unknown = await request.json();
    if (!isRequest(input)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const base = recommend(input);
    const result = await enrichWithLlm(input, base);
    return Response.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Recommendation unavailable" },
      { status: 500 },
    );
  }
};
