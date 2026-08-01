# Submission Summary

## One-line pitch

TrustLane is the trust layer for AI shopping: it explains every recommendation, requires human approval, and creates an auditable replay from request to Prava-powered checkout.

## Project summary

TrustLane makes AI-driven shopping transparent and controllable. A shopper describes what they need, and TrustLane produces structured intent extraction, product research, merchant verification, risk assessment, comparison, and a Decision Ledger in a single OpenAI Responses API call. Instead of an unexplained recommendation, the workspace exposes price, warranty, returns, delivery, risk level, merchant signals, alternatives, trade-offs, and confidence. The customer remains in control through explicit approval. After approval, TrustLane creates a Prava Sandbox session server-side and mounts Prava’s secure embedded iframe client-side, keeping raw card data outside the app. A real Prava success callback creates a detailed Trust Receipt. Trust Replay then records the request, AI decision stages, approval, payment initiation, and actual payment outcome.

## Technical highlights

- Next.js 15, TypeScript, Tailwind CSS, and Framer Motion
- Typed, single-call OpenAI Responses API orchestration
- Server-side API routes and environment-based secret handling
- Prava Sandbox session creation and `@prava-sdk/core` embedded iframe
- Explicit failure, cancellation, retry, receipt, and replay states

## Sponsor integrations

- **Prava Sandbox:** server-created sandbox sessions and secure client-side embedded checkout
- **OpenAI Responses API:** structured AI shopping research and Decision Ledger generation

## Why it can win

TrustLane addresses the trust gap in agentic commerce directly. It combines explainable AI decisions, real human approval, secure payment boundaries, and a replayable audit trail into one polished shopper experience.
