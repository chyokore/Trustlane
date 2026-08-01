# TrustLane — The Trust Layer for Agentic Commerce

TrustLane is an AI shopping workspace that makes agentic commerce reviewable. It researches a request, evaluates options and merchants, exposes its reasoning in a Decision Ledger, and requires human approval before Prava Sandbox checkout.

## The problem and solution

Shopping agents can find products quickly, but users still need to know why a product won, whether a merchant is safe, what was rejected, and what happens when an agent is allowed to spend. TrustLane turns that uncertainty into a visible, auditable decision trail.

A single OpenAI Responses API call produces structured intent, research, merchant, risk, comparison, and decision data. The user reviews that evidence, explicitly approves the recommendation, and completes sandbox checkout through Prava’s secure embedded flow.

### Why TrustLane is different

- Trust is a product surface, not hidden model behavior.
- The Decision Ledger explains recommendations before approval.
- Trust Replay preserves the journey from request to payment outcome.
- Prava keeps card collection inside a secure iframe; TrustLane never handles raw card data.

## Core workflow

User Request → Intent Extraction → Product Research → Merchant Verification → Risk Analysis → Product Comparison → Decision Ledger → Human Approval → Prava Sandbox Checkout → Trust Receipt → Trust Replay

## Key features

- AI shopping assistant
- Single-call OpenAI orchestration
- Merchant trust analysis and risk scoring
- Transparent Decision Ledger
- Explicit human approval
- Prava embedded checkout
- Trust Receipt and Trust Replay
- Guest-friendly dashboard
- Language and currency selectors

## Architecture

```mermaid
flowchart LR
  user["User Request"] --> workspace["Next.js Shop Workspace"]
  workspace --> research["/api/research"]
  research --> openai["OpenAI Responses API"]
  openai --> pipeline["Trust Pipeline<br/>Intent · Research · Merchant · Risk · Comparison"]
  pipeline --> senso["Senso Verified Context"]
  senso --> ledger["Decision Ledger"]
  ledger --> approval["User Approval"]
  approval --> session["/api/prava/create-session"]
  session --> checkout["Prava Secure Embedded Checkout"]
  checkout --> receipt["Trust Receipt"]
  receipt --> replay["Trust Replay"]
  receipt --> feedback["Senso Outcome Feedback<br/>after confirmed success"]
```

| Layer | Technology |
| --- | --- |
| Application | Next.js 15, TypeScript, Tailwind CSS |
| AI | OpenAI Responses API, typed server-side orchestration |
| Payments | Prava Sandbox, `@prava-sdk/core` |
| Delivery | Vercel deployment and Next.js server-side API routes |
| Checkout UI | Client-side Prava iframe mounting; secret key remains server-only |

## Environment variables

Create `.env.local`; never commit secrets.

```env
OPENAI_API_KEY=
OPENAI_MODEL=
PRAVA_SECRET_KEY=
NEXT_PUBLIC_PRAVA_PUBLISHABLE_KEY=
SENSO_API_KEY=
```

## Local setup

```bash
npm install
# Create .env.local and add required values
npm run dev
```

Routes to test: `/`, `/dashboard`, `/dashboard/shop`, `POST /api/research`, and `POST /api/prava/create-session`.

## Judge demo flow

1. Open `/dashboard/shop` and enter a natural-language shopping request.
2. Show the agent timeline, intent, product comparison, and merchant/risk evidence.
3. Open the Decision Ledger to explain the recommendation.
4. Select **Approve Purchase** to show human control and Prava embedded checkout.
5. After a Prava success callback, show the Trust Receipt and **View Replay**.

## Current Prava Sandbox note

The sandbox integration supports session creation, order creation, embedded checkout loading, and Prava dashboard reporting. TrustLane only labels a payment successful when Prava returns a success callback; it does not invent a successful payment.

Visa/FIDO iframe initialization is currently being tested as a sandbox or environment constraint, including Cloudflare-related conditions. Failures and cancellations remain visible, and retry is always explicit.

## Documentation

- [Judge demo script](docs/demo-script.md)
- [Submission summary](docs/submission-summary.md)

## Verification Guide

TrustLane exposes a reviewable proof trail for every shopping run. Open the [Live Demo](/dashboard/shop), then use [TrustLane Verify](/dashboard/verify) to inspect the Merchant Passport, Senso-returned verification sources, Decision Ledger preview, Replay Engine, and downloadable Receipt JSON for each recorded order attempt. Receipt JSON represents the local sandbox attempt state and never claims payment completion unless Prava returned a success callback.

Public verification links:

- [Live Demo](/dashboard/shop)
- [Verification Center](/dashboard/verify)
- [Merchant Passport](/dashboard/verify#passport)
- [Replay Engine](/dashboard/verify#replay)
- [Receipt JSON](/dashboard/verify#receipt-json)
- [Architecture](/#architecture)
- [Documentation](/docs)
