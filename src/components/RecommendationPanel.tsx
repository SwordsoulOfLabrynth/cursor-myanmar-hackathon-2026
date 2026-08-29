import type { RecommendResponse } from "../../shared/api-contract.ts";

type Props = {
  loading: boolean;
  recommendation: RecommendResponse | null;
  actionLoading: boolean;
  actionComplete: boolean;
  onAction: () => void;
};

export function RecommendationPanel({
  loading,
  recommendation,
  actionLoading,
  actionComplete,
  onAction,
}: Props) {
  if (loading) {
    return (
      <section className="recommendation-card analyzing" aria-live="polite" aria-busy="true">
        <div className="analysis-orbit" aria-hidden="true">
          <span />
        </div>
        <div>
          <p className="step-label">ATOM Mind စဉ်းစားနေသည်</p>
          <h2>သင့်အတွက် အကောင်းဆုံးနောက်တစ်ဆင့် ရှာနေပါတယ်…</h2>
          <ol className="analysis-steps">
            <li className="done">မေးခွန်း နားလည်ခြင်း</li>
            <li className="active">usage analyzer စစ်ခြင်း</li>
            <li>နောက်တစ်ဆင့် ရွေးခြင်း</li>
          </ol>
        </div>
      </section>
    );
  }

  if (!recommendation) {
    return (
      <section className="recommendation-card empty">
        <span className="empty-signal" aria-hidden="true">⌁</span>
        <div>
          <p className="step-label">အဆင့် ၃</p>
          <h2>သင့်အတွက်ပဲ ရွေးထားတဲ့ အကြံ</h2>
          <p>အပေါ်မှာ မေးခွန်းတစ်ခု ပို့လိုက်တာနဲ့ အကြောင်းပြချက်ပါ အကြံပြုချက် ဒီနေရာမှာ ပေါ်လာပါမယ်။</p>
        </div>
      </section>
    );
  }

  const pack = recommendation.recommendedPackage;

  return (
    <section className="recommendation-card result" aria-live="polite">
      <div className="result-topline">
        <span className="intent-pill">{recommendation.intent.labelMm}</span>
        <span className="source-pill">
          <i />
          {recommendation.source === "llm" ? "LLM + catalog guardrail" : "Explainable rules fallback"}
        </span>
      </div>

      <div className="decision">
        <p className="step-label">ATOM Mind ရဲ့ အကြံပြုချက်</p>
        {pack ? (
          <>
            <h2>{pack.nameMm}</h2>
            <div className="package-facts">
              <span><b>{pack.dataGb} GB</b> data</span>
              <span><b>{pack.voiceMinutes}</b> မိနစ်</span>
              <span><b>{pack.validityDays}</b> ရက်</span>
            </div>
            <p className="price">
              {pack.monthlyFeeMmk.toLocaleString()} <small>ကျပ်</small>
            </p>
          </>
        ) : (
          <h2>ပက်ကေ့ချ် မပြောင်းသေးပါ</h2>
        )}
        <p className="decision-copy">{recommendation.whyRecommendedMm}</p>
      </div>

      <div className="why-block">
        <div className="why-title">
          <span aria-hidden="true">✦</span>
          <div>
            <p className="step-label">ဘာကြောင့် ဒီလို အကြံပြုတာလဲ?</p>
            <h3>သင့်အချက်အလက်နဲ့ ချိတ်ဆက်ထားပါတယ်</h3>
          </div>
        </div>
        <p className="why-trail">
          {recommendation.intent.labelMm}
          <span aria-hidden="true"> → </span>
          Analyzer fit {recommendation.analysis.currentPlanFitScore}/100
          <span aria-hidden="true"> → </span>
          {pack?.nameMm ?? "မပြောင်းသေး"}
        </p>
        <p>{recommendation.situationMm}</p>
        <p>{recommendation.whyCurrentDoesNotFitMm}</p>
        <ul className="grounding">
          {recommendation.grounding.citedFactsMm.map((fact) => (
            <li key={fact}><span aria-hidden="true">✓</span>{fact}</li>
          ))}
        </ul>
      </div>

      <div className="benefit">
        <span aria-hidden="true">↘</span>
        <div>
          <small>ခန့်မှန်း အကျိုးကျေးဇူး</small>
          <p>{recommendation.estimatedBenefitMm}</p>
        </div>
      </div>

      <button
        className={actionComplete ? "primary action-complete" : "primary"}
        type="button"
        onClick={onAction}
        disabled={actionLoading || actionComplete}
      >
        <span>
          {actionComplete
            ? "Demo ရွေးချယ်မှု ပြီးပါပြီ"
            : actionLoading
              ? "လုပ်ဆောင်နေသည်…"
              : recommendation.action.labelMm}
        </span>
        <span aria-hidden="true">{actionComplete ? "✓" : "→"}</span>
      </button>
      <p className="demo-action-note">
        ATOM app အစစ်တွင် ဤခလုတ်က အတည်ပြုစာမျက်နှာသို့ ပို့မည်။ ယခု demo တွင် ငွေမဖြတ်၊ အစီအစဉ်မပြောင်းပါ။
      </p>
    </section>
  );
}
