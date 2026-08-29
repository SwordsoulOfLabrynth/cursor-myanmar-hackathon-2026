import { useState, type FormEvent } from "react";
import type { Account } from "../accountStore.ts";

type Props = {
  accounts: Account[];
  onLogin: (accountId: string) => void;
  onCreate: (name: string, phone: string) => void;
};

export function LoginScreen({ accounts, onLogin, onCreate }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onCreate(name, phone);
  };

  return (
    <main className="login-shell">
      <section className="login-hero">
        <nav className="brandbar" aria-label="ATOM Mind">
          <div className="brandmark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <strong>
            ATOM Mind <small>Your Personal Telecom AI</small>
          </strong>
          <span className="demo-pill">HACKATHON MVP</span>
        </nav>
        <div className="login-copy">
          <p className="eyebrow">သင့်အကောင့် · သင့် usage · သင့်အတွက်ပဲ</p>
          <h1>ကိုယ်ပိုင် Telecom AI ကို စမ်းကြည့်ပါ</h1>
          <p>
            Burmese concierge က synthetic usage metrics ကို စစ်ပြီး
            အကြောင်းပြချက်ပါတဲ့ နောက်တစ်ဆင့်ကို အကြံပေးပါတယ်။
          </p>
        </div>
        <div className="login-warning" role="note">
          <strong>Demo only</strong>
          <span>
            Synthetic hackathon data ဖြစ်ပြီး production login မဟုတ်ပါ။
            တကယ့် ATOM အကောင့်၊ ငွေပေးချေမှုနှင့် API မချိတ်ထားပါ။
          </span>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-heading">
        <p className="step-label">Demo for judges</p>
        <h2 id="login-heading">စမ်းမယ့် အကောင့်တစ်ခု ရွေးပါ</h2>
        <p className="login-help">
          တူညီတဲ့မေးခွန်းကို account တစ်ခုစီနဲ့ စမ်းပြီး metric-driven
          အကြံပြုချက် ကွာခြားပုံ ကြည့်နိုင်ပါတယ်။
        </p>
        <div className="login-accounts">
          {accounts.map((account) => (
            <button
              key={account.id}
              className="login-account"
              type="button"
              onClick={() => onLogin(account.id)}
            >
              <span className="avatar" aria-hidden="true">
                {account.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{account.displayNameMm}</strong>
                <small>
                  {account.phoneMasked} · {account.currentPlan.nameMm}
                </small>
              </span>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </div>

        {!creating ? (
          <button
            className="create-toggle"
            type="button"
            onClick={() => setCreating(true)}
          >
            + Starter synthetic account ဖန်တီးမည်
          </button>
        ) : (
          <form className="create-form" onSubmit={submit}>
            <label>
              အမည်
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="ဥပမာ Thiri"
                maxLength={50}
                required
              />
            </label>
            <label>
              ဖုန်းနံပါတ် (demo)
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="09 *** *** 123"
                maxLength={30}
                required
              />
            </label>
            <div className="create-actions">
              <button type="button" onClick={() => setCreating(false)}>
                မလုပ်တော့ပါ
              </button>
              <button className="primary" type="submit">
                အကောင့်ဖန်တီးမည် <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
