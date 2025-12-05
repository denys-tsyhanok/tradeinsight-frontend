"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Filter } from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Sparkline } from "./sparkline";
import { SymbolLogo } from "./symbol-logo";

interface MarketMover {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  priceHistory: number[];
}

interface MarketMoversProps {
  movers: MarketMover[];
  title?: string;
  className?: string;
}

type FilterType = "all" | "gainers" | "losers";

export function MarketMovers({
  movers,
  title = "Today's Market Movers",
  className,
}: MarketMoversProps) {
  const [filter, setFilter] = React.useState<FilterType>("all");

  const filteredMovers = React.useMemo(() => {
    switch (filter) {
      case "gainers":
        return movers.filter((m) => m.change >= 0).sort((a, b) => b.changePercent - a.changePercent);
      case "losers":
        return movers.filter((m) => m.change < 0).sort((a, b) => a.changePercent - b.changePercent);
      default:
        return movers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    }
  }, [movers, filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={className}
    >
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-heading-sm">{title}</CardTitle>
          <div className="flex gap-1 rounded-lg bg-tertiary p-1">
            {(["all", "gainers", "losers"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all duration-200",
                  filter === f
                    ? f === "gainers"
                      ? "bg-success/20 text-success"
                      : f === "losers"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f === "gainers" && <TrendingUp className="h-3 w-3" />}
                {f === "losers" && <TrendingDown className="h-3 w-3" />}
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {filteredMovers.slice(0, 6).map((mover, index) => {
            const isPositive = mover.change >= 0;

            return (
              <motion.div
                key={mover.symbol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group flex items-center justify-between rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-border hover:bg-tertiary"
              >
                {/* Symbol & Name */}
                <div className="flex items-center gap-3">
                  <SymbolLogo symbol={mover.symbol} size="sm" className="h-10 w-10" />
                  <div>
                    <p className="font-semibold">{mover.symbol}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {mover.companyName}
                    </p>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="hidden w-20 lg:block">
                  <Sparkline
                    data={mover.priceHistory}
                    color={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                    height={32}
                  />
                </div>

                {/* Price & Change */}
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(mover.price)}</p>
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isPositive ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatPercentage(mover.changePercent)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}

