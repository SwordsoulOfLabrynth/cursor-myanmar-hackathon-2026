import type { RecommendResponse } from "../../shared/api-contract.ts";

type Props = {
  loading: boolean;
  recommendation: RecommendResponse | null;
  onAction: () => void;
};

export function RecommendationPanel({
  loading,
  recommendation,
  onAction,
}: Props) {
  if (loading) {
    return (
      <section className="panel card-next">
        <p className="muted">intent + usage တွက်နေသည်…</p>
      </section>
    );
  }

  if (!recommendation) {
    return (
      <section className="panel card-next empty">
        <h2>နောက်တစ်ဆင့်</h2>
        <p>မေးခွန်း ပို့မှ ဒီကတ် ပေါ်မည်။</p>
      </section>
    );
  }

  const pack = recommendation.recommendedPackage;

  return (
    <section className="panel card-next">
      <p className="kicker">
        {recommendation.intent.labelMm} · {recommendation.source}
      </p>
      <h2>ဘာကြောင့် ဒီအကြံလဲ</h2>
      <p>{recommendation.situationMm}</p>
      <h3>လက်ရှိ ပက်ကေ့ချ်</h3>
      <p>{recommendation.whyCurrentDoesNotFitMm}</p>
      {pack ? (
        <>
          <h3>အကြံပြု ပက်ကေ့ချ်</h3>
          <p className="pack-name">
            {pack.nameMm} · {pack.monthlyFeeMmk.toLocaleString()} Ks
          </p>
        </>
      ) : (
        <h3>ပက်ကေ့ချ် မပြောင်း</h3>
      )}
      <p>{recommendation.whyRecommendedMm}</p>
      <p className="benefit">{recommendation.estimatedBenefitMm}</p>
      <ul className="grounding">
        {recommendation.grounding.citedFactsMm.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      <button className="primary" type="button" onClick={onAction}>
        {recommendation.action.labelMm}
      </button>
    </section>
  );
}
