export interface ShoppingIntent { product: string; budget: string; currency: string; language: string; shippingDestination: string; warrantyRequired: boolean; merchantPreference: string; requirements: string[]; }
export interface ResearchProduct { name: string; merchant: string; price: string; trustScore: number; warranty: string; returns: string; shipping: string; delivery: string; risk: "Low" | "Medium" | "High"; pros: string[]; cons: string[]; }
export interface ResearchSummary { productsCompared: number; verifiedMerchants: number; rejectedMerchants: number; estimatedSavings: string; timeSpent: string; products: ResearchProduct[]; }
export interface MerchantAnalysis { summary: string; verified: string[]; rejected: string[]; }
export interface RiskAnalysis { summary: string; flaggedRisks: string[]; overallRisk: "Low" | "Medium" | "High"; }
export interface Comparison { ranking: Array<{ productName: string; rank: number; reason: string }>; }
export interface DecisionLedger { selectedReason: string; alternativesRejected: string; tradeOffs: string; merchantVerification: string; reasoningTimeline: string[]; overallTrustScore: number; }
export interface AgentResult { intent: ShoppingIntent; researchSummary: ResearchSummary; merchantAnalysis: MerchantAnalysis; riskAnalysis: RiskAnalysis; comparison: Comparison; decisionLedger: DecisionLedger; confidenceScore: number; recommendedProduct: ResearchProduct; }
export interface ResearchProgress { stage: "intent" | "research" | "merchant" | "risk" | "comparison" | "decision"; status: "running" | "completed"; }
