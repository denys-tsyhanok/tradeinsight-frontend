// Common types for the Trade Insight platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  status: "pending" | "completed" | "cancelled";
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  assets: PortfolioAsset[];
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
}

export interface ChartDataPoint {
  timestamp: Date | string;
  value: number;
  [key: string]: unknown;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high24h: number;
  low24h: number;
}

