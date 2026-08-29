import { useRef, useState } from "react";
import { mynextApi } from "./api/mynextApi.ts";
import {
  appendHistory,
  createAccount,
  endSession,
  getSessionAccount,
  loadAccounts,
  startSession,
  type Account,
} from "./accountStore.ts";
import { Composer } from "./components/Composer.tsx";
import { LoginScreen } from "./components/LoginScreen.tsx";
import { RecommendationPanel } from "./components/RecommendationPanel.tsx";
import { UsagePanel } from "./components/UsagePanel.tsx";
import type { RecommendResponse } from "../shared/api-contract.ts";

const DEMO_QUESTION =
  "ဒီလ data ခဏခဏကုန်နေလို့ ဘာ package သုံးသင့်လဲ?";

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(loadAccounts);
  const [context, setContext] = useState<Account | null>(getSessionAccount);
  const [message, setMessage] = useState(DEMO_QUESTION);
  const [recommendation, setRecommendation] =
    useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionComplete, setActionComplete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const recommendationRef = useRef<HTMLDivElement>(null);

  const login = (accountId: string) => {
    const account = startSession(accountId);
    if (!account) return;
    setContext(account);
    setRecommendation(null);
    setActionComplete(false);
    setToast(null);
  };

  const createAndLogin = (name: string, phone: string) => {
    const account = createAccount(name, phone);
    setAccounts(loadAccounts());
    login(account.id);
  };

  const logout = () => {
    endSession();
    setContext(null);
    setRecommendation(null);
    setActionComplete(false);
    setToast(null);
    setLoadError(null);
  };

  const requestRecommendation = (messageOverride?: string) => {
    const requestedMessage = messageOverride ?? message;
    if (!context || !requestedMessage.trim()) return;
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
        customerId: context.id,
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
    if (!context || !recommendation || actionLoading || actionComplete) return;
    setActionLoading(true);
    setLoadError(null);
    void mynextApi
      .confirmAction({
        customerId: context.id,
        recommendationId: recommendation.recommendationId,
        actionId: recommendation.action.id,
      })
      .then((result) => {
        const updated = appendHistory(context.id, {
          eventMm: `Demo CTA — ${recommendation.action.labelMm}`,
          eventEn: `Demo CTA — ${recommendation.action.labelEn}`,
        });
        if (updated) {
          setContext(updated);
          setAccounts(loadAccounts());
        }
        setToast(result.messageMm);
        setActionComplete(result.ok);
      })
      .catch(() =>
        setLoadError("Demo လုပ်ဆောင်ချက် မပြီးသေးပါ။ ထပ်ကြိုးစားပါ။"),
      )
      .finally(() => setActionLoading(false));
  };

  if (!context) {
    return (
      <LoginScreen
        accounts={accounts}
        onLogin={login}
        onCreate={createAndLogin}
      />
    );
  }

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
          <button className="logout-button" type="button" onClick={logout}>
            Logout
          </button>
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
          Hackathon concept · one subscriber view · synthetic data only ·
          local demo session — not an official ATOM product.
        </p>
      </header>

      <section className="panel account-summary" aria-label="လက်ရှိအကောင့်">
        <span className="avatar" aria-hidden="true">
          {context.displayName.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <small>လက်ရှိဝင်ထားသော demo အကောင့်</small>
          <strong>{context.displayNameMm}</strong>
          <p>{context.phoneMasked} · {context.currentPlan.nameMm}</p>
        </div>
      </section>

      <div className="content-grid">
        <div className="context-column">
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
            <strong>Demo history မှာ သိမ်းထားပါပြီ</strong>
            <p>{toast}</p>
          </div>
          <button type="button" onClick={() => setToast(null)} aria-label="ပိတ်မည်">
            ×
          </button>
        </div>
      ) : null}

      <footer>
        ATOM Mind · hackathon concept · synthetic data only · login is not
        production-secure
      </footer>
    </main>
  );
}
