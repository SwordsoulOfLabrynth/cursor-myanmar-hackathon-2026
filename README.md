# ATOM Mind — Your Personal Telecom AI

Hackathon concept for the ATOM MyNext challenge: a Burmese-first personal
telecom AI that turns intent, usage, and service history into a grounded next
action.

**Synthetic demo data only — not an official ATOM product.**

## Hackathon submission

### Problem

Telecom self-service usually shows the same catalog to everyone. Customers must
translate “data keeps running out” into a package decision themselves, while
generic upsells ignore usage mix, repeat top-ups, and service history.

### Solution

**ATOM Mind** is a Burmese-first decision layer inside the ATOM app. It turns one
natural-language question into an explainable next action using the customer's
current plan, usage mix, allowance, top-ups, and history.

The on-page **Usage Insight Analyzer** turns those synthetic events into data
burn rate, estimated days to empty, projected monthly demand, top-up pattern,
usage mix, and a current-plan fit score. Analyzer output feeds every
recommendation and is cited in grounding facts; **အလိုအလျောက် အကြံ** can trigger
the same recommendation contract without typing.

Personalization proof (same Burmese question → opposite Su Su / Ko Ko answers)
lives in a collapsed **Demo for judges · စစ်ဆေးရန်** control at the bottom — not
the default hero.

This is proposed as an **in-app ATOM feature, not a rival telecom app**.

### AI usage

- Burmese intent detection identifies data, voice, SIM, network, and billing
  needs.
- Multi-factor scoring exposes intent confidence, allowance pressure, usage mix,
  top-up behavior, and decision confidence.
- The deterministic engine locks the decision to the synthetic package catalog,
  so an LLM can improve Burmese explanations but cannot invent an offer.
- The Netlify function supports OpenAI, Anthropic, or an OpenAI-compatible
  Netlify AI Gateway endpoint. If none is configured or a call fails, the UI
  honestly labels and uses the explainable rules fallback.

### Cursor usage and tools

Cursor was used to build and refine the TypeScript/React prototype, customer-first
mobile UX, recommendation contract, and QA. Stack: React 19, TypeScript, Vite,
PWA service worker, Netlify Functions, Convex-compatible typed contracts.

### 90-second judge demo

1. **0–25s:** Open as a customer. Show one profile, Usage Analyzer (fit score /
   burn rate / top-ups), and the Burmese question box.
2. **25–50s:** Submit the question (or **အလိုအလျောက် အကြံ**). Show grounded
   recommendation, cited analyzer facts, and honest LLM / rules source.
3. **50–70s:** Confirm CTA — real ATOM app would open its confirmation screen;
   this demo never charges.
4. **70–90s:** Expand **Demo for judges** to prove same question → Su Su gets
   more data, Ko Ko gets more minutes. Optionally try the SIM-loss prompt to show
   no unsafe upsell.

## Run locally

```bash
npm install
npm run dev
```

1. Pick Su Su, Ko Ko, or Ma Ma.
2. Review the analyzer for the selected synthetic plan.
3. Ask a Burmese question (or auto-recommend).
4. See a grounded next action and demo-only confirmation.

Also test `SIM ကတ် ပျောက်သွားတယ်၊ ဘာလုပ်ရမလဲ?` for the support path.

## AI architecture

- `shared/api-contract.ts` — frontend/backend response contract.
- `shared/recommendEngine.ts` — analyzer + intent + grounded fallback.
- `netlify/functions/recommend.ts` — optional LLM copy enrichment with catalog
  lock; falls back to rules if no key/gateway.

Copy `.env.example` only for server-side env vars. Never put secrets in `VITE_`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

For Convex backend development: `npx convex dev` (not deploy).

## Deploy to Netlify

```bash
npx netlify deploy --build
```

Add `--prod` only for the production submission.
