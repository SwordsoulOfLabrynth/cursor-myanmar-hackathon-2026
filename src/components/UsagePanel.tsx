import type { CustomerContext } from "../../shared/api-contract.ts";
import { analyzeUsage } from "../../shared/recommendEngine.ts";

type Props = {
  context: CustomerContext;
  onAutoRecommend: () => void;
  disabled: boolean;
};

export function UsagePanel({ context, onAutoRecommend, disabled }: Props) {
  const analysis = analyzeUsage(context);
  const dataPct = Math.min(
    100,
    Math.round(
      (context.usage.dataUsedGb / context.usage.dataAllowanceGb) * 100,
    ),
  );
  const voicePct = Math.min(
    100,
    Math.round(
      (context.usage.voiceUsedMin / context.usage.voiceAllowanceMin) * 100,
    ),
  );

  return (
    <section className="panel usage-panel" aria-labelledby="usage-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">သင့် usage အပေါ် အခြေခံပြီး</p>
          <h2 id="usage-heading">{context.displayNameMm} ရဲ့ plan ကို စစ်ထားတယ်</h2>
        </div>
        <div className="plan-badge">
          <small>လက်ရှိအစီအစဉ်</small>
          <strong>{context.currentPlan.nameMm}</strong>
        </div>
      </div>

      <div className={`insight-verdict ${analysis.risk}`}>
        <div>
          <small>PLAN FIT SCORE</small>
          <strong>{analysis.currentPlanFitScore}<span>/100</span></strong>
        </div>
        <p>{analysis.insightMm}</p>
      </div>

      <div className="analyzer-metrics">
        <div>
          <small>Data burn rate</small>
          <strong>{analysis.dataBurnGbPerDay} GB</strong>
          <span>တစ်ရက်လျှင်</span>
        </div>
        <div>
          <small>ကုန်ရန်ခန့်မှန်း</small>
          <strong>
            {analysis.estimatedDaysToEmpty === null
              ? "—"
              : `${analysis.estimatedDaysToEmpty} ရက်`}
          </strong>
          <span>လက်ရှိနှုန်းအရ</span>
        </div>
        <div>
          <small>လကုန်ခန့်မှန်း</small>
          <strong>{analysis.projectedMonthlyDataGb} GB</strong>
          <span>စုစုပေါင်း</span>
        </div>
      </div>

      <div className="topup-alert">
        <span aria-hidden="true">{context.usage.topUpsThisMonth >= 2 ? "!" : "✓"}</span>
        <div>
          <small>TOP-UP PATTERN</small>
          <strong>{analysis.topUpPatternMm}</strong>
        </div>
      </div>

      <div className="mix-analyzer">
        <div className="mix-heading">
          <small>USAGE MIX</small>
          <span>{analysis.dominantMixMm}</span>
        </div>
        <div className="mix-bar" aria-label={analysis.dominantMixMm}>
          <i className="youtube" style={{ width: `${context.usageMix.youtubePct}%` }} />
          <i className="gaming" style={{ width: `${context.usageMix.gamingPct}%` }} />
          <i className="social" style={{ width: `${context.usageMix.socialPct}%` }} />
          <i className="calls" style={{ width: `${context.usageMix.callsPct}%` }} />
        </div>
      </div>

      <button
        className="auto-recommend"
        type="button"
        onClick={onAutoRecommend}
        disabled={disabled}
      >
        <span>✦ အလိုအလျောက် အကြံရယူမည်</span>
        <span aria-hidden="true">→</span>
      </button>

      <details className="raw-usage">
        <summary>Analyzer သုံးထားသော အချက်အလက် ကြည့်မည်</summary>
      <div className="usage-cards">
        <article className="usage-card data-card">
          <div className="usage-card-top">
            <span className="usage-icon" aria-hidden="true">↗</span>
            <span>Data</span>
            <strong>{dataPct}%</strong>
          </div>
          <p><b>{context.usage.dataUsedGb}</b> / {context.usage.dataAllowanceGb} GB</p>
          <div
            className="meter"
            role="progressbar"
            aria-label="Data သုံးစွဲမှု"
            aria-valuenow={dataPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${dataPct}%` }} />
          </div>
        </article>

        <article className="usage-card">
          <div className="usage-card-top">
            <span className="usage-icon voice" aria-hidden="true">⌕</span>
            <span>ဖုန်းခေါ်</span>
            <strong>{voicePct}%</strong>
          </div>
          <p><b>{context.usage.voiceUsedMin}</b> / {context.usage.voiceAllowanceMin} မိနစ်</p>
          <div
            className="meter voice-meter"
            role="progressbar"
            aria-label="ဖုန်းခေါ်မိနစ် သုံးစွဲမှု"
            aria-valuenow={voicePct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${voicePct}%` }} />
          </div>
        </article>
      </div>

      <div className="context-strip">
        <div>
          <small>ဒီလ top-up</small>
          <strong>{context.usage.topUpsThisMonth} ကြိမ်</strong>
        </div>
        <div>
          <small>အသုံးများဆုံး</small>
          <strong>{context.preferencesMm[0]}</strong>
        </div>
        <div>
          <small>ငွေရှင်းကာလ</small>
          <strong>{context.usage.cycleLabelMm}</strong>
        </div>
      </div>

      <details className="history">
        <summary>မကြာသေးမီ မှတ်တမ်း {context.history.length} ခု ကြည့်မည်</summary>
        <ol>
          {context.history.map((historyItem) => (
            <li key={historyItem.id}>
              <time>{historyItem.dateLabel}</time>
              <span>{historyItem.eventMm}</span>
            </li>
          ))}
        </ol>
      </details>
      </details>
    </section>
  );
}
