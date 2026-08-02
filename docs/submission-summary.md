# Submission Summary

## One-line pitch

TrustLane is the trust layer for AI shopping: it explains every recommendation, requires human approval, and creates an auditable replay from request through Prava Hosted Checkout.

## Project summary

TrustLane makes AI-driven shopping transparent and controllable. A shopper describes what they need, and TrustLane produces structured intent extraction, product research, merchant verification, risk assessment, comparison, and a Decision Ledger through the OpenAI Responses API. The workspace exposes price, warranty, returns, delivery, risk, merchant signals, alternatives, trade-offs, and confidence before approval.

After explicit approval, TrustLane creates a Prava Hosted Checkout session server-side and redirects to Prava, keeping raw card data outside the application. The callback preserves genuine `pending`, `awaiting_result`, `completed`, and `failed` states. Only `completed` creates a successful Trust Receipt. Trust Replay records the request, AI decision stages, approval, payment initiation, and authentic outcome.

## Technical highlights

- Next.js 15, TypeScript, Tailwind CSS, and Framer Motion
- Typed OpenAI Responses API orchestration
- Senso merchant verification and evidence
- Server-side secret handling and Prava hosted-session creation
- Authentic lifecycle reconciliation, persistent order attempts, receipt JSON, and replay

## Sponsor integrations

- **Prava Sandbox:** server-created hosted checkout and server-side result polling
- **OpenAI Responses API:** structured shopping research and Decision Ledger generation
- **Senso:** merchant verification context and evidence

## Why it can win

TrustLane addresses the trust gap in agentic commerce directly. It combines explainable AI decisions, real human approval, secure payment boundaries, and a replayable audit trail in one polished shopper experience.
