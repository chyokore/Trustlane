import type { AgentResult, ResearchProduct } from "@/types/agents";
export type OrderStatus = "Pending" | "Sandbox Pending" | "Authorized / Awaiting Merchant Execution" | "Completed" | "Failed";
export interface CheckoutAttempt { id: string; product: string; merchant: string; amount: string; currency: string; status: OrderStatus; timestamp: string; decisionLedgerId?: string; transactionId?: string; sessionId?: string; orderId?: string; checkoutMode?: "embedded" | "hosted"; demo?: boolean; }
export interface HostedCheckoutSession { sessionId: string; orderId: string; merchant: string; product: string; amount: string; currency: string; ledgerId: string; createdAt: string; expiresAt: string; }
export interface SavedProduct extends ResearchProduct { id: string; savedAt: string; }
export interface LocalPreferences { language: string; currency: string; notifications: boolean; approvalRequired: boolean; reducedMotion: boolean; }
export type LatestResearch = AgentResult;
