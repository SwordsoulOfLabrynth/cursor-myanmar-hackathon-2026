import { useEffect, useRef, useState } from "react";
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
  const [actionLoading, setActionLoading] = useState(false);
  const [actionComplete, setActionComplete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const recommendationRef = useRef<HTMLDivElement>(null);

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
    setActionComplete(false);
    setToast(null);
  };

  useEffect(() => {
    void load("su-su").catch(() =>
      setLoadError("ဖောက်သည် အချက်အလက် မဖွင့်နိုင်ပါ"),
    );
  }, []);

  const requestRecommendation = () => {
    if (!context || !message.trim()) return;
    setLoading(true);
    setLoadError(null);
    setToast(null);
    setActionComplete(false);
    setRecommendation(null);
    window.setTimeout(() => {
      recommendationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
    void mynextApi
      .recommend({ customerId, message: message.trim() })
      .then(setRecommendation)
      .catch(() =>
        setLoadError(
          "အကြံပြုချက် မရသေးပါ။ အင်တာနက်လိုင်း စစ်ပြီး ထပ်ကြိုးစားပါ။",
        ),
      )
      .finally(() => setLoading(false));
  };

  const confirmRecommendation = () => {
    if (!recommendation || actionLoading || actionComplete) return;
    setActionLoading(true);
    setLoadError(null);
    void mynextApi
      .confirmAction({
        customerId,
        recommendationId: recommendation.recommendationId,
        actionId: recommendation.action.id,
      })
      .then((result) => {
        setToast(result.messageMm);
        setActionComplete(result.ok);
      })
      .catch(() =>
        setLoadError("Demo လုပ်ဆောင်ချက် မပြီးသေးပါ။ ထပ်ကြိုးစားပါ။"),
      )
      .finally(() => setActionLoading(false));
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <nav className="brandbar" aria-label="NeeNee AI">
          <div className="brandmark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>နီးနီး <small>NeeNee AI</small></strong>
          <span className="demo-pill">DEMO</span>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">ATOM MyNext challenge concept</p>
          <h1>မေးလိုက်ပါ။<br />သင့်အတွက်ပဲ ဖြေပေးမယ်။</h1>
          <p>
            လက်ရှိအစီအစဉ်၊ သုံးစွဲမှုနဲ့ မှတ်တမ်းကို ပေါင်းစပ်ပြီး
            နောက်တစ်ဆင့်ကို အကြောင်းပြချက်နဲ့ ပြောပေးပါတယ်။
          </p>
        </div>
        <p className="synthetic-note">
          <span aria-hidden="true">◆</span>
          စမ်းသပ်ဖန်တီးထားသော အချက်အလက်များသာ — ATOM ၏ တကယ့်ဖောက်သည်
          အချက်အလက် မဟုတ်ပါ။
        </p>
      </header>

      <div className="content-grid">
        <div className="context-column">
          <ProfileSwitcher
            summaries={summaries}
            selectedId={customerId}
            onSelect={(id) => {
              void load(id).catch(() =>
                setLoadError("ဖောက်သည် ပြောင်း၍ မရသေးပါ။ ထပ်ကြိုးစားပါ။"),
              );
            }}
          />

          {context ? (
            <UsagePanel context={context} />
          ) : (
            <section className="panel panel-skeleton" aria-busy="true">
              ဖောက်သည်အချက်အလက် ဖွင့်နေသည်…
            </section>
          )}
        </div>

        <div className="decision-column">
          <Composer
            message={message}
            customerName={context?.displayNameMm ?? ""}
            onMessageChange={setMessage}
            disabled={loading || !context}
            onSubmit={requestRecommendation}
          />

          <div ref={recommendationRef}>
            <RecommendationPanel
              loading={loading}
              recommendation={recommendation}
              actionLoading={actionLoading}
              actionComplete={actionComplete}
              onAction={confirmRecommendation}
            />
          </div>
        </div>
      </div>

      {loadError ? (
        <div className="error-banner" role="alert">
          <strong>ဆက်လုပ်၍ မရသေးပါ</strong>
          <span>{loadError}</span>
        </div>
      ) : null}

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-check" aria-hidden="true">✓</span>
          <div>
            <strong>Demo လုပ်ဆောင်ချက် ပြီးပါပြီ</strong>
            <p>{toast}</p>
          </div>
          <button type="button" onClick={() => setToast(null)} aria-label="ပိတ်မည်">
            ×
          </button>
        </div>
      ) : null}

      <footer>
        နီးနီး · NeeNee AI · ATOM MyNext challenge concept · Synthetic data only
      </footer>
    </main>
  );
}
