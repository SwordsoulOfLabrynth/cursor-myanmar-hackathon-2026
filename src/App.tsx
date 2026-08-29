import { useRef, useState } from "react";
import { mynextApi } from "./api/mynextApi.ts";
import {
  appendHistory,
  getSelectedAccount,
  listAccountSummaries,
  selectAccount,
  type Account,
} from "./accountStore.ts";
import { Composer } from "./components/Composer.tsx";
import { CompareDemo } from "./components/CompareDemo.tsx";
import { ProfileSwitcher } from "./components/ProfileSwitcher.tsx";
import { RecommendationPanel } from "./components/RecommendationPanel.tsx";
import { UsagePanel } from "./components/UsagePanel.tsx";
import type {
  CustomerId,
  CustomerSummary,
  RecommendResponse,
} from "../shared/api-contract.ts";

const DEMO_QUESTION =
  "ဒီလ data ခဏခဏကုန်နေလို့ ဘာ package သုံးသင့်လဲ?";

export default function App() {
  const initialAccount = getSelectedAccount();
  const [summaries, setSummaries] = useState<CustomerSummary[]>(
    listAccountSummaries,
  );
  const [customerId, setCustomerId] = useState<CustomerId>(initialAccount.id);
  const [context, setContext] = useState<Account>(initialAccount);
  const [message, setMessage] = useState(DEMO_QUESTION);
  const [recommendation, setRecommendation] =
    useState<RecommendResponse | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareResults, setCompareResults] = useState<{
    suSu: RecommendResponse | null;
    koKo: RecommendResponse | null;
  }>({ suSu: null, koKo: null });
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareLoaded, setCompareLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionComplete, setActionComplete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const recommendationRef = useRef<HTMLDivElement>(null);

  const load = (id: CustomerId) => {
    const account = selectAccount(id);
    if (!account) {
      setLoadError("အကောင့် ပြောင်း၍ မရသေးပါ။ ထပ်ကြိုးစားပါ။");
      return;
    }
    setSummaries(listAccountSummaries());
    setContext(account);
    setCustomerId(account.id);
    setRecommendation(null);
    setActionComplete(false);
    setToast(null);
    setLoadError(null);
  };

  const runComparison = async () => {
    setCompareLoading(true);
    setCompareResults({ suSu: null, koKo: null });
    try {
      const [suSu, koKo] = await Promise.all([
        mynextApi.recommend({ customerId: "su-su", message: DEMO_QUESTION }),
        mynextApi.recommend({ customerId: "ko-ko", message: DEMO_QUESTION }),
      ]);
      setCompareResults({ suSu, koKo });
      setCompareLoaded(true);
    } catch {
      setLoadError("နှိုင်းယှဉ် demo ကို မဖွင့်နိုင်သေးပါ။ ထပ်စမ်းကြည့်ပါ။");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCompareToggle = (open: boolean) => {
    setCompareOpen(open);
    if (open && !compareLoaded && !compareLoading) {
      void runComparison();
    }
  };

  const requestRecommendation = (messageOverride?: string) => {
    const requestedMessage = messageOverride ?? message;
    if (!requestedMessage.trim()) return;
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
      .recommend({
        customerId,
        message: requestedMessage.trim(),
        customerContext: context,
      })
      .then(setRecommendation)
      .catch(() =>
        setLoadError(
          "အကြံပြုချက် မရသေးပါ။ Offline rules fallback ကို ထပ်စမ်းကြည့်ပါ။",
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
        const updated = appendHistory(customerId, {
          eventMm: `Demo CTA — ${recommendation.action.labelMm}`,
          eventEn: `Demo CTA — ${recommendation.action.labelEn}`,
        });
        if (updated) {
          setContext(updated);
          setSummaries(listAccountSummaries());
        }
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
        <nav className="brandbar" aria-label="ATOM Mind">
          <div className="brandmark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>
            ATOM Mind <small>Your Personal Telecom AI</small>
          </strong>
          <span className="demo-pill">IN-APP</span>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">သင့် ATOM အကောင့်အတွက် ကိုယ်ပိုင် အကြံပေး</p>
          <h1>
            {context.displayNameMm}၊ မေးလိုက်ပါ။
            <br />
            သင့် plan အတွက်ပဲ ဖြေပေးမယ်။
          </h1>
          <p>
            လက်ရှိ သုံးစွဲမှုနဲ့ အစီအစဉ်ကို စစ်ပြီး နောက်တစ်ဆင့်ကို
            အကြောင်းပြချက်နဲ့ ပြောပေးပါတယ်။
          </p>
        </div>
        <p className="synthetic-note">
          <span aria-hidden="true">◆</span>
          Hackathon concept · one subscriber view · synthetic data only — not an
          official ATOM product.
        </p>
      </header>

      <div className="content-grid">
        <div className="context-column">
          <ProfileSwitcher
            summaries={summaries}
            selectedId={customerId}
            onSelect={load}
          />

          <UsagePanel
            context={context}
            disabled={loading}
            onAutoRecommend={() => {
              const analyzerQuestion =
                "ကျွန်တော့် usage analyzer အရ အခု ဘာလုပ်သင့်လဲ?";
              setMessage(analyzerQuestion);
              requestRecommendation(analyzerQuestion);
            }}
          />
        </div>

        <div className="decision-column">
          <Composer
            message={message}
            customerName={context.displayNameMm}
            onMessageChange={setMessage}
            disabled={loading}
            onSubmit={() => requestRecommendation()}
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

      <CompareDemo
        question={DEMO_QUESTION}
        suSu={compareResults.suSu}
        koKo={compareResults.koKo}
        loading={compareLoading}
        open={compareOpen}
        onToggle={handleCompareToggle}
        onReplay={() => void runComparison()}
      />

      {loadError ? (
        <div className="error-banner" role="alert">
          <strong>ဆက်လုပ်၍ မရသေးပါ</strong>
          <span>{loadError}</span>
        </div>
      ) : null}

      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-check" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>Demo history မှာ သိမ်းထားပါပြီ</strong>
            <p>{toast}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="ပိတ်မည်"
          >
            ×
          </button>
        </div>
      ) : null}

      <footer>
        ATOM Mind · Your Personal Telecom AI · hackathon concept · synthetic data only
      </footer>
    </main>
  );
}
