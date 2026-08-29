import type {
  CustomerContext,
  IntentLabel,
  RecommendRequest,
  RecommendResponse,
} from "./api-contract.ts";
import { getCustomerContext, getPackageById } from "./demoCatalog.ts";

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

function buildId(customerId: string): string {
  return `rec-${customerId}-${Date.now()}`;
}

export function recommend(request: RecommendRequest): RecommendResponse {
  const customer = getCustomerContext(request.customerId);
  const intent = detectIntent(request.message);
  const usedPct = dataPct(customer);

  if (intent.label === "support_sim") {
    return {
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
    };
  }

  if (intent.label === "support_network") {
    return {
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
    };
  }

  if (intent.label === "billing") {
    return {
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
    };
  }

  if (intent.label === "voice_need" && customer.id !== "ko-ko") {
    const pack = getPackageById("atom-voice-120");
    return {
      recommendationId: buildId(customer.id),
      intent,
      situationMm: `${customer.displayNameMm} သည် ဖုန်း ${customer.usage.voiceUsedMin}/${customer.usage.voiceAllowanceMin} မိနစ် သုံးထားသည်။`,
      whyCurrentDoesNotFitMm:
        customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin > 0.8
          ? "လက်ရှိခေါ်မိနစ် ၈၀% ကျော် သုံးထားသဖြင့် လကုန်မတိုင်မီ မလုံနိုင်ပါ။"
          : "လက်ရှိခေါ်မိနစ် မကုန်သေးသဖြင့် ပိုကြီးသည့်အစီအစဉ်ကို အခုချက်ချင်း မပြောင်းသင့်ပါ။",
      recommendedPackage:
        customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin > 0.8
          ? pack
          : null,
      whyRecommendedMm:
        customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin > 0.8
          ? "ဖုန်းခေါ် ၁၂၀ မိနစ်က လက်ရှိသုံးနှုန်းနှင့် ပိုကိုက်ညီသည်။"
          : "လက်ရှိအစီအစဉ်ကို ဆက်သုံးပြီး ခေါ်မိနစ် ၈၀% ရောက်မှ ထပ်စစ်ပါ။",
      estimatedBenefitMm:
        "Data မလိုအပ်ဘဲ ပိုဝယ်ခြင်းကို ရှောင်ပြီး ဖုန်းခေါ်သုံးနှုန်းအတိုင်း ဆုံးဖြတ်နိုင်သည်။",
      action: {
        id:
          customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin > 0.8
            ? "switch_atom-voice-120"
            : "keep_atom-10gb",
        labelMm:
          customer.usage.voiceUsedMin / customer.usage.voiceAllowanceMin > 0.8
            ? "ဖုန်းခေါ် ၁၂၀ မိနစ် သို့ ပြောင်းမည်"
            : "လက်ရှိအစီအစဉ် ဆက်သုံးမည်",
        labelEn: "Confirm recommendation",
      },
      grounding: {
        citedFactsMm: [
          `ဖုန်းခေါ်: ${customer.usage.voiceUsedMin}/${customer.usage.voiceAllowanceMin} မိနစ်`,
          `ခေါ်ဆိုမှုအချိုး: ${customer.usageMix.callsPct}%`,
        ],
      },
      source: "rules",
    };
  }

  if (customer.id === "su-su" && (intent.label === "data_need" || intent.label === "unknown")) {
    const pack = getPackageById("atom-30gb");
    return {
      recommendationId: buildId(customer.id),
      intent: { ...intent, label: "data_need", labelMm: "data / ပက်ကေ့ချ်" },
      situationMm: `လက်ရှိ ${customer.currentPlan.nameMm} — ${customer.usage.dataUsedGb} / ${customer.usage.dataAllowanceGb} GB (${usedPct}%) သုံးပြီး။ ဒီလ top-up ${customer.usage.topUpsThisMonth} ကြိမ်။`,
      whyCurrentDoesNotFitMm: `မကြာသေးမီက ${customer.previousPlanNameMm} မှ တက်လာပြီးသား။ YouTube ${customer.usageMix.youtubePct}% + ဂိမ်း ${customer.usageMix.gamingPct}% ကြောင့် ၁၅ GB မလုံ။ Top-up ခဏခဏက ပိုစျေးကြီးနိုင်သည်။`,
      recommendedPackage: pack,
      whyRecommendedMm:
        "သုံးနှုန်းအရ လစဉ် ~၂၈ GB လိုနိုင်သည်။ ၃၀ GB က top-up ၃ ကြိမ်ထက် ခန့်မှန်း စျေးသက်သာပြီး ပြတ်တောက်မှု နည်းသည်။",
      estimatedBenefitMm:
        "ဒီလ top-up ခန့်မှန်း ၃×၂၀၀၀ ကျပ် ဝန်းကျင် ချွေတာနိုင်ပြီး လကုန်မီ ကုန်မည့် အကြိမ် လျော့နိုင်သည်။",
      action: {
        id: "switch_atom-30gb",
        labelMm: "၃၀ GB သို့ ပြောင်းမည်",
        labelEn: "Switch to 30GB",
      },
      grounding: {
        citedFactsMm: [
          `လက်ရှိ: ${customer.usage.dataUsedGb}GB / ${customer.usage.dataAllowanceGb}GB`,
          `Top-up ဒီလ: ${customer.usage.topUpsThisMonth} ကြိမ်`,
          `သုံးပုံ: YouTube ${customer.usageMix.youtubePct}% · ဂိမ်း ${customer.usageMix.gamingPct}%`,
          `ယခင်: ${customer.previousPlanNameMm}`,
        ],
      },
      source: "rules",
    };
  }

  if (customer.id === "ko-ko") {
    const pack = getPackageById("atom-voice-120");
    const leftover = (
      customer.usage.dataAllowanceGb - customer.usage.dataUsedGb
    ).toFixed(1);
    return {
      recommendationId: buildId(customer.id),
      intent,
      situationMm: `Data ${customer.usage.dataUsedGb}/${customer.usage.dataAllowanceGb} GB သာ သုံး။ ဖုန်း ${customer.usage.voiceUsedMin}/${customer.usage.voiceAllowanceMin} မိနစ်။`,
      whyCurrentDoesNotFitMm: `၃၀ GB ဝယ်ထားသော်လည်း ${leftover} GB ပိုနေသည်။ ပြဿနာက data မဟုတ် — မိသားစု ခေါ်မိနစ် ကုန်နေသည် (${customer.usageMix.callsPct}%)။`,
      recommendedPackage: pack,
      whyRecommendedMm:
        "Voice ၁၂၀ မိနစ် ပက်ကေ့ချ်က ခေါ်များသူ့ အတွက် ကိုက်သည်။ Data ပိုမဝယ်သင့်။",
      estimatedBenefitMm:
        `မသုံးသော data ~${leftover} GB အတွက် ပိုက်ဆံ ထပ်မကျဘဲ ခေါ်မိနစ် ပိုရနိုင်သည်။`,
      action: {
        id: "switch_atom-voice-120",
        labelMm: "ဖုန်းခေါ် ပက်ကေ့ချ် သို့ ပြောင်းမည်",
        labelEn: "Switch to voice pack",
      },
      grounding: {
        citedFactsMm: [
          `Data ကျန်: ${leftover} GB`,
          `မိနစ်: ${customer.usage.voiceUsedMin} / ${customer.usage.voiceAllowanceMin}`,
          `သုံးပုံ ခေါ်ဆိုမှု: ${customer.usageMix.callsPct}%`,
          `Top-up ဒီလ: ${customer.usage.topUpsThisMonth}`,
        ],
      },
      source: "rules",
    };
  }

  return {
    recommendationId: buildId(customer.id),
    intent,
    situationMm: `SIM အသစ်နီးပါး — ${customer.usage.dataUsedGb} / ${customer.usage.dataAllowanceGb} GB သာ သုံးပြီး။ Top-up မရှိ။`,
    whyCurrentDoesNotFitMm:
      "လက်ရှိ ၁၀ GB မကုန်သေး။ ပိုကြီးသော ပက်ကေ့ချ် အကြံမပေးသင့်။",
    recommendedPackage: null,
    whyRecommendedMm:
      "ဆက်သုံး ၁၀ GB၊ လိုမှ နေ့စဉ် ၁ GB။ Upsell မလုပ်။",
    estimatedBenefitMm: "မလိုအပ်သော လစဉ် ၅၀၀၀–၈၀၀၀ ကျပ် မကုန်အောင် ရှောင်သည်။",
    action: {
      id: "keep_atom-10gb",
      labelMm: "၁၀ GB ဆက်သုံးမည်",
      labelEn: "Keep 10GB",
    },
    grounding: {
      citedFactsMm: [
        `သုံးပြီး: ${customer.usage.dataUsedGb}GB`,
        `Top-up: ${customer.usage.topUpsThisMonth}`,
        `သုံးပုံ: ချတ် ${customer.usageMix.socialPct}%`,
        `မှတ်ချက်: ${customer.previousPlanNameMm}`,
      ],
    },
    source: "rules",
  };
}
