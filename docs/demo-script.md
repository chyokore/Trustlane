# TrustLane Demo Script

TrustLane is the Trust Layer for Agentic Commerce. Shopping agents can find products, but their decisions are often opaque. TrustLane makes every recommendation reviewable before a user spends.

Start in the AI Shopping Workspace and enter: “Find the best gaming laptop under $1,200 with a warranty.” The timeline shows intent extraction, product research, merchant verification, risk assessment, comparison, and the Decision Ledger.

The extracted intent turns the request into visible constraints. Comparison cards show price, trust score, returns, delivery, and trade-offs. The Decision Ledger explains why the recommendation won, what alternatives were rejected, and how merchant and risk signals affected confidence.

When the user selects **Continue to Secure Prava Checkout**, TrustLane creates a scoped hosted Prava Sandbox session server-side and redirects to the exact validated checkout URL. TrustLane never receives raw card data.

On return, show the authentic Prava state in Orders. `awaiting_result` means authorization completed and merchant execution remains pending; it is not a successful payment. Only `completed` produces a successful Trust Receipt. Verification Center and Trust Replay preserve the evidence and lifecycle trail.

TrustLane lets AI move quickly without asking people to surrender visibility or control.
