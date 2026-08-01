import type { AgentResult, ResearchProduct } from "@/types/agents";
export type OrderStatus = "pending" | "successful" | "failed" | "cancelled" | "preview";
export interface CheckoutAttempt { id: string; product: string; merchant: string; amount: string; currency: string; status: OrderStatus; timestamp: string; demo?: boolean; }
export interface SavedProduct extends ResearchProduct { id: string; savedAt: string; }
export interface LocalPreferences { language: string; currency: string; notifications: boolean; approvalRequired: boolean; reducedMotion: boolean; }
export type LatestResearch = AgentResult;
