import type { RecommendResponse } from "../../shared/api-contract.ts";

type Props = {
  question: string;
  suSu: RecommendResponse | null;
  koKo: RecommendResponse | null;
  loading: boolean;
  open: boolean;
  onToggle: (open: boolean) => void;
  onReplay: () => void;
};

function resultLabel(result: RecommendResponse): string {
  return result.recommendedPackage?.nameMm ?? "ပက်ကေ့ချ် မပြောင်းပါ";
}

export function CompareDemo({
  question,
  suSu,
  koKo,
  loading,
  open,
  onToggle,
  onReplay,
}: Props) {
  const results = [
    { id: "su-su", name: "စုစု", result: suSu, tone: "data" },
    { id: "ko-ko", name: "ကိုကို", result: koKo, tone: "voice" },
  ] as const;

  return (
    <details
      className="judge-proof"
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
    >
      <summary>
        <span>Demo for judges · စစ်ဆေးရန်</span>
        <small>မေးခွန်းတူ · အဖြေ မတူ</small>
      </summary>

      <div className="judge-proof-body">
        <p className="compare-question">“{question}”</p>
        <button
          type="button"
          className="replay-button"
          onClick={onReplay}
          disabled={loading}
        >
          {loading ? "နှိုင်းယှဉ်နေသည်…" : "↻ ထပ်ပြမည်"}
        </button>

        <div className="compare-grid" aria-live="polite" aria-busy={loading}>
          {results.map(({ id, name, result, tone }) => (
            <article className={`compare-card ${tone}`} key={id}>
              <div className="compare-person">
                <span className="compare-avatar">{name.slice(0, 1)}</span>
                <div>
                  <strong>{name}</strong>
                  <small>
                    {result
                      ? resultLabel(result)
                      : "အချက်အလက် စစ်နေသည်"}
                  </small>
                </div>
              </div>
              {result ? (
                <p className="compare-why">{result.whyRecommendedMm}</p>
              ) : (
                <div className="compare-loading">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </article>
          ))}
        </div>

        <p className="contrast-callout">
          <strong>စုစု → Data ပိုလို</strong>
          <span aria-hidden="true">≠</span>
          <strong>ကိုကို → မိနစ်ပိုလို</strong>
        </p>
      </div>
    </details>
  );
}
