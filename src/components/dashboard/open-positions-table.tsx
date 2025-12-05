"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { type BreakdownHoldingDto } from "@/lib/api";
import { SymbolLogo } from "./symbol-logo";

interface OpenPositionsTableProps {
  holdings: BreakdownHoldingDto[];
  className?: string;
}

export function OpenPositionsTable({ holdings, className }: OpenPositionsTableProps) {
  // Filter to only open positions and sort by market value
  const openPositions = React.useMemo(() => {
    return holdings
      .filter((h) => h.status === "open" && h.marketValue > 0)
      .sort((a, b) => b.marketValue - a.marketValue);
  }, [holdings]);

  if (openPositions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className={className}
      >
        <Card className="border-border/50 bg-card shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-heading-sm">Open Positions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <TrendingUp className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No open positions</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={className}
    >
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-heading-sm">Open Positions</CardTitle>
          <Link 
            href="/holdings" 
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            View All
            <ExternalLink className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-tertiary/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openPositions.map((holding, index) => {
                  const isPositive = holding.unrealizedPnl >= 0;
                  const pnlPercent = holding.totalCostBasis > 0 
                    ? (holding.unrealizedPnl / holding.totalCostBasis) * 100 
                    : 0;

                  return (
                    <motion.tr
                      key={holding.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="group hover:bg-tertiary/50 transition-colors"
                    >
                      {/* Symbol */}
                      <td className="px-4 py-3">
                        <Link href={`/holdings/${encodeURIComponent(holding.symbol)}`} className="flex items-center gap-3 group/link">
                          <SymbolLogo symbol={holding.symbol} size="sm" className="h-8 w-8" />
                          <div>
                            <p className="font-medium group-hover/link:text-primary transition-colors">
                              {holding.symbol}
                            </p>
                            {holding.companyName && (
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[120px]">
                                {holding.companyName}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 text-right text-sm">
                        {holding.quantity.toLocaleString()}
                      </td>

                      {/* Current Price */}
                      <td className="px-4 py-3 text-right text-sm">
                        {formatCurrency(holding.currentPrice)}
                      </td>

                      {/* Market Value */}
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {formatCurrency(holding.marketValue)}
                      </td>

                      {/* P&L */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isPositive ? "text-success" : "text-destructive"
                            )}
                          >
                            {isPositive ? "+" : ""}{formatCurrency(holding.unrealizedPnl)}
                          </span>
                          <span
                            className={cn(
                              "text-xs flex items-center gap-0.5",
                              isPositive ? "text-success/70" : "text-destructive/70"
                            )}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatPercentage(Math.abs(pnlPercent))}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

