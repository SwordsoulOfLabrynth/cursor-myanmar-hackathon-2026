import type { CustomerId, CustomerSummary } from "../../shared/api-contract.ts";

type Props = {
  summaries: CustomerSummary[] | null;
  selectedId: CustomerId;
  onSelect: (id: CustomerId) => void;
};

export function ProfileSwitcher({ summaries, selectedId, onSelect }: Props) {
  if (!summaries) {
    return <section className="panel">ဖောက်သည် ၃ ဦး ဖွင့်နေသည်…</section>;
  }

  return (
    <section className="panel">
      <h2>ဖောက်သည်</h2>
      <div className="profile-row">
        {summaries.map((c) => (
          <button
            key={c.id}
            type="button"
            className={c.id === selectedId ? "sim selected" : "sim"}
            onClick={() => onSelect(c.id)}
          >
            <span className="sim-notch" />
            <strong>{c.displayNameMm}</strong>
            <span>{c.phoneMasked}</span>
            <span className="plan">{c.currentPlanNameMm}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
