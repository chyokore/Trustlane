import type { LucideIcon } from "lucide-react";

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "teal" | "violet" | "amber" | "blue";
}

export interface ActivityItem {
  title: string;
  detail: string;
  time: string;
  status: "verified" | "review" | "approved";
}
