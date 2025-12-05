"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Loader2,
  Activity,
  Coins,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { portfoliosApi, type BreakdownHoldingDto, type HoldingTransactionsResponseDto } from "@/lib/api";
import { SymbolLogo } from "./symbol-logo";

interface HoldingsTableProps {
  holdings: BreakdownHoldingDto[];
  portfolioId?: string;
  isLoading?: boolean;
}

type SortField = "symbol" | "quantity" | "avgCostBasis" | "currentPrice" | "realizedPnl" | "unrealizedPnl" | "unrealizedPnlPercent" | "totalDividends" | "marketValue";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "open" | "closed";

const statusConfig = {
  open: { label: "OPEN", color: "bg-success/15 text-success" },
  closed: { label: "CLOSED", color: "bg-muted-foreground/15 text-muted-foreground" },
  short: { label: "SHORT", color: "bg-destructive/15 text-destructive" },
};

export function HoldingsTable({ holdings, portfolioId, isLoading }: HoldingsTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("marketValue");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [transactionsCache, setTransactionsCache] = React.useState<Record<string, HoldingTransactionsResponseDto>>({});
  const [loadingTransactions, setLoadingTransactions] = React.useState<string | null>(null);
  const [pageSize, setPageSize] = React.useState<number | "all">(10);

  const pageSizeOptions: (number | "all")[] = [10, 25, 50, "all"];

  // Fetch transactions when row is expanded
  const handleRowExpand = async (holdingId: string, symbol: string) => {
    const newExpandedRow = expandedRow === holdingId ? null : holdingId;
    setExpandedRow(newExpandedRow);

    // Fetch transactions if expanding and not already cached (cache by symbol)
    if (newExpandedRow && !transactionsCache[symbol] && portfolioId) {
      setLoadingTransactions(holdingId);
      try {
        const txns = await portfoliosApi.getHoldingTransactions(portfolioId, symbol);
        setTransactionsCache((prev) => ({ ...prev, [symbol]: txns }));
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoadingTransactions(null);
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredHoldings = React.useMemo(() => {
    return holdings.filter((h) => {
      if (statusFilter === "all") return true;
      return h.status === statusFilter;
    });
  }, [holdings, statusFilter]);

  const sortedHoldings = React.useMemo(() => {
    return [...filteredHoldings].sort((a, b) => {
      let comparison = 0;

      const getUnrealizedPnlPercent = (h: BreakdownHoldingDto) => 
        h.totalCostBasis > 0 ? (h.unrealizedPnl / h.totalCostBasis) * 100 : 0;

      switch (sortField) {
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "avgCostBasis":
          comparison = a.avgCostBasis - b.avgCostBasis;
          break;
        case "currentPrice":
          comparison = a.currentPrice - b.currentPrice;
          break;
        case "realizedPnl":
          comparison = a.realizedPnl - b.realizedPnl;
          break;
        case "unrealizedPnl":
          comparison = a.unrealizedPnl - b.unrealizedPnl;
          break;
        case "unrealizedPnlPercent":
          comparison = getUnrealizedPnlPercent(a) - getUnrealizedPnlPercent(b);
          break;
        case "totalDividends":
          comparison = a.totalDividends - b.totalDividends;
          break;
        case "marketValue":
          comparison = a.marketValue - b.marketValue;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredHoldings, sortField, sortDirection]);

  const totalPages = pageSize === "all" ? 1 : Math.ceil(sortedHoldings.length / pageSize);
  const paginatedHoldings = pageSize === "all" 
    ? sortedHoldings 
    : sortedHoldings.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: number | "all") => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    const result = filteredHoldings.reduce(
      (acc, h) => ({
        marketValue: acc.marketValue + h.marketValue,
        realizedPnl: acc.realizedPnl + h.realizedPnl,
        unrealizedPnl: acc.unrealizedPnl + h.unrealizedPnl,
        totalDividends: acc.totalDividends + h.totalDividends,
        totalCostBasis: acc.totalCostBasis + h.totalCostBasis,
      }),
      { marketValue: 0, realizedPnl: 0, unrealizedPnl: 0, totalDividends: 0, totalCostBasis: 0 }
    );
    return {
      ...result,
      unrealizedPnlPercent: result.totalCostBasis > 0 
        ? (result.unrealizedPnl / result.totalCostBasis) * 100 
        : 0,
    };
  }, [filteredHoldings]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  const PnlCell = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    return (
      <span
        className={cn(
          "font-medium",
          isNeutral
            ? "text-muted-foreground"
            : isPositive
            ? "text-success"
            : "text-destructive"
        )}
      >
        {isPositive ? "+" : ""}
        {formatCurrency(value)}
      </span>
    );
  };

  return (
    <Card className="border-border/50 shadow-card">
      <CardContent className="p-0">
        {/* Filters */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-1 rounded-lg bg-tertiary p-1">
              {(["all", "open", "closed"] as StatusFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setStatusFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-all duration-200",
                    statusFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredHoldings.length} position{filteredHoldings.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-tertiary/30">
                <th className="w-10 px-4 py-3"></th>
                <th
                  className="group cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center gap-1">
                    Symbol
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("quantity")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Qty
                    <SortIcon field="quantity" />
                  </div>
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("avgCostBasis")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Avg Cost
                    <SortIcon field="avgCostBasis" />
                  </div>
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("currentPrice")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Current
                    <SortIcon field="currentPrice" />
                  </div>
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("realizedPnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Realized
                    <SortIcon field="realizedPnl" />
                  </div>
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("unrealizedPnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Unrealized
                    <SortIcon field="unrealizedPnl" />
                  </div>
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("unrealizedPnlPercent")}
                >
                  <div className="flex items-center justify-end gap-1">
                    P&L %
                    <SortIcon field="unrealizedPnlPercent" />
                  </div>
                </th>
                <th
                  className="group cursor-pointer px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("totalDividends")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Dividends
                    <SortIcon field="totalDividends" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedHoldings.map((holding, index) => {
                const isExpanded = expandedRow === holding.id;
                const status = statusConfig[holding.status];

                return (
                  <React.Fragment key={holding.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={cn(
                        "group cursor-pointer transition-colors",
                        isExpanded ? "bg-tertiary" : "hover:bg-tertiary/50"
                      )}
                      onClick={() => handleRowExpand(holding.id, holding.symbol)}
                    >
                      {/* Expand Icon */}
                      <td className="px-4 py-4">
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </td>

                      {/* Symbol */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <SymbolLogo symbol={holding.symbol} size="sm" />
                          <div>
                            <p className="font-semibold">{holding.symbol}</p>
                            {holding.companyName && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {holding.companyName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge className={cn("gap-1", status.color)}>
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              holding.status === "open"
                                ? "bg-success"
                                : holding.status === "closed"
                                ? "bg-muted-foreground"
                                : "bg-destructive"
                            )}
                          />
                          {status.label}
                        </Badge>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-4 text-right font-medium">
                        {holding.quantity > 0 ? holding.quantity.toLocaleString() : "—"}
                      </td>

                      {/* Avg Cost */}
                      <td className="px-4 py-4 text-right">
                        {holding.status !== "closed" ? formatCurrency(holding.avgCostBasis) : "—"}
                      </td>

                      {/* Current Price */}
                      <td className="px-4 py-4 text-right">
                        {holding.status !== "closed" ? formatCurrency(holding.currentPrice) : "—"}
                      </td>

                      {/* Realized P&L */}
                      <td className="px-4 py-4 text-right">
                        <PnlCell value={holding.realizedPnl} />
                      </td>

                      {/* Unrealized P&L */}
                      <td className="px-4 py-4 text-right">
                        {holding.status !== "closed" ? (
                          <PnlCell value={holding.unrealizedPnl} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* P&L % */}
                      <td className="px-4 py-4 text-right">
                        {holding.status !== "closed" && holding.totalCostBasis > 0 ? (
                          (() => {
                            const pnlPercent = (holding.unrealizedPnl / holding.totalCostBasis) * 100;
                            const isPositive = pnlPercent > 0;
                            const isNeutral = pnlPercent === 0;
                            return (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 font-medium text-xs",
                                  isNeutral
                                    ? "text-muted-foreground"
                                    : isPositive
                                    ? "text-success"
                                    : "text-destructive"
                                )}
                              >
                                {!isNeutral && (
                                  isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )
                                )}
                                {isPositive ? "+" : ""}
                                {pnlPercent.toFixed(1)}%
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Dividends */}
                      <td className="px-4 py-4 text-right">
                        {holding.totalDividends > 0 ? (
                          <span className="text-success">
                            {formatCurrency(holding.totalDividends)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">$0</span>
                        )}
                      </td>

                    </motion.tr>

                    {/* Expanded Row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={11} className="bg-card p-0">
                            <div className="border-t border-border p-6">
                              {/* Header with View Full Details button */}
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

                              {/* Quick Stats */}
                              <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-lg border border-border p-4">
                                  <p className="text-xs text-muted-foreground">
                                    Total Cost Basis
                                  </p>
                                  <p className="mt-1 text-lg font-semibold">
                                    {formatCurrency(holding.totalCostBasis)}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-border p-4">
                                  <p className="text-xs text-muted-foreground">
                                    Market Value
                                  </p>
                                  <p className="mt-1 text-lg font-semibold">
                                    {formatCurrency(holding.marketValue)}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-border p-4">
                                  <p className="text-xs text-muted-foreground">
                                    Total P&L
                                  </p>
                                  <p
                                    className={cn(
                                      "mt-1 text-lg font-semibold",
                                      holding.totalPnl >= 0
                                        ? "text-success"
                                        : "text-destructive"
                                    )}
                                  >
                                    {holding.totalPnl >= 0 ? "+" : ""}
                                    {formatCurrency(holding.totalPnl)}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-border p-4">
                                  <p className="text-xs text-muted-foreground">
                                    Dividends
                                  </p>
                                  <p className="mt-1 text-lg font-semibold text-success">
                                    +{formatCurrency(holding.totalDividends)}
                                  </p>
                                </div>
                              </div>

                              {/* Trading Activity Summary */}
                              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-success" />
                                  <span>Quantity: {holding.quantity.toLocaleString()} shares</span>
                                </div>
                                <div>
                                  <span>Portfolio: {holding.percentOfPortfolio.toFixed(1)}%</span>
                                </div>
                              </div>

                              {/* Transaction Preview */}
                              <div className="mt-6 border-t border-border pt-4">
                                <h5 className="text-sm font-medium text-muted-foreground mb-3">
                                  Recent Transactions
                                </h5>

                                {loadingTransactions === holding.id ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading transactions...</span>
                                  </div>
                                ) : transactionsCache[holding.symbol] ? (
                                  <div className="space-y-3">
                                    {/* Transaction Stats */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                      <div className="flex items-center gap-2 rounded-lg bg-tertiary px-3 py-1.5">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <span>{transactionsCache[holding.symbol].trades.length} trades</span>
                                      </div>
                                      <div className="flex items-center gap-2 rounded-lg bg-tertiary px-3 py-1.5">
                                        <Coins className="h-4 w-4 text-success" />
                                        <span>{transactionsCache[holding.symbol].dividends.length} dividends</span>
                                      </div>
                                      <div className="flex items-center gap-2 rounded-lg bg-tertiary px-3 py-1.5">
                                        <Layers className="h-4 w-4 text-warning" />
                                        <span>{transactionsCache[holding.symbol].optionTrades.length} options</span>
                                      </div>
                                    </div>

                                    {/* Recent Trades Preview (max 3) */}
                                    {transactionsCache[holding.symbol].trades.length > 0 && (
                                      <div className="rounded-lg border border-border overflow-hidden">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="bg-tertiary/50">
                                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Price</th>
                                              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-border">
                                            {transactionsCache[holding.symbol].trades
                                              .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
                                              .slice(0, 3)
                                              .map((trade) => (
                                                <tr key={trade.id} className="hover:bg-tertiary/30">
                                                  <td className="px-3 py-2">{formatDate(trade.executedAt)}</td>
                                                  <td className="px-3 py-2">
                                                    <Badge variant={trade.type === "buy" ? "success" : "destructive"} className="text-xs">
                                                      {trade.type.toUpperCase()}
                                                    </Badge>
                                                  </td>
                                                  <td className="px-3 py-2 text-right">{trade.quantity.toLocaleString()}</td>
                                                  <td className="px-3 py-2 text-right">{formatCurrency(trade.price)}</td>
                                                  <td className="px-3 py-2 text-right font-medium">{formatCurrency(trade.amount)}</td>
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                        {transactionsCache[holding.symbol].trades.length > 3 && (
                                          <div className="px-3 py-2 text-xs text-muted-foreground bg-tertiary/30 border-t border-border">
                                            +{transactionsCache[holding.symbol].trades.length - 3} more trades
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Unable to load transactions
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}

              {/* Totals Row */}
              {filteredHoldings.length > 0 && (
                <tr className="border-t-2 border-border bg-tertiary/50 font-semibold">
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4">TOTALS</td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4 text-right">
                    <PnlCell value={totals.realizedPnl} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <PnlCell value={totals.unrealizedPnl} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium text-xs",
                        totals.unrealizedPnlPercent === 0
                          ? "text-muted-foreground"
                          : totals.unrealizedPnlPercent > 0
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {totals.unrealizedPnlPercent !== 0 && (
                        totals.unrealizedPnlPercent > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )
                      )}
                      {totals.unrealizedPnlPercent > 0 ? "+" : ""}
                      {totals.unrealizedPnlPercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-success">
                      {formatCurrency(totals.totalDividends)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredHoldings.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No holdings found</p>
            <p className="text-sm text-muted-foreground">
              {statusFilter !== "all"
                ? `No ${statusFilter} positions in your portfolio`
                : "Upload a broker report to see your holdings"}
            </p>
          </div>
        )}

        {/* Pagination & Page Size */}
        {sortedHoldings.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Show:</span>
              <div className="flex gap-1 rounded-lg bg-tertiary p-1">
                {pageSizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                      pageSize === size
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {size === "all" ? "All" : size}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-muted-foreground">
              {pageSize === "all" ? (
                <>Showing all {sortedHoldings.length} holdings</>
              ) : (
                <>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, sortedHoldings.length)} of{" "}
                  {sortedHoldings.length}
                </>
              )}
            </span>

            {totalPages > 1 && pageSize !== "all" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

