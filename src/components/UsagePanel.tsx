import type { CustomerContext } from "../../shared/api-contract.ts";

type Props = { context: CustomerContext };

export function UsagePanel({ context }: Props) {
  const pct = Math.min(
    100,
    Math.round(
      (context.usage.dataUsedGb / context.usage.dataAllowanceGb) * 100,
    ),
  );

  return (
    <section className="panel">
      <h2>သုံးစွဲမှု + မှတ်တမ်း</h2>
      <div className="usage-grid">
        <div className="thermo">
          <div className="thermo-track">
            <div className="thermo-fill" style={{ height: `${pct}%` }} />
          </div>
          <p>
            {context.usage.dataUsedGb} / {context.usage.dataAllowanceGb} GB
          </p>
          <p className="muted">{context.usage.cycleLabelMm}</p>
        </div>
        <ul className="facts">
          <li>ဖုန်း {context.usage.voiceUsedMin} / {context.usage.voiceAllowanceMin} မိနစ်</li>
          <li>ဒီလ top-up {context.usage.topUpsThisMonth} ကြိမ်</li>
          <li>ယခင်: {context.previousPlanNameMm}</li>
          <li>
            YouTube {context.usageMix.youtubePct}% · ဂိမ်း {context.usageMix.gamingPct}% · ခေါ်
            {context.usageMix.callsPct}%
          </li>
        </ul>
      </div>
      <ol className="history">
        {context.history.map((h) => (
          <li key={h.id}>
            <time>{h.dateLabel}</time>
            {h.eventMm}
          </li>
        ))}
      </ol>
    </section>
  );
}
