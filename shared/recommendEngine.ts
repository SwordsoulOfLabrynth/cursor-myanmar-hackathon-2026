import type {
  CustomerContext,
  IntentLabel,
  RecommendRequest,
  RecommendResponse,
  UsageAnalysis,
} from "./api-contract.ts";
import { getCustomerContext, PACKAGES } from "./demoCatalog.ts";

export function detectIntent(message: string): {
  label: IntentLabel;
  labelMm: string;
  confidence: number;
} {
  const m = message.toLowerCase();
  if (/sim|ဆင်းကတ်|ဆင်းကဒ်|စင်းကတ်|ပျောက်|ခိုး|ပိတ်ချင်|ကတ်မရ/.test(m)) {
    return { label: "support_sim", labelMm: "SIM အကူအညီ", confidence: 0.94 };
  }
  if (/ကွန်ရက်|လိုင်းမ|လိုင်းကျ|လိုင်းပြတ်|net မ|network|signal|အင်တာနက်မရ/.test(m)) {
    return {
      label: "support_network",
      labelMm: "ကွန်ရက် ပြဿနာ",
      confidence: 0.84,
    };
  }
  if (/ဘေလ်|bill|ငွေတောင်း|ငွေဖြတ်|လက်ကျန်|balance|ပိုက်ဆံ/.test(m)) {
    return { label: "billing", labelMm: "ငွေစာရင်း အကူအညီ", confidence: 0.9 };
  }
  if (/ခေါ်|မိနစ်|call|voice|ဖုန်းပြော/.test(m) && !/data|gb|ဒေတာ/.test(m)) {
    return { label: "voice_need", labelMm: "ဖုန်းခေါ် မိနစ်", confidence: 0.88 };
  }
  if (/data|ဒေတာ|gb|ကုန်|package|ပက်ကေ့|အစီအစဉ်|သုံးသင့်|အင်တာနက်/.test(m)) {
    return { label: "data_need", labelMm: "data / ပက်ကေ့ချ်", confidence: 0.92 };
  }
  return { label: "unknown", labelMm: "အထွေထွေ မေးခွန်း", confidence: 0.55 };
}

function dataPct(c: CustomerContext): number {
  return Math.round((c.usage.dataUsedGb / c.usage.dataAllowanceGb) * 100);
}

export function analyzeUsage(customer: CustomerContext): UsageAnalysis {
  const cycleDay = Math.max(1, customer.usage.cycleDay);
  const dataBurnGbPerDay = customer.usage.dataUsedGb / cycleDay;
  const remainingDataGb = Math.max(
    0,
    customer.usage.dataAllowanceGb - customer.usage.dataUsedGb,
  );
  const estimatedDaysToEmpty =
    dataBurnGbPerDay > 0 ? remainingDataGb / dataBurnGbPerDay : null;
  const projectedMonthlyDataGb = dataBurnGbPerDay * 30;
  const dataUsePct = dataPct(customer);
  const voiceUsePct = Math.round(
    (customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin) * 100,
  );
  const mix = [
    { label: "YouTube", value: customer.usageMix.youtubePct },
    { label: "ဂိမ်း", value: customer.usageMix.gamingPct },
    { label: "Social", value: customer.usageMix.socialPct },
    { label: "ဖုန်းခေါ်", value: customer.usageMix.callsPct },
  ].sort((a, b) => b.value - a.value);

  let currentPlanFitScore = 96;
  if (dataUsePct >= 90) currentPlanFitScore -= 25;
  if (projectedMonthlyDataGb < customer.usage.dataAllowanceGb * 0.5) {
    currentPlanFitScore -= 28;
  }
  if (voiceUsePct >= 90) currentPlanFitScore -= 28;
  currentPlanFitScore -= Math.min(21, customer.usage.topUpsThisMonth * 7);
  currentPlanFitScore = Math.max(20, currentPlanFitScore);

  const risk =
    currentPlanFitScore < 55 ? "high" : currentPlanFitScore < 78 ? "medium" : "low";
  const topUpPatternMm =
    customer.usage.topUpsThisMonth >= 2
      ? `${customer.usage.topUpsThisMonth} ကြိမ် top-up — အပိုကုန်ကျနေ`
      : customer.usage.topUpsThisMonth === 1
        ? "Top-up ၁ ကြိမ် — စောင့်ကြည့်ရန်"
        : "Top-up မရှိ — အပိုကုန်ကျမှု မတွေ့";
  const insightMm =
    risk === "high"
      ? `ဒီ ${customer.currentPlan.nameMm} က လက်ရှိ usage နဲ့ မကိုက်ပါ`
      : risk === "medium"
        ? `ဒီ plan က တစ်စိတ်တစ်ပိုင်းသာ ကိုက်ညီနေပါတယ်`
        : `လက်ရှိ plan က usage နဲ့ ကိုက်ညီနေပါတယ်`;

  return {
    dataBurnGbPerDay: Number(dataBurnGbPerDay.toFixed(2)),
    estimatedDaysToEmpty:
      estimatedDaysToEmpty === null
        ? null
        : Number(estimatedDaysToEmpty.toFixed(1)),
    projectedMonthlyDataGb: Number(projectedMonthlyDataGb.toFixed(1)),
    topUpPatternMm,
    dominantMixMm: mix
      .slice(0, 3)
      .map((item) => `${item.label} ${item.value}%`)
      .join(" · "),
    currentPlanFitScore,
    risk,
    insightMm,
  };
}

function buildId(customerId: string): string {
  return `rec-${customerId}-${Date.now()}`;
}

type ScoredResponse = Omit<
  RecommendResponse,
  | "analysis"
  | "decisionConfidence"
  | "scoreFactors"
  | "recommendationScore"
  | "recommendationSignalsMm"
>;

function withScore(
  response: ScoredResponse,
  customer: CustomerContext,
  packageDecision?: { score: number; signalsMm: string[] },
): RecommendResponse {
  const analysis = analyzeUsage(customer);
  const isSupport = response.recommendedPackage === null &&
    response.intent.label.startsWith("support_");
  const evidenceCount = response.grounding.citedFactsMm.length;
  const decisionConfidence = Math.min(
    0.98,
    0.62 + evidenceCount * 0.06 + response.intent.confidence * 0.12,
  );

  return {
    ...response,
    analysis,
    recommendationScore: packageDecision?.score ?? null,
    recommendationSignalsMm: packageDecision?.signalsMm ?? [],
    grounding: {
      citedFactsMm: [
        `Analyzer: data ${analysis.dataBurnGbPerDay} GB/ရက် · လကုန် ${analysis.projectedMonthlyDataGb} GB ခန့်`,
        `Plan fit: ${analysis.currentPlanFitScore}/100 · ${analysis.topUpPatternMm}`,
        ...response.grounding.citedFactsMm,
      ],
    },
    decisionConfidence: Number(decisionConfidence.toFixed(2)),
    scoreFactors: [
      {
        labelMm: "လိုအပ်ချက်",
        detailMm: `${response.intent.labelMm} · ${Math.round(response.intent.confidence * 100)}%`,
        signal: response.intent.confidence >= 0.85 ? "high" : "medium",
      },
      {
        labelMm: "သုံးစွဲနှုန်း",
        detailMm: `${analysis.dataBurnGbPerDay} GB/ရက် · fit ${analysis.currentPlanFitScore}/100`,
        signal: analysis.risk,
      },
      {
        labelMm: "အပြုအမူ",
        detailMm: isSupport
          ? "မလိုအပ်တဲ့ package မရောင်းပါ"
          : `Top-up ${customer.usage.topUpsThisMonth} ကြိမ် · ${customer.preferencesMm[0] ?? "အသုံးပြုမှတ်တမ်း"}`,
        signal: customer.usage.topUpsThisMonth > 1 || isSupport ? "high" : "low",
      },
    ],
  };
}

type PackageScore = {
  package: (typeof PACKAGES)[number];
  score: number;
  dataFit: number;
  voiceFit: number;
  effectiveDataDemandGb: number;
  effectiveVoiceDemandMin: number;
  dataWeight: number;
  recentDataTopUps: number;
  recentVoiceShortages: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function capacityFit(capacity: number, demand: number): number {
  if (demand <= 0) return 100;
  if (capacity >= demand) {
    return 100 - Math.min(45, (capacity / demand - 1) * 35);
  }
  return 100 - Math.min(90, (1 - capacity / demand) * 110);
}

function countRecentHistory(
  customer: CustomerContext,
  pattern: RegExp,
): number {
  const datedEvents = customer.history
    .map((event) => ({ event, timestamp: Date.parse(event.dateLabel) }))
    .filter((item) => Number.isFinite(item.timestamp));
  const latestTimestamp = Math.max(...datedEvents.map((item) => item.timestamp));
  if (!Number.isFinite(latestTimestamp)) return 0;
  const recentThreshold = latestTimestamp - 31 * 24 * 60 * 60 * 1000;
  return datedEvents.filter(
    ({ event, timestamp }) =>
      timestamp >= recentThreshold &&
      pattern.test(`${event.eventEn} ${event.eventMm}`),
  ).length;
}

/**
 * Scores every catalog package from usage, projected demand, mix and history.
 * Customer IDs never participate in this calculation.
 */
export function scoreCatalogPackages(
  customer: CustomerContext,
  intent: IntentLabel = "unknown",
): PackageScore[] {
  const analysis = analyzeUsage(customer);
  const dataPressure =
    customer.usage.dataAllowanceGb > 0
      ? customer.usage.dataUsedGb / customer.usage.dataAllowanceGb
      : 0;
  const voicePressure =
    customer.usage.voiceAllowanceMin > 0
      ? customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin
      : 0;
  const recentDataTopUps = countRecentHistory(customer, /data top-up|data.*အပို/i);
  const recentVoiceShortages = countRecentHistory(
    customer,
    /minutes? exhausted|မိနစ်.*ကုန်/i,
  );
  const topUpEvidence = Math.max(
    customer.usage.topUpsThisMonth,
    recentDataTopUps,
  );
  const effectiveDataDemandGb =
    analysis.projectedMonthlyDataGb *
    (1 +
      Math.min(
        0.8,
        topUpEvidence * 0.18 + (dataPressure >= 0.85 ? 0.12 : 0),
      ));
  const projectedVoiceMinutes =
    (customer.usage.voiceUsedMin / Math.max(1, customer.usage.cycleDay)) * 30;
  const effectiveVoiceDemandMin =
    projectedVoiceMinutes *
    (1 +
      Math.min(
        0.25,
        recentVoiceShortages * 0.15 + (voicePressure >= 0.9 ? 0.08 : 0),
      ));
  const intentVoiceAdjustment = intent === "voice_need" ? 0.05 : 0;
  const intentDataAdjustment = intent === "data_need" ? -0.05 : 0;
  const voiceWeight = clamp(
    customer.usageMix.callsPct / 100 * 0.65 +
      voicePressure * 0.25 +
      Math.min(0.1, recentVoiceShortages * 0.1) +
      intentVoiceAdjustment +
      intentDataAdjustment,
    0.12,
    0.82,
  );
  const dataWeight = 1 - voiceWeight;

  return PACKAGES.map((packageOffer) => {
    const monthlyMultiplier = 30 / packageOffer.validityDays;
    const monthlyDataGb = packageOffer.dataGb * monthlyMultiplier;
    const monthlyVoiceMinutes = packageOffer.voiceMinutes * monthlyMultiplier;
    const monthlyFeeMmk = packageOffer.monthlyFeeMmk * monthlyMultiplier;
    const dataFit = capacityFit(monthlyDataGb, effectiveDataDemandGb);
    const voiceFit = capacityFit(
      monthlyVoiceMinutes,
      effectiveVoiceDemandMin,
    );
    const weightedFit = dataFit * dataWeight + voiceFit * voiceWeight;
    const feeDeltaRatio =
      (monthlyFeeMmk - customer.currentPlan.monthlyFeeMmk) /
      Math.max(1, customer.currentPlan.monthlyFeeMmk);
    const priceScore = clamp(88 - feeDeltaRatio * 25, 48, 100);
    const isCurrentPlan = packageOffer.id === customer.currentPlan.id;
    const currentPlanMeetsDemand =
      monthlyDataGb >= effectiveDataDemandGb &&
      monthlyVoiceMinutes >= effectiveVoiceDemandMin;
    const continuityAdjustment = isCurrentPlan
      ? currentPlanMeetsDemand && topUpEvidence === 0
        ? 12
        : -Math.min(15, topUpEvidence * 5 + recentVoiceShortages * 8)
      : 0;
    const mixAdjustment =
      (packageOffer.tags.includes("heavy-data") && dataWeight >= 0.7 ? 9 : 0) +
      (packageOffer.tags.includes("streaming") &&
      customer.usageMix.youtubePct >= 35
        ? 5
        : 0) +
      (packageOffer.tags.includes("youtube") &&
      customer.usageMix.youtubePct >= 35
        ? 5
        : 0) +
      (packageOffer.tags.includes("voice") && voiceWeight >= 0.55 ? 10 : 0);
    const shortValidityPenalty = packageOffer.validityDays < 28 ? 25 : 0;
    const score = clamp(
      weightedFit * 0.72 +
        priceScore * 0.18 +
        8 +
        continuityAdjustment +
        mixAdjustment -
        shortValidityPenalty,
      0,
      100,
    );

    return {
      package: packageOffer,
      score: Number(score.toFixed(1)),
      dataFit: Number(dataFit.toFixed(1)),
      voiceFit: Number(voiceFit.toFixed(1)),
      effectiveDataDemandGb: Number(effectiveDataDemandGb.toFixed(1)),
      effectiveVoiceDemandMin: Math.round(effectiveVoiceDemandMin),
      dataWeight: Number(dataWeight.toFixed(2)),
      recentDataTopUps,
      recentVoiceShortages,
    };
  }).sort((a, b) => b.score - a.score);
}

function recommendationSignalsMm(
  customer: CustomerContext,
  winner: PackageScore,
): string[] {
  const dataUsePercent = dataPct(customer);
  const voiceUsePercent = Math.round(
    (customer.usage.voiceUsedMin /
      Math.max(1, customer.usage.voiceAllowanceMin)) *
      100,
  );
  const signals = [
    `လစဉ် data ခန့်မှန်း ${winner.effectiveDataDemandGb} GB · ${winner.package.nameMm} တွင် ${winner.package.dataGb} GB`,
    winner.dataWeight >= 0.5
      ? `Data သုံးစွဲမှု ${dataUsePercent}% · YouTube/ဂိမ်း ${customer.usageMix.youtubePct + customer.usageMix.gamingPct}%`
      : `ဖုန်းခေါ် သုံးစွဲမှု ${voiceUsePercent}% · အသုံးပြုမှု mix ${customer.usageMix.callsPct}%`,
  ];
  if (customer.usage.topUpsThisMonth > 0 || winner.recentDataTopUps > 0) {
    signals.push(
      `ဒီလ top-up ${customer.usage.topUpsThisMonth} ကြိမ် · မကြာသေးမီ data top-up မှတ်တမ်း ${winner.recentDataTopUps} ခု`,
    );
  } else if (winner.recentVoiceShortages > 0) {
    signals.push(
      `လစဉ် ခေါ်မိနစ် ခန့်မှန်း ${winner.effectiveVoiceDemandMin} · မိနစ်ကုန်မှတ်တမ်း ${winner.recentVoiceShortages} ခု`,
    );
  } else {
    signals.push(
      `Top-up မရှိ · လက်ရှိ ${customer.currentPlan.nameMm} နှင့် ကုန်ကျစရိတ်ကို နှိုင်းယှဉ်ထား`,
    );
  }
  return signals.slice(0, 3);
}

export function recommend(request: RecommendRequest): RecommendResponse {
  const customer = getCustomerContext(request.customerId);
  const intent = detectIntent(request.message);
  const usedPct = dataPct(customer);

  if (intent.label === "support_sim") {
    return withScore({
      recommendationId: buildId(customer.id),
      intent,
      situationMm: `${customer.displayNameMm} — နံပါတ် ${customer.phoneMasked}။ လက်ရှိ ${customer.currentPlan.nameMm} သုံးနေသည်။`,
      whyCurrentDoesNotFitMm:
        "ဒါက ပက်ကေ့ချ် ပြဿနာ မဟုတ်။ SIM ပျောက်/ခိုးခံရခြင်းကို ပက်ကေ့ချ် ပြောင်းလဲ၍ မဖြေရှင်းနိုင်ပါ။",
      recommendedPackage: null,
      whyRecommendedMm:
        "နံပါတ် ထိန်းထားရန် ဆိုင်တွင် ID ဖြင့် ပိတ်/အသစ် လဲရမည်။",
      estimatedBenefitMm: "နံပါတ် မပျောက်၊ အလွဲသုံး စောစီးစွာ ရပ်နိုင်သည်။",
      action: {
        id: "open_sim_help",
        labelMm: "SIM အကူအညီ ဖွင့်မည်",
        labelEn: "Open SIM help",
      },
      grounding: {
        citedFactsMm: [
          `ဖောက်သည်: ${customer.displayNameMm}`,
          `နံပါတ်: ${customer.phoneMasked}`,
        ],
      },
      source: "rules",
    }, customer);
  }

  if (intent.label === "support_network") {
    return withScore({
      recommendationId: buildId(customer.id),
      intent,
      situationMm: `${customer.displayNameMm} ကွန်ရက် မရဟု ပြောသည်။ လက်ရှိ ပက်ကေ့ချ် ${customer.currentPlan.nameMm}။`,
      whyCurrentDoesNotFitMm:
        "ကွန်ရက် ပြတ်တောက်မှုကို data ပိုဝယ်၍ မပြင်နိုင်ပါ။",
      recommendedPackage: null,
      whyRecommendedMm: "ဧရိယာ စစ်ဆေး + restart လမ်းညွှန် ပေးရန်။",
      estimatedBenefitMm: "မလိုအပ်သော ပက်ကေ့ချ် အပိုဝယ်မှု ရှောင်နိုင်သည်။",
      action: {
        id: "open_network_help",
        labelMm: "လိုင်း စစ်ဆေးမည်",
        labelEn: "Check coverage",
      },
      grounding: {
        citedFactsMm: [`ပက်ကေ့ချ်: ${customer.currentPlan.nameMm}`],
      },
      source: "rules",
    }, customer);
  }

  if (intent.label === "billing") {
    return withScore({
      recommendationId: buildId(customer.id),
      intent,
      situationMm: `${customer.displayNameMm} ၏ ${customer.currentPlan.nameMm} နှင့် ဒီလ top-up ${customer.usage.topUpsThisMonth} ကြိမ်ကို စစ်ဆေးထားသည်။`,
      whyCurrentDoesNotFitMm:
        "ငွေဖြတ်တောက်မှု မရှင်းလင်းသေးဘဲ ပက်ကေ့ချ် ပြောင်းခြင်းက ပြဿနာကို ပိုရှုပ်စေနိုင်သည်။",
      recommendedPackage: null,
      whyRecommendedMm:
        "အရင်ဆုံး နောက်ဆုံးငွေဖြတ်တောက်မှုနှင့် top-up မှတ်တမ်းကို တစ်ကြောင်းချင်း စစ်ဆေးသင့်သည်။",
      estimatedBenefitMm:
        "မလိုအပ်သော ဝယ်ယူမှု မလုပ်ဘဲ မရှင်းလင်းသည့် ကုန်ကျစရိတ်ကို တိတိကျကျ ရှာနိုင်သည်။",
      action: {
        id: "open_billing_help",
        labelMm: "ငွေစာရင်း စစ်မည်",
        labelEn: "Review charges",
      },
      grounding: {
        citedFactsMm: [
          `လက်ရှိအစီအစဉ်: ${customer.currentPlan.nameMm}`,
          `လစဉ်ကြေး: ${customer.currentPlan.monthlyFeeMmk.toLocaleString()} ကျပ်`,
          `ဒီလ top-up: ${customer.usage.topUpsThisMonth} ကြိမ်`,
        ],
      },
      source: "rules",
    }, customer);
  }

  const [winner] = scoreCatalogPackages(customer, intent.label);
  if (!winner) {
    throw new Error("Package catalog is empty");
  }
  const keepCurrent = winner.package.id === customer.currentPlan.id;
  const signalsMm = recommendationSignalsMm(customer, winner);
  const voiceLed = winner.dataWeight < 0.5;
  const dataLeftGb = Math.max(
    0,
    customer.usage.dataAllowanceGb - customer.usage.dataUsedGb,
  );
  const feeDifference =
    winner.package.monthlyFeeMmk - customer.currentPlan.monthlyFeeMmk;

  return withScore({
    recommendationId: buildId(customer.id),
    intent,
    situationMm: `${customer.displayNameMm} — data ${customer.usage.dataUsedGb}/${customer.usage.dataAllowanceGb} GB (${usedPct}%)၊ ဖုန်း ${customer.usage.voiceUsedMin}/${customer.usage.voiceAllowanceMin} မိနစ်၊ top-up ${customer.usage.topUpsThisMonth} ကြိမ်။`,
    whyCurrentDoesNotFitMm:
      keepCurrent
        ? `လစဉ် data ${winner.effectiveDataDemandGb} GB နှင့် ခေါ်မိနစ် ${winner.effectiveVoiceDemandMin} ခန့်ဖြစ်၍ လက်ရှိ ${customer.currentPlan.nameMm} က လုံလောက်နေသည်။`
        : voiceLed
          ? `Data ${dataLeftGb.toFixed(1)} GB ကျန်သော်လည်း ခေါ်မိနစ်သုံးစွဲမှု ${Math.round((customer.usage.voiceUsedMin / Math.max(1, customer.usage.voiceAllowanceMin)) * 100)}% ရှိသဖြင့် လက်ရှိ plan ရဲ့ mix မကိုက်ပါ။`
          : `လစဉ် data လိုအပ်ချက် ${winner.effectiveDataDemandGb} GB ခန့်နှင့် top-up မှတ်တမ်းကြောင့် လက်ရှိ ${customer.currentPlan.nameMm} မလုံလောက်နိုင်ပါ။`,
    recommendedPackage: keepCurrent ? null : winner.package,
    whyRecommendedMm:
      keepCurrent
        ? `Score ${winner.score}/100 ဖြင့် လက်ရှိ ${customer.currentPlan.nameMm} ကို ဆက်သုံးခြင်းက အကောင်းဆုံး — မလိုအပ်သော upsell မလုပ်ပါ။`
        : `${winner.package.nameMm} က data fit ${winner.dataFit}/100၊ voice fit ${winner.voiceFit}/100 နှင့် စုစုပေါင်း score ${winner.score}/100 ရရှိသည်။`,
    estimatedBenefitMm: keepCurrent
      ? `လက်ရှိ plan ကို ဆက်ထား၍ မလိုအပ်သော လစဉ်ကုန်ကျစရိတ် တိုးခြင်းကို ရှောင်နိုင်သည်။`
      : feeDifference <= 0
        ? `လက်ရှိထက် တစ်လ ${Math.abs(feeDifference).toLocaleString()} ကျပ်ခန့် သက်သာပြီး လိုအပ်ချက်နှင့် ပိုကိုက်နိုင်သည်။`
        : `တစ်လ ${feeDifference.toLocaleString()} ကျပ်ခန့် ပိုကျသော်လည်း လိုအပ်သည့် allowance ကို plan တစ်ခုထဲတွင် ပိုကိုက်စေသည်။`,
    action: {
      id: keepCurrent ? `keep_${winner.package.id}` : `switch_${winner.package.id}`,
      labelMm: keepCurrent
        ? `${winner.package.nameMm} ဆက်သုံးမည်`
        : `${winner.package.nameMm} သို့ ပြောင်းမည်`,
      labelEn: keepCurrent
        ? `Keep ${winner.package.name}`
        : `Switch to ${winner.package.name}`,
    },
    grounding: {
      citedFactsMm: signalsMm,
    },
    source: "rules",
  }, customer, { score: winner.score, signalsMm });
}
