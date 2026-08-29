import type {
  CustomerContext,
  CustomerId,
  CustomerSummary,
  PackageOffer,
} from "./api-contract.ts";

export const PACKAGES: PackageOffer[] = [
  {
    id: "atom-10gb",
    name: "ATOM 10GB",
    nameMm: "ATOM ၁၀ GB",
    dataGb: 10,
    voiceMinutes: 50,
    validityDays: 30,
    monthlyFeeMmk: 7999,
    tags: ["starter", "light"],
  },
  {
    id: "atom-15gb",
    name: "ATOM 15GB",
    nameMm: "ATOM ၁၅ GB",
    dataGb: 15,
    voiceMinutes: 80,
    validityDays: 30,
    monthlyFeeMmk: 9999,
    tags: ["mid"],
  },
  {
    id: "atom-30gb",
    name: "ATOM 30GB",
    nameMm: "ATOM ၃၀ GB",
    dataGb: 30,
    voiceMinutes: 100,
    validityDays: 30,
    monthlyFeeMmk: 15999,
    tags: ["heavy-data", "streaming"],
  },
  {
    id: "atom-night",
    name: "ATOM Night Extra",
    nameMm: "ညပိုင်း data အပို",
    dataGb: 20,
    voiceMinutes: 50,
    validityDays: 30,
    monthlyFeeMmk: 12999,
    tags: ["night", "youtube"],
  },
  {
    id: "atom-voice-120",
    name: "ATOM Voice 120",
    nameMm: "ဖုန်းခေါ် ၁၂၀ မိနစ် ပက်ကေ့ချ်",
    dataGb: 8,
    voiceMinutes: 120,
    validityDays: 30,
    monthlyFeeMmk: 8999,
    tags: ["voice", "family-calls"],
  },
  {
    id: "atom-daily",
    name: "ATOM Daily 1GB",
    nameMm: "နေ့စဉ် ၁ GB",
    dataGb: 1,
    voiceMinutes: 10,
    validityDays: 1,
    monthlyFeeMmk: 999,
    tags: ["daily", "cheap"],
  },
];

const CUSTOMERS: Record<CustomerId, CustomerContext> = {
  "su-su": {
    id: "su-su",
    displayName: "Su Su",
    displayNameMm: "စုစု",
    phoneMasked: "09 *** *** 214",
    currentPlan: PACKAGES[1]!,
    previousPlanNameMm: "ATOM ၁၀ GB",
    usage: {
      dataUsedGb: 13.7,
      dataAllowanceGb: 15,
      voiceUsedMin: 22,
      voiceAllowanceMin: 80,
      topUpsThisMonth: 3,
      cycleLabelMm: "ဒီလ ရက် ၂၉ ရက်မြောက်",
    },
    usageMix: {
      youtubePct: 48,
      gamingPct: 27,
      socialPct: 18,
      callsPct: 7,
    },
    history: [
      {
        id: "s1",
        dateLabel: "2026-08-22",
        eventMm: "Data top-up ၂ GB × ၁ ကြိမ်",
        eventEn: "Data top-up 2GB",
      },
      {
        id: "s2",
        dateLabel: "2026-08-14",
        eventMm: "Data top-up ၂ GB × ၁ ကြိမ်",
        eventEn: "Data top-up 2GB",
      },
      {
        id: "s3",
        dateLabel: "2026-08-06",
        eventMm: "Data top-up ၁ GB",
        eventEn: "Data top-up 1GB",
      },
      {
        id: "s4",
        dateLabel: "2026-07-01",
        eventMm: "၁၀ GB မှ ၁၅ GB သို့ ပြောင်း",
        eventEn: "Upgraded 10GB → 15GB",
      },
    ],
    preferencesMm: ["YouTube", "ဂိမ်း", "ညပိုင်း သုံးများ"],
  },
  "ko-ko": {
    id: "ko-ko",
    displayName: "Ko Ko",
    displayNameMm: "ကိုကို",
    phoneMasked: "09 *** *** 880",
    currentPlan: PACKAGES[2]!,
    previousPlanNameMm: "ATOM ၁၅ GB",
    usage: {
      dataUsedGb: 6.1,
      dataAllowanceGb: 30,
      voiceUsedMin: 98,
      voiceAllowanceMin: 100,
      topUpsThisMonth: 0,
      cycleLabelMm: "ဒီလ ရက် ၂၉ ရက်မြောက်",
    },
    usageMix: {
      youtubePct: 8,
      gamingPct: 5,
      socialPct: 12,
      callsPct: 75,
    },
    history: [
      {
        id: "k1",
        dateLabel: "2026-08-18",
        eventMm: "မိနစ် ကုန်သွား၍ အပို မဝယ်ရသေး",
        eventEn: "Minutes exhausted, no add-on yet",
      },
      {
        id: "k2",
        dateLabel: "2026-06-01",
        eventMm: "မိသားစု ခေါ်များ၍ ၃၀ GB သို့ ပြောင်း (data ပိုဝယ်)",
        eventEn: "Moved to 30GB for family — data-heavy plan",
      },
    ],
    preferencesMm: ["မိသားစု ဖုန်းခေါ်", "data နည်းနည်းသာ သုံး"],
  },
  "ma-ma": {
    id: "ma-ma",
    displayName: "Ma Ma",
    displayNameMm: "မမ",
    phoneMasked: "09 *** *** 041",
    currentPlan: PACKAGES[0]!,
    previousPlanNameMm: "ပထမဆုံး ပက်ကေ့ချ်",
    usage: {
      dataUsedGb: 2.0,
      dataAllowanceGb: 10,
      voiceUsedMin: 12,
      voiceAllowanceMin: 50,
      topUpsThisMonth: 0,
      cycleLabelMm: "ဒီလ ရက် ၁၁ ရက်မြောက် (SIM အသစ်)",
    },
    usageMix: {
      youtubePct: 10,
      gamingPct: 0,
      socialPct: 70,
      callsPct: 20,
    },
    history: [
      {
        id: "m1",
        dateLabel: "2026-08-18",
        eventMm: "SIM အသစ် ဖွင့် — ATOM ၁၀ GB",
        eventEn: "New SIM, 10GB starter",
      },
    ],
    preferencesMm: ["ချတ်", "သက်သာသော ပက်ကေ့ချ်"],
  },
};

export function listCustomers(): CustomerSummary[] {
  return (Object.keys(CUSTOMERS) as CustomerId[]).map((id) => {
    const c = CUSTOMERS[id];
    return {
      id: c.id,
      displayName: c.displayName,
      displayNameMm: c.displayNameMm,
      phoneMasked: c.phoneMasked,
      currentPlanNameMm: c.currentPlan.nameMm,
      oneLinerMm: c.preferencesMm.join(" · "),
    };
  });
}

export function getCustomerContext(customerId: CustomerId): CustomerContext {
  const customer = CUSTOMERS[customerId];
  if (!customer) {
    throw new Error(`Unknown demo customer: ${customerId}`);
  }
  return customer;
}

export function listPackages(): PackageOffer[] {
  return PACKAGES;
}

export function getPackageById(packageId: string): PackageOffer | null {
  return PACKAGES.find((p) => p.id === packageId) ?? null;
}
