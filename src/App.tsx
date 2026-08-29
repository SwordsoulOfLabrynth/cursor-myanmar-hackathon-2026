import { useEffect, useMemo, useState } from "react";
import { mynextApi } from "./api/mynextApi.ts";
import { Composer } from "./components/Composer.tsx";
import { ProfileSwitcher } from "./components/ProfileSwitcher.tsx";
import { RecommendationPanel } from "./components/RecommendationPanel.tsx";
import { UsagePanel } from "./components/UsagePanel.tsx";
import type {
  CustomerContext,
  CustomerId,
  CustomerSummary,
  RecommendResponse,
} from "../shared/api-contract.ts";

const DEMO_QUESTION =
  "ဒီလ data ခဏခဏကုန်နေလို့ ဘာ package သုံးသင့်လဲ?";

export default function App() {
  const [summaries, setSummaries] = useState<CustomerSummary[] | null>(null);
  const [customerId, setCustomerId] = useState<CustomerId>("su-su");
  const [context, setContext] = useState<CustomerContext | null>(null);
  const [message, setMessage] = useState(DEMO_QUESTION);
  const [recommendation, setRecommendation] =
    useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async (id: CustomerId) => {
    setLoadError(null);
    const [list, ctx] = await Promise.all([
      mynextApi.listCustomers(),
      mynextApi.getCustomerContext(id),
    ]);
    setSummaries(list);
    setContext(ctx);
    setCustomerId(id);
    setRecommendation(null);
    setToast(null);
  };

  useEffect(() => {
    void load("su-su").catch(() =>
      setLoadError("ဖောက်သည် အချက်အလက် မဖွင့်နိုင်ပါ"),
    );
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <p className="kicker">MyNext · mock API</p>
        <h1>မြန်မာစကားပြော concierge</h1>
        <p className="lede">
          Chatbot FAQ မဟုတ်။ ရွေးထားသော ဖောက်သည်ရဲ့ plan, usage, မှတ်တမ်းကို
          ပေါင်းပြီး နောက်တစ်ဆင့် ပေးသည်။
        </p>
        <p className="disclaimer">
          Synthetic demo data only — not real ATOM customer records.
        </p>
      </header>

      {loadError ? <p className="error">{loadError}</p> : null}

      <ProfileSwitcher
        summaries={summaries}
        selectedId={customerId}
        onSelect={(id) => {
          void load(id).catch(() => setLoadError("ပြောင်းလဲမှု မအောင်မြင်ပါ"));
        }}
      />

      {context ? (
        <UsagePanel context={context} />
      ) : (
        <p className="muted">ဖွင့်နေသည်…</p>
      )}

      <Composer
        message={message}
        onMessageChange={setMessage}
        disabled={loading || !context}
        onSubmit={() => {
          if (!context) return;
          setLoading(true);
          setToast(null);
          void mynextApi
            .recommend({ customerId, message })
            .then(setRecommendation)
            .catch(() => setLoadError("အကြံပေးချက် မရပါ"))
            .finally(() => setLoading(false));
        }}
      />

      <RecommendationPanel
        loading={loading}
        recommendation={recommendation}
        onAction={() => {
          if (!recommendation) return;
          void mynextApi
            .confirmAction({
              customerId,
              recommendationId: recommendation.recommendationId,
              actionId: recommendation.action.id,
            })
            .then((result) => setToast(result.messageMm));
        }}
      />

      {toast ? (
        <p className="toast" role="status" aria-live="polite">
          {toast}
        </p>
      ) : null}

      <FooterNote customerId={customerId} />
    </div>
  );
}

function FooterNote({ customerId }: { customerId: CustomerId }) {
  const hint = useMemo(() => {
    if (customerId === "su-su") return "စုစု + data မေးခွန်း → ၃၀ GB";
    if (customerId === "ko-ko") return "ကိုကို + data မေးခွန်း → ဖုန်းမိနစ် ပက်ကေ့ချ်";
    return "မမ + data မေးခွန်း → ၁၀ GB ဆက် / upsell မလုပ်";
  }, [customerId]);
  return <p className="hint">{hint}</p>;
}
