import type {
  ConfirmActionRequest,
  ConfirmActionResponse,
  CustomerId,
  MynextApi,
  RecommendRequest,
} from "../../shared/api-contract.ts";
import {
  getCustomerContext,
  listCustomers,
  listPackages,
} from "../../shared/demoCatalog.ts";
import { recommend } from "../../shared/recommendEngine.ts";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const AI_ENDPOINT =
  import.meta.env.VITE_AI_ENDPOINT ?? "/.netlify/functions/recommend";

async function tryAiRecommendation(
  request: RecommendRequest,
): Promise<ReturnType<typeof recommend> | null> {
  if (!import.meta.env.PROD && !import.meta.env.VITE_AI_ENDPOINT) return null;
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    return (await response.json()) as ReturnType<typeof recommend>;
  } catch {
    return null;
  }
}

async function confirmAction(
  request: ConfirmActionRequest,
): Promise<ConfirmActionResponse> {
  await delay(280);
  const actionMessages: Record<string, string> = {
    "switch_atom-30gb":
      "၃၀ GB အစီအစဉ်ကို demo အဖြစ် ရွေးထားပါပြီ။ တကယ့်ငွေဖြတ်တောက်မှု မရှိပါ။",
    "switch_atom-voice-120":
      "ဖုန်းခေါ် ၁၂၀ မိနစ် အစီအစဉ်ကို demo အဖြစ် ရွေးထားပါပြီ။ တကယ့်ငွေဖြတ်တောက်မှု မရှိပါ။",
    "keep_atom-10gb":
      "လက်ရှိ ၁၀ GB ကို ဆက်ထားပါပြီ။ မလိုအပ်သေးသဖြင့် အပိုဝယ်ယူမှု မလုပ်ပါ။",
    open_sim_help:
      "SIM ပိတ်ရန် လိုအပ်သည့် အဆင့်များကို ဖွင့်ထားပါပြီ။ မှတ်ပုံတင်မူရင်းနှင့် အနီးဆုံးဆိုင်သို့ သွားပါ။",
    open_network_help:
      "လိုင်းစစ်ဆေးမှု demo ကို စတင်ပါပြီ။ ဖုန်းကို airplane mode ၁၀ စက္ကန့် ဖွင့်/ပိတ်ပြီး ထပ်စမ်းပါ။",
    open_billing_help:
      "ငွေစာရင်းရှင်းတမ်း စစ်ဆေးရန် demo တောင်းဆိုချက် မှတ်တမ်းတင်ထားပါပြီ။",
  };
  return {
    ok: true,
    messageMm:
      actionMessages[request.actionId] ??
      "Demo လုပ်ဆောင်ချက်ကို မှတ်တမ်းတင်ထားပါပြီ။ တကယ့်အကောင့် ပြောင်းလဲမှု မရှိပါ။",
  };
}

/** Mock implementation. Same types as future Convex functions. */
export const mynextApi: MynextApi = {
  async listCustomers() {
    await delay(80);
    return listCustomers();
  },
  async getCustomerContext(customerId: CustomerId) {
    await delay(80);
    return getCustomerContext(customerId);
  },
  async listPackages() {
    await delay(40);
    return listPackages();
  },
  async recommend(request: RecommendRequest) {
    const aiResult = await tryAiRecommendation(request);
    if (aiResult) return aiResult;
    await delay(520);
    return { ...recommend(request), source: "rules" };
  },
  confirmAction,
};

export const apiMode = "hybrid" as const;
