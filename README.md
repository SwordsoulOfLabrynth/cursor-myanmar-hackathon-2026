# MyNext AI — Burmese hyper-personalized concierge

Hackathon prototype. **Synthetic demo data only** — not real ATOM customers.

Public repo: https://github.com/SwordsoulOfLabrynth/cursor-myanmar-hackathon-2026

## Run (frontend + mock API)

```bash
npm install
npm run dev
```

Open the Vite URL. Core flow: pick a customer → Burmese question → Next-Action card → action toast.

Same question, three customers, three different recommendations.

## API contract

Source of truth: [`shared/api-contract.ts`](shared/api-contract.ts)

| Function | Purpose |
|---|---|
| `listCustomers()` | Demo profile list |
| `getCustomerContext(customerId)` | Plan + usage + history |
| `listPackages()` | Catalog |
| `recommend({ customerId, message })` | Intent + grounded card |
| `confirmAction(...)` | Demo CTA only (toast, no payment) |

Frontend currently uses [`src/api/mynextApi.ts`](src/api/mynextApi.ts) (mock). It returns the **same** `RecommendResponse` as Convex.

## Backend (Developer 1)

```bash
npx convex dev
```

Then point the UI at Convex (next slice). Functions:

- `catalog.listDemoCustomers`
- `catalog.getDemoCustomer`
- `catalog.listDemoPackages`
- `recommend.recommend`

Engine: [`shared/recommendEngine.ts`](shared/recommendEngine.ts) — do not fork a second JSON shape.

## Team

- Backend / AI: repo owner
- Frontend: [SnowFairy107](https://github.com/SnowFairy107) (collaborator invite sent — accept email/GitHub notification)
