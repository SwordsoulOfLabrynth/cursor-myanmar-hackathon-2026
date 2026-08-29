import { v } from "convex/values";

export const customerIdValidator = v.union(
  v.literal("su-su"),
  v.literal("ko-ko"),
  v.literal("ma-ma"),
);

const planFields = {
  id: v.string(),
  name: v.string(),
  nameMm: v.string(),
  dataGb: v.number(),
  voiceMinutes: v.number(),
  validityDays: v.number(),
  monthlyFeeMmk: v.number(),
};

export const packageValidator = v.object({
  ...planFields,
  tags: v.array(v.string()),
});

export const customerSummaryValidator = v.object({
  id: customerIdValidator,
  displayName: v.string(),
  displayNameMm: v.string(),
  phoneMasked: v.string(),
  currentPlanNameMm: v.string(),
  oneLinerMm: v.string(),
});

export const customerContextValidator = v.object({
  id: customerIdValidator,
  displayName: v.string(),
  displayNameMm: v.string(),
  phoneMasked: v.string(),
  currentPlan: v.object(planFields),
  previousPlanNameMm: v.string(),
  usage: v.object({
    dataUsedGb: v.number(),
    dataAllowanceGb: v.number(),
    voiceUsedMin: v.number(),
    voiceAllowanceMin: v.number(),
    topUpsThisMonth: v.number(),
    cycleDay: v.number(),
    cycleLabelMm: v.string(),
  }),
  usageMix: v.object({
    youtubePct: v.number(),
    gamingPct: v.number(),
    socialPct: v.number(),
    callsPct: v.number(),
  }),
  history: v.array(
    v.object({
      id: v.string(),
      dateLabel: v.string(),
      eventMm: v.string(),
      eventEn: v.string(),
    }),
  ),
  preferencesMm: v.array(v.string()),
});

export const recommendResponseValidator = v.object({
  recommendationId: v.string(),
  intent: v.object({
    label: v.union(
      v.literal("data_need"),
      v.literal("voice_need"),
      v.literal("support_sim"),
      v.literal("support_network"),
      v.literal("billing"),
      v.literal("unknown"),
    ),
    labelMm: v.string(),
    confidence: v.number(),
  }),
  analysis: v.object({
    dataBurnGbPerDay: v.number(),
    estimatedDaysToEmpty: v.union(v.number(), v.null()),
    projectedMonthlyDataGb: v.number(),
    topUpPatternMm: v.string(),
    dominantMixMm: v.string(),
    currentPlanFitScore: v.number(),
    risk: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    insightMm: v.string(),
  }),
  decisionConfidence: v.number(),
  recommendationScore: v.union(v.number(), v.null()),
  recommendationSignalsMm: v.array(v.string()),
  scoreFactors: v.array(
    v.object({
      labelMm: v.string(),
      detailMm: v.string(),
      signal: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    }),
  ),
  situationMm: v.string(),
  whyCurrentDoesNotFitMm: v.string(),
  recommendedPackage: v.union(packageValidator, v.null()),
  whyRecommendedMm: v.string(),
  estimatedBenefitMm: v.string(),
  action: v.object({
    id: v.string(),
    labelMm: v.string(),
    labelEn: v.string(),
  }),
  grounding: v.object({
    citedFactsMm: v.array(v.string()),
  }),
  source: v.union(v.literal("mock"), v.literal("rules"), v.literal("llm")),
});
