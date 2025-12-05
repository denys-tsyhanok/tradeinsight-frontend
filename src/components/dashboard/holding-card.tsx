"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Sparkline } from "./sparkline";
import { SymbolLogo } from "./symbol-logo";

interface HoldingCardProps {
  symbol: string;
  companyName: string;
  quantity: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  priceHistory?: number[];
  className?: string;
  delay?: number;
}

export function HoldingCard({
  symbol,
  companyName,
  quantity,
  currentPrice,
  change,
  changePercent,
  priceHistory,
  className,
  delay = 0,
}: HoldingCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "group flex items-center justify-between rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-tertiary",
        className
      )}
    >
      {/* Left: Symbol & Company */}
      <div className="flex items-center gap-4">
        <SymbolLogo symbol={symbol} size="md" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{symbol}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {quantity} shares
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </div>
      </div>

      {/* Center: Mini Chart */}
      {priceHistory && priceHistory.length > 0 && (
        <div className="hidden w-20 md:block">
          <Sparkline
            data={priceHistory}
            color={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
            height={32}
          />
        </div>
      )}

      {/* Right: Price & Change */}
      <div className="text-right">
        <p className="text-lg font-semibold">{formatCurrency(currentPrice)}</p>
        <div className="flex items-center justify-end gap-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(change)} ({formatPercentage(Math.abs(changePercent))})
          </span>
        </div>
      </div>
    </motion.div>
  );
}

