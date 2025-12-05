import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "USD",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", options).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(d);
}

export function generateSparklineData(
  points: number = 12,
  min: number = 100,
  max: number = 200,
  trend: "up" | "down" | "neutral" = "neutral"
): number[] {
  const data: number[] = [];
  let current = (min + max) / 2;

  for (let i = 0; i < points; i++) {
    const trendBias = trend === "up" ? 0.6 : trend === "down" ? 0.4 : 0.5;
    const change = (Math.random() - trendBias) * (max - min) * 0.1;
    current = Math.max(min, Math.min(max, current + change));
    data.push(current);
  }

  return data;
}

export function generateMockPriceHistory(days: number = 30, startPrice: number = 100): number[] {
  const data: number[] = [];
  let price = startPrice;

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * startPrice * 0.03;
    price = Math.max(startPrice * 0.7, Math.min(startPrice * 1.5, price + change));
    data.push(price);
  }

  return data;
}
