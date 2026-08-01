export type AgentStatus = "completed" | "active" | "pending";

export interface AgentStep {
  name: string;
  detail: string;
  status: AgentStatus;
}

export interface Product {
  name: string;
  merchant: string;
  price: string;
  trustScore: number;
  warranty: string;
  returns: string;
  shipping: string;
  delivery: string;
  risk: "Low" | "Medium" | "High";
  pros: string[];
  cons: string[];
  recommended?: boolean;
  accent: string;
}

export interface ProductImage {
  imageUrl: string;
  thumbnailUrl?: string;
  sourceUrl: string;
  sourceDomain: string;
  width: number;
  height: number;
  altText: string;
}
