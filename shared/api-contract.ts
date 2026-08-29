/**
 * ATOM Mind — frontend/backend API contract for the ATOM MyNext challenge.
 *
 * Frontend and backend MUST use these types. Mock client and Convex actions
 * return the same shapes so UI can ship before Convex/LLM is wired.
 *
 * Endpoints (logical):
 *   listCustomers()
 *   getCustomerContext({ customerId })
 *   listPackages()
 *   recommend({ customerId, message })
 *   confirmAction({ customerId, recommendationId, actionId })  // demo only
 */

export type CustomerId = string;

export type IntentLabel =
  | "data_need"
  | "voice_need"
  | "support_sim"
  | "support_network"
  | "billing"
  | "unknown";

export type ApiSource = "mock" | "rules" | "llm";

export type Plan = {
  id: string;
  name: string;
  nameMm: string;
  dataGb: number;
  voiceMinutes: number;
  validityDays: number;
  monthlyFeeMmk: number;
};

export type PackageOffer = Plan & {
  tags: string[];
};

export type UsageSnapshot = {
  dataUsedGb: number;
  dataAllowanceGb: number;
  voiceUsedMin: number;
  voiceAllowanceMin: number;
  topUpsThisMonth: number;
  cycleDay: number;
  cycleLabelMm: string;
};

export type UsageMix = {
  youtubePct: number;
  gamingPct: number;
  socialPct: number;
  callsPct: number;
};

export type HistoryEvent = {
  id: string;
  dateLabel: string;
  eventMm: string;
  eventEn: string;
};

export type CustomerSummary = {
  id: CustomerId;
  displayName: string;
  displayNameMm: string;
  phoneMasked: string;
  currentPlanNameMm: string;
  oneLinerMm: string;
};

export type CustomerContext = {
  id: CustomerId;
  displayName: string;
  displayNameMm: string;
  phoneMasked: string;
  currentPlan: Plan;
  previousPlanNameMm: string;
  usage: UsageSnapshot;
  usageMix: UsageMix;
  history: HistoryEvent[];
  preferencesMm: string[];
};

export type RecommendRequest = {
  customerId: CustomerId;
  message: string;
  customerContext?: CustomerContext;
};

export type RecommendIntent = {
  label: IntentLabel;
  labelMm: string;
  confidence: number;
};

export type RecommendAction = {
  id: string;
  labelMm: string;
  labelEn: string;
};

export type UsageAnalysis = {
  dataBurnGbPerDay: number;
  estimatedDaysToEmpty: number | null;
  projectedMonthlyDataGb: number;
  topUpPatternMm: string;
  dominantMixMm: string;
  currentPlanFitScore: number;
  risk: "high" | "medium" | "low";
  insightMm: string;
};

export type RecommendResponse = {
  recommendationId: string;
  intent: RecommendIntent;
  analysis: UsageAnalysis;
  decisionConfidence: number;
  recommendationScore: number | null;
  recommendationSignalsMm: string[];
  scoreFactors: Array<{
    labelMm: string;
    detailMm: string;
    signal: "high" | "medium" | "low";
  }>;
  situationMm: string;
  whyCurrentDoesNotFitMm: string;
  recommendedPackage: PackageOffer | null;
  whyRecommendedMm: string;
  estimatedBenefitMm: string;
  action: RecommendAction;
  grounding: {
    citedFactsMm: string[];
  };
  source: ApiSource;
};

export type ConfirmActionRequest = {
  customerId: CustomerId;
  recommendationId: string;
  actionId: string;
};

export type ConfirmActionResponse = {
  ok: boolean;
  messageMm: string;
};

export type MynextApi = {
  listCustomers: () => Promise<CustomerSummary[]>;
  getCustomerContext: (customerId: CustomerId) => Promise<CustomerContext>;
  listPackages: () => Promise<PackageOffer[]>;
  recommend: (request: RecommendRequest) => Promise<RecommendResponse>;
  confirmAction: (
    request: ConfirmActionRequest,
  ) => Promise<ConfirmActionResponse>;
};
