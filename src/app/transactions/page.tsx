"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Download,
  Search,
  RefreshCw,
  Briefcase,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Receipt,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { SymbolLogo } from "@/components/dashboard";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  tradesApi,
  reportsApi,
  type TradeResponseDto,
} from "@/lib/api";
import { usePortfolio } from "@/providers";

type TransactionType = "all" | "buy" | "sell";
type SortField = "date" | "symbol" | "quantity" | "price" | "amount";
type SortDirection = "asc" | "desc";

export default function TransactionsPage() {
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const [trades, setTrades] = React.useState<TradeResponseDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<TransactionType>("all");
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  // Fetch transactions using tradesApi
  const fetchTransactions = React.useCallback(async () => {
    if (!activePortfolio) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check for reports
      const reportsResponse = await reportsApi.list(activePortfolio.id);
      if (reportsResponse.total === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch all trades for the portfolio
      const tradesResponse = await tradesApi.list(activePortfolio.id);
      setTrades(tradesResponse.trades);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [activePortfolio]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter and sort trades
  const filteredTrades = React.useMemo(() => {
    let result = [...trades];

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime();
          break;
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [trades, searchQuery, typeFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / pageSize);
  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Stats
  const stats = React.useMemo(() => {
    const buyTrades = trades.filter((t) => t.type === "buy");
    const sellTrades = trades.filter((t) => t.type === "sell");

    return {
      total: trades.length,
      buys: buyTrades.length,
      sells: sellTrades.length,
      totalBought: buyTrades.reduce((sum, t) => sum + t.amount, 0),
      totalSold: sellTrades.reduce((sum, t) => sum + t.amount, 0),
      totalCommissions: trades.reduce((sum, t) => sum + (t.commission || 0), 0),
    };
  }, [trades]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Export CSV
  const handleExport = () => {
    if (filteredTrades.length === 0) return;

    const headers = ["Date", "Type", "Symbol", "Quantity", "Price", "Amount", "Commission"];
    const rows = filteredTrades.map((t) => [
      formatDate(t.executedAt),
      t.type.toUpperCase(),
      t.symbol,
      t.quantity,
      t.price,
      t.amount,
      t.commission || 0,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show loading if portfolio is loading
  if (isPortfolioLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no portfolio
  if (!activePortfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No Portfolio Selected</h2>
          <p className="text-muted-foreground">
            Create a portfolio to view transactions
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Transactions
            </h1>
            <p className="mt-1 text-muted-foreground">
              View all your trading activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchTransactions}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredTrades.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Total Trades",
              value: stats.total.toString(),
              subtext: `${stats.buys} buys, ${stats.sells} sells`,
              icon: Receipt,
            },
            {
              label: "Total Bought",
              value: formatCurrency(stats.totalBought),
              icon: TrendingUp,
              color: "text-success",
            },
            {
              label: "Total Sold",
              value: formatCurrency(stats.totalSold),
              icon: TrendingDown,
              color: "text-destructive",
            },
            {
              label: "Commissions Paid",
              value: formatCurrency(stats.totalCommissions),
              icon: Receipt,
              color: "text-muted-foreground",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className={cn("mt-1 text-2xl font-bold", stat.color)}>
                    {isLoading ? "—" : stat.value}
                  </p>
                  {stat.subtext && (
                    <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by symbol..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex gap-1 rounded-lg bg-tertiary p-1">
            {(["all", "buy", "sell"] as TransactionType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTypeFilter(type);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  typeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "All" : type === "buy" ? "Buys" : "Sells"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-heading-sm flex items-center justify-between">
                <span>All Transactions</span>
                <Badge variant="secondary">{filteredTrades.length} trades</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">No transactions found</p>
                  <p className="text-sm text-muted-foreground">
                    {trades.length === 0
                      ? "Upload broker reports to see your transactions"
                      : "Try adjusting your filters"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-tertiary/30">
                          <th
                            className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            onClick={() => handleSort("date")}
                          >
                            <div className="flex items-center gap-1">
                              Date
                              {sortField === "date" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Type
                          </th>
                          <th
                            className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            onClick={() => handleSort("symbol")}
                          >
                            <div className="flex items-center gap-1">
                              Symbol
                              {sortField === "symbol" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            onClick={() => handleSort("quantity")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              Quantity
                              {sortField === "quantity" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            onClick={() => handleSort("price")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              Price
                              {sortField === "price" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th
                            className="cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            onClick={() => handleSort("amount")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              Amount
                              {sortField === "amount" && (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Commission
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginatedTrades.map((trade, index) => (
                          <motion.tr
                            key={trade.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="transition-colors hover:bg-tertiary/50"
                          >
                            <td className="px-6 py-4 text-sm">
                              {formatDate(trade.executedAt)}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={trade.type === "buy" ? "success" : "destructive"}
                                className="gap-1"
                              >
                                {trade.type === "buy" ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {trade.type.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <SymbolLogo symbol={trade.symbol} size="sm" className="h-8 w-8" />
                                <span className="font-medium">{trade.symbol}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-medium">
                              {trade.quantity.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {formatCurrency(trade.price)}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold">
                              <span
                                className={
                                  trade.type === "buy"
                                    ? "text-destructive"
                                    : "text-success"
                                }
                              >
                                {trade.type === "buy" ? "-" : "+"}
                                {formatCurrency(trade.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-muted-foreground">
                              {trade.commission
                                ? formatCurrency(trade.commission)
                                : "—"}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-6 py-3">
                      <span className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredTrades.length)} of{" "}
                        {filteredTrades.length}
                      </span>
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
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
