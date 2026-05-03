export interface GoldPrices {
  barBuy: number;
  barSale: number;
  ornaReturn: number;
  priceAt?: string;
  update_time?: string;
}

export interface Branch {
  id: string;
  branch_name: string;
  branch_pin: string;
  is_configured: boolean;
  role?: "branch" | "admin";
}

export interface BranchConfig {
  id: string;
  name: string;
}

export interface PromotionBanner {
  id: string;
  imageUrl: string;
}

export type UserRole = "branch" | "admin";
