# TrustLane

## The Trust Layer for Agentic Commerce

TrustLane is an AI-assisted shopping workspace that verifies merchants, explains recommendations, requires explicit human approval, completes secure hosted checkout through Prava, and preserves an auditable commerce trail.

[![Live Demo](https://img.shields.io/badge/Live_Demo-TrustLane-14b8a6?style=for-the-badge)](https://trustlane-pi.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/chyokore/Trustlane)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Demo-ff0000?style=for-the-badge&logo=youtube)](https://youtube.com/shorts/5hE6shioASE?si=ImZffbwxoQxjtCG8)

## Problem

AI can find products and initiate purchases quickly, but trustworthy commerce requires more than speed. Users need evidence that a merchant is legitimate, a transparent explanation of why one option was selected, explicit control before money moves, secure payment handling, and an auditable record of the outcome.

## Solution

TrustLane creates a reviewable trust layer around AI-assisted purchasing. It gathers evidence, verifies merchants with Senso, evaluates risk and policy constraints, produces a transparent Decision Ledger, pauses for human approval, redirects to Prava Hosted Checkout, and records authentic payment lifecycle states for post-purchase verification and replay.

## Core Workflow

```mermaid
flowchart TB
    subgraph S1["1. Discover"]
        U["User Request"]
        I["Intent Extraction"]
        R["AI Research"]
        U --> I --> R
    end

    subgraph S2["2. Verify & Decide"]
        M["Merchant Verification"]
        K["Risk and Policy Review"]
        D["Decision Ledger"]
        A["Explicit Human Approval"]
        M --> K --> D --> A
    end

    subgraph S3["3. Pay"]
        P["Prava Hosted Checkout"]
        C["TrustLane Callback"]
        O["Order Attempt"]
        P --> C --> O
    end

    subgraph S4["4. Prove"]
        T["Trust Replay"]
        V["Verification Center"]
        T --> V
    end

    R --> M
    A --> P
    O --> T
```

## Product Capabilities

- Structured shopping intent extraction and AI research using the OpenAI Responses API
- Senso-backed merchant verification and visible evidence sources
- Risk, policy, warranty, return, and trade-off review
- A Decision Ledger explaining the selected recommendation
- Explicit human approval before checkout
- Prava Hosted Checkout with server-side session creation
- Authentic `pending`, `awaiting_result`, `completed`, and `failed` states
- Persistent order attempts, downloadable receipt JSON, and Trust Replay
- Merchant Passport and Verification Center for auditability

## Payment Lifecycle Integrity

TrustLane never fabricates payment success. A hosted session or successful cardholder authorization is not treated as a completed purchase.

| Prava state | TrustLane state | Meaning |
| --- | --- | --- |
| `pending` | Sandbox Pending | Secure checkout is still processing |
| `awaiting_result` | Authorized / Awaiting Merchant Execution | Authorization is complete; merchant execution is not final |
| `completed` | Completed | Payment and merchant execution completed |
| `failed` | Failed | Checkout reached a terminal failure |

Only `completed` produces a successful Trust Receipt and confirmed Senso outcome record.

## Architecture

| Layer | Technology and responsibility |
| --- | --- |
| Web application | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS |
| AI orchestration | OpenAI Responses API with structured server-side output |
| Merchant trust | Senso verification context and evidence |
| Payments | Prava Hosted Checkout and server-side result polling |
| Audit layer | Decision Ledger, order attempts, receipt JSON, Trust Replay |
| Persistence | Safe browser-local metadata; no card data, API keys, or session credentials |
| Deployment | Vercel |

Sensitive provider credentials remain server-side. TrustLane does not store card numbers, CVV values, OTPs, passkey information, API keys, or one-time payment credentials.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Product overview and judge entry point |
| `/dashboard` | TrustLane dashboard |
| `/dashboard/shop` | Research, recommendation, approval, and hosted checkout |
| `/dashboard/agents` | Agent workflow overview |
| `/dashboard/decision-ledger` | Recommendation reasoning and trade-offs |
| `/dashboard/orders` | Persistent checkout attempts and lifecycle states |
| `/dashboard/saved` | Saved research products |
| `/dashboard/settings` | Local preferences |
| `/dashboard/verify` | Merchant Passport, evidence, replay, and receipts |
| `/dashboard/checkout/complete` | Hosted checkout callback reconciliation |
| `/docs` | In-app technical documentation |

## Guest Data & Cross-Device Demo

TrustLane operates in guest mode for the hackathon. Research, Decision Ledger data, merchant evidence, order attempts, verification events, saved products, and preferences are intentionally stored in the current browser rather than synchronized through an account or cloud database.

Activity created on another browser or device does not appear automatically. Use **Export Demo State** in Settings or Verification Center, then **Import Demo State** on the destination browser to merge the safe demo history with its existing local activity. Newer records are preserved and duplicate attempts are matched by their safe identifiers.

Exports never include customer email addresses, API keys, access tokens, Prava session tokens, card data, CVV, OTP values, passkeys, payment credentials, or callback secrets. Import and export are client-side operations and do not call OpenAI, Senso, Prava, or any TrustLane API route.

## Local Development

### Prerequisites

- Node.js 20 or newer
- npm
- Sandbox credentials for the integrations you intend to exercise

### Setup

```bash
git clone https://github.com/chyokore/Trustlane.git
cd Trustlane
npm install
```

Create `.env.local` and provide the required credentials. Never commit this file.

```env
OPENAI_API_KEY=
OPENAI_MODEL=
SENSO_API_KEY=
PRAVA_SECRET_KEY=
NEXT_PUBLIC_PRAVA_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=https://trustlane-pi.vercel.app
```

Start the development server:

```bash
npm run dev
```

Production validation:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

These static commands do not create a Prava session or transaction.

## Judge Demo

1. Open the [live application](https://trustlane-pi.vercel.app) and continue to the shopping workspace.
2. Enter a natural-language product request and review the structured intent.
3. Inspect researched products, merchant evidence, risk signals, and the Decision Ledger.
4. Confirm that checkout requires explicit approval and a genuine customer email.
5. Continue to Prava Hosted Checkout using the assigned sandbox card.
6. Return through the callback and inspect the authentic lifecycle state in Orders.
7. Open Verification Center to review the Merchant Passport, Trust Replay, evidence, and receipt JSON.

No real funds move in sandbox mode. Do not describe `awaiting_result` as a completed payment.

## Documentation and Public Links

- [Live application](https://trustlane-pi.vercel.app)
- [YouTube demo](https://youtube.com/shorts/5hE6shioASE?si=ImZffbwxoQxjtCG8)
- [Judge demo script](docs/demo-script.md)
- [Submission summary](docs/submission-summary.md)
- [Privacy policy](https://trustlane-pi.vercel.app/privacy)
- [Terms](https://trustlane-pi.vercel.app/terms)

## Hackathon Submission

TrustLane was built for the Agentic Commerce Hackathon to demonstrate that autonomous commerce can remain evidence-driven, human-controlled, secure, and auditable from request through final outcome.
