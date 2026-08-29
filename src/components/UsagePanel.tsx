import type { CustomerContext } from "../../shared/api-contract.ts";

type Props = { context: CustomerContext };

export function UsagePanel({ context }: Props) {
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
          <p className="step-label">လက်ရှိအခြေအနေ</p>
          <h2 id="usage-heading">{context.displayNameMm} ရဲ့ သုံးစွဲမှု</h2>
        </div>
        <div className="plan-badge">
          <small>လက်ရှိအစီအစဉ်</small>
          <strong>{context.currentPlan.nameMm}</strong>
        </div>
      </div>

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
    </section>
  );
}
