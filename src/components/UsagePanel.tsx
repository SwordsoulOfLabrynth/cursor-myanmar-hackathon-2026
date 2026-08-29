import type { CustomerContext } from "../../shared/api-contract.ts";
import { analyzeUsage } from "../../shared/recommendEngine.ts";
import "../concierge.css";

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
  const normalDailyData = context.usage.dataAllowanceGb / 30;
  const burnVsNormalPct = Math.round(
    ((analysis.dataBurnGbPerDay - normalDailyData) /
      Math.max(normalDailyData, 0.01)) *
      100,
  );
  const prediction =
    analysis.estimatedDaysToEmpty === null
      ? "လက်ရှိနှုန်းအရ data ကုန်မည့်ရက်ကို မခန့်မှန်းနိုင်သေးပါ"
      : analysis.estimatedDaysToEmpty <= 5
        ? `သင့် data က ${analysis.estimatedDaysToEmpty} ရက်ခန့်အတွင်း ကုန်နိုင်ပါတယ်`
        : `သင့် data က ${analysis.estimatedDaysToEmpty} ရက်ခန့် ဆက်သုံးနိုင်ပါတယ်`;

  return (
    <>
    <div className="concierge-greeting">
      <p>သင့် usage ကို နားလည်ထားတယ်</p>
      <h1>မင်္ဂလာပါ {context.displayNameMm} 👋</h1>
      <span>
        {analysis.estimatedDaysToEmpty !== null &&
        analysis.estimatedDaysToEmpty <= 5
          ? `Data သုံးနှုန်းမြန်နေပါတယ် — ${analysis.estimatedDaysToEmpty ?? "မကြာမီ"} ရက်ခန့်ပဲ ကျန်နိုင်ပါတယ်။`
          : voicePct >= 80
            ? "ဖုန်းခေါ်မိနစ် သုံးနှုန်းမြင့်နေပါတယ် — plan ကို အတူစစ်ကြည့်ရအောင်။"
            : "လက်ရှိ plan က သင့် usage နဲ့ ကိုက်နေပါတယ် — အပိုမသုံးဘဲ ဆက်ထိန်းထားနိုင်တယ်။"}
      </span>
    </div>
    <section className="panel usage-panel" aria-labelledby="usage-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">UNDERSTAND → PREDICT</p>
          <h2 id="usage-heading">AI Insight</h2>
        </div>
        <div className="plan-badge">
          <small>လက်ရှိအစီအစဉ်</small>
          <strong>{context.currentPlan.nameMm}</strong>
        </div>
      </div>

      <div className={`insight-verdict ${analysis.risk}`}>
        <span className="insight-icon" aria-hidden="true">{analysis.risk === "low" ? "✓" : "↗"}</span>
        <div className="insight-copy">
          <small>ATOM MIND PREDICTION</small>
          <h3>{prediction}</h3>
          <p>{analysis.insightMm}</p>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <div className="metric-card-top"><span className="metric-icon data" aria-hidden="true">▰</span><small>Data</small><b>{dataPct}%</b></div>
          <strong>{context.usage.dataUsedGb} <span>/ {context.usage.dataAllowanceGb} GB</span></strong>
          <div className="meter" role="progressbar" aria-label="Data သုံးစွဲမှု" aria-valuenow={dataPct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${dataPct}%` }} /></div>
        </article>
        <article className="metric-card">
          <div className="metric-card-top"><span className="metric-icon voice" aria-hidden="true">◖</span><small>Voice</small><b>{voicePct}%</b></div>
          <strong>{context.usage.voiceUsedMin} <span>/ {context.usage.voiceAllowanceMin} min</span></strong>
          <div className="meter voice-meter" role="progressbar" aria-label="ဖုန်းခေါ်မိနစ် သုံးစွဲမှု" aria-valuenow={voicePct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${voicePct}%` }} /></div>
        </article>
        <article className="metric-card">
          <div className="metric-card-top"><span className="metric-icon topup" aria-hidden="true">＋</span><small>Top-ups</small></div>
          <strong>{context.usage.topUpsThisMonth} <span>ကြိမ် / ဒီလ</span></strong>
          <p>{context.usage.topUpsThisMonth >= 2 ? "အပိုကုန်ကျနေ" : "ပုံမှန်အတွင်း"}</p>
        </article>
        <article className="metric-card">
          <div className="metric-card-top"><span className="metric-icon trend" aria-hidden="true">↗</span><small>Usage trend</small></div>
          <strong>{analysis.dataBurnGbPerDay} <span>GB / ရက်</span></strong>
          <p>{burnVsNormalPct > 0 ? `ပုံမှန်ထက် ${burnVsNormalPct}% မြန်` : `ပုံမှန်ထက် ${Math.abs(burnVsNormalPct)}% နည်း`}</p>
        </article>
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
        <span>✦ ဒီ insight အရ အကြံရယူမည်</span>
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
    </>
  );
}
