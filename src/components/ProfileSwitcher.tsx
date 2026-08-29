import type { CustomerId, CustomerSummary } from "../../shared/api-contract.ts";

type Props = {
  summaries: CustomerSummary[] | null;
  selectedId: CustomerId;
  onSelect: (id: CustomerId) => void;
};

export function ProfileSwitcher({ summaries, selectedId, onSelect }: Props) {
  if (!summaries) {
    return (
      <section className="panel panel-skeleton" aria-busy="true">
        Demo ဖောက်သည် ၃ ဦး ဖွင့်နေသည်…
      </section>
    );
  }

  return (
    <section className="panel profile-panel" aria-labelledby="profile-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">အဆင့် ၁</p>
          <h2 id="profile-heading">ဘယ်သူ့အတွက်လဲ?</h2>
        </div>
        <span className="synthetic-tag">Synthetic profiles</span>
      </div>
      <div className="profile-row" role="group" aria-label="Demo ဖောက်သည်ရွေးရန်">
        {summaries.map((c) => (
          <button
            key={c.id}
            type="button"
            className={c.id === selectedId ? "profile selected" : "profile"}
            onClick={() => onSelect(c.id)}
            aria-pressed={c.id === selectedId}
          >
            <span className="avatar" aria-hidden="true">
              {c.displayNameMm.slice(0, 1)}
            </span>
            <span className="profile-copy">
              <strong>{c.displayNameMm}</strong>
              <small>{c.oneLinerMm}</small>
            </span>
            <span className="profile-check" aria-hidden="true">
              ✓
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
