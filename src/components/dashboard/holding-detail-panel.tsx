"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ExternalLink, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, Badge } from "@/components/ui";
import type { BreakdownHoldingDto } from "@/lib/api";
import { SymbolLogo } from "./symbol-logo";

interface HoldingDetailPanelProps {
  holding: BreakdownHoldingDto;
}

export function HoldingDetailPanel({ holding }: HoldingDetailPanelProps) {
  const totalPnlPercent = holding.totalCostBasis > 0 
    ? ((holding.totalPnl / holding.totalCostBasis) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-border bg-card"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SymbolLogo symbol={holding.symbol} size="sm" className="h-10 w-10" />
            <div>
              <h4 className="font-semibold">{holding.symbol}</h4>
              {holding.companyName && (
                <p className="text-sm text-muted-foreground">{holding.companyName}</p>
              )}
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/holdings/${encodeURIComponent(holding.symbol)}`}>
              View Full Details
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Position Summary */}
          <div className="rounded-lg border border-border p-4">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Position Summary
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{holding.quantity.toLocaleString()} shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Cost</span>
                <span className="font-medium">{formatCurrency(holding.avgCostBasis)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Price</span>
                <span className="font-medium">{formatCurrency(holding.currentPrice)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Market Value</span>
                <span className="font-semibold">{formatCurrency(holding.marketValue)}</span>
              </div>
            </div>
          </div>

          {/* Profit & Loss */}
          <div className="rounded-lg border border-border p-4">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Profit & Loss
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Realized P&L</span>
                <span className={cn(
                  "font-medium",
                  holding.realizedPnl >= 0 ? "text-success" : "text-destructive"
                )}>
                  {holding.realizedPnl >= 0 ? "+" : ""}{formatCurrency(holding.realizedPnl)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unrealized P&L</span>
                <span className={cn(
                  "font-medium",
                  holding.unrealizedPnl >= 0 ? "text-success" : "text-destructive"
                )}>
                  {holding.unrealizedPnl >= 0 ? "+" : ""}{formatCurrency(holding.unrealizedPnl)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Total P&L</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold",
                    holding.totalPnl >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {holding.totalPnl >= 0 ? "+" : ""}{formatCurrency(holding.totalPnl)}
                  </span>
                  <Badge 
                    variant={holding.totalPnl >= 0 ? "success" : "destructive"}
                    className="text-[10px] px-1.5"
                  >
                    {totalPnlPercent >= 0 ? "+" : ""}{totalPnlPercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="rounded-lg border border-border p-4">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Income
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dividends</span>
                <span className={cn(
                  "font-medium",
                  holding.totalDividends > 0 ? "text-success" : ""
                )}>
                  {holding.totalDividends > 0 ? "+" : ""}{formatCurrency(holding.totalDividends)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Net Income</span>
                <span className="font-semibold text-success">
                  {formatCurrency(holding.totalDividends)}
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Weight */}
          <div className="rounded-lg border border-border p-4">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Portfolio
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">
                  {holding.percentOfPortfolio.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Asset Class</span>
                <span className="font-semibold">
                  {holding.assetClass}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Activity Summary */}
        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span>Quantity: {holding.quantity.toLocaleString()} shares</span>
          </div>
          <div>
            <span>Portfolio: {holding.percentOfPortfolio.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

