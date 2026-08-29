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

async function enrichWithLlm(
  request: RecommendRequest,
  base: RecommendResponse,
): Promise<RecommendResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return base;

  const customer = getCustomerContext(request.customerId);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a Burmese telecom concierge. Return JSON only with situationMm, whyCurrentDoesNotFitMm, whyRecommendedMm, estimatedBenefitMm. Write concise natural Burmese. Ground every claim in the supplied synthetic facts. Do not invent packages, prices, IDs, benefits, or customer facts. Do not mention real customer data.",
        },
        {
          role: "user",
          content: JSON.stringify({
            question: request.message,
            syntheticCustomer: customer,
            allowedPackageCatalog: listPackages(),
            lockedDecision: base,
          }),
        },
      ],
    }),
  });

  if (!response.ok) return base;
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") return base;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return base;
  const content = (
    choices[0] as { message?: { content?: unknown } }
  ).message?.content;
  if (typeof content !== "string") return base;

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
