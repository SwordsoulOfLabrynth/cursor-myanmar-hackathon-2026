import { useId, useState } from "react";
import type { CustomerId, CustomerSummary } from "../../shared/api-contract.ts";

type Props = {
  summaries: CustomerSummary[] | null;
  selectedId: CustomerId;
  onSelect: (id: CustomerId) => void;
};

export function ProfileSwitcher({ summaries, selectedId, onSelect }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  if (!summaries) {
    return (
      <section className="panel panel-skeleton account-panel" aria-busy="true">
        အကောင့် ဖွင့်နေသည်…
      </section>
    );
  }

  const selected =
    summaries.find((customer) => customer.id === selectedId) ?? summaries[0];
  if (!selected) {
    return null;
  }

  return (
    <section className="panel account-panel" aria-labelledby="account-heading">
      <div className="account-header">
        <span className="avatar account-avatar" aria-hidden="true">
          {selected.displayNameMm.slice(0, 1)}
        </span>
        <div className="account-copy">
          <p className="account-eyebrow">DEMO MODE · သင့် ATOM အကောင့်</p>
          <h2 id="account-heading">{selected.displayNameMm}</h2>
          <p className="account-meta">
            <span>{selected.phoneMasked}</span>
            <span aria-hidden="true">·</span>
            <span>{selected.currentPlanNameMm}</span>
          </p>
        </div>
      </div>

      <div className="demo-account">
        <button
          type="button"
          className="demo-account-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>Demo Mode · Su Su / Ko Ko / Ma Ma</span>
          <span aria-hidden="true">{menuOpen ? "▴" : "▾"}</span>
        </button>

        {menuOpen ? (
          <div
            id={menuId}
            className="demo-account-menu"
            role="listbox"
            aria-label="Demo အကောင့် ရွေးရန်"
          >
            {summaries.map((customer) => {
              const active = customer.id === selectedId;
              return (
                <button
                  key={customer.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={
                    active ? "demo-account-option selected" : "demo-account-option"
                  }
                  onClick={() => {
                    onSelect(customer.id);
                    setMenuOpen(false);
                  }}
                >
                  <span className="demo-account-option-copy">
                    <strong>{customer.displayNameMm}</strong>
                    <small>
                      {customer.phoneMasked} · {customer.currentPlanNameMm}
                    </small>
                  </span>
                  {active ? (
                    <span className="demo-account-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
