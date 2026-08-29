# နီးနီး · NeeNee AI

**ATOM MyNext challenge concept:** a Burmese-first, hyper-personalized telecom
companion that turns intent, usage, and service history into a grounded next
action.

Mobile-first hackathon MVP. **Every customer, usage event, and recommendation
shown here is synthetic demo data — never real ATOM customer data.** This is an
independent concept demo and does not claim official ATOM affiliation.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL. The core demo is:

1. Pick Su Su, Ko Ko, or Ma Ma.
2. Review the selected synthetic plan, usage, and history.
3. Ask the same Burmese data question.
4. See a different grounded recommendation, explicit “why,” cited customer
   facts, and a demo-only confirmation for each profile.

Also test `SIM ကတ် ပျောက်သွားတယ်၊ ဘာလုပ်ရမလဲ?` to see the support path avoid
an inappropriate package upsell.

Tap **အသံဖြင့် မေးမည်** to dictate in Burmese where Web Speech is available.
Unsupported browsers show a clear typed-input fallback, so voice never blocks
the core demo.

## AI architecture

- `shared/api-contract.ts` is the single frontend/backend response contract.
- `shared/recommendEngine.ts` provides Burmese intent handling and a
  deterministic grounded fallback.
- `netlify/functions/recommend.ts` optionally calls an LLM server-side. The model
  may improve Burmese explanations, but the rules engine locks the selected
  package, package ID, action, and cited facts.
- If no `OPENAI_API_KEY` is configured, or the model call fails, the UI
  automatically uses the same response contract from the rules engine.

Copy `.env.example` only when setting server-side environment variables. Never
put a secret in a `VITE_` variable.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

Convex stubs use validators for public arguments and return values. For backend
development, use:

```bash
npx convex dev
```

No authentication is present because this MVP contains no user accounts and no
real customer records. CTA actions are simulated; no payment or plan change is
performed.

## Deploy to Netlify

The repository includes `netlify.toml`. After authenticating the Netlify CLI:

```bash
npx netlify deploy --build
```

Add `--prod` only when intentionally publishing the production submission.
