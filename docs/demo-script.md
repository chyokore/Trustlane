# TrustLane Demo Script

TrustLane is the Trust Layer for Agentic Commerce. Shopping agents can find products, but their decisions are often opaque. TrustLane makes every recommendation reviewable before a user spends.

Start in the AI Shopping Workspace and enter: “Find the best gaming laptop under $1,200 with a warranty.” The timeline shows intent extraction, product research, merchant verification, risk assessment, comparison, and the Decision Ledger.

The extracted intent turns the request into visible constraints. The comparison cards show price, trust score, returns, delivery, and trade-offs. The Decision Ledger explains why the recommendation won, what alternatives were rejected, and how merchant and risk signals affected confidence.

When the user selects Approve Purchase, TrustLane creates a scoped Prava Sandbox session server-side and mounts Prava’s secure embedded checkout iframe. TrustLane never receives raw card data.

If Prava returns success, TrustLane shows a receipt with the merchant, product, amount, transaction ID, timestamp, and ledger ID. View Replay then shows the complete journey from request through each AI decision and the actual payment outcome.

TrustLane lets AI move quickly without asking people to surrender visibility or control.
