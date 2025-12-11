"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Coins,
  Receipt,
  Calendar,
  RefreshCw,
  Download,
  ArrowUpDown,
  AlertCircle,
  Layers,
  Activity,
  Briefcase,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { PriceHistoryChart, SymbolLogo } from "@/components/dashboard";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  portfoliosApi,
  type BreakdownHoldingDto,
  type HoldingTransactionsResponseDto,
  type TradeTransactionDto,
  type DividendTransactionDto,
  type LotTransactionDto,
  type CommissionTransactionDto,
  type OptionTradeTransactionDto,
} from "@/lib/api";
import { usePortfolio } from "@/providers";

type TabType = "trades" | "dividends" | "lots" | "commissions" | "options";
type SortOrder = "newest" | "oldest";

export default function HoldingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const symbol = decodeURIComponent(params.symbol as string);

  const [holding, setHolding] = React.useState<BreakdownHoldingDto | null>(null);
  const [transactions, setTransactions] = React.useState<HoldingTransactionsResponseDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabType>("trades");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");

  // Fetch holding data
  React.useEffect(() => {
    if (!activePortfolio) return;

    const fetchHolding = async () => {
      try {
        setIsLoading(true);
        
        // Get portfolio breakdown to find the holding
        const breakdown = await portfoliosApi.getBreakdown(activePortfolio.id);
        const foundHolding = breakdown.holdings.find(
          (h) => h.symbol.toUpperCase() === symbol.toUpperCase()
        );

        if (!foundHolding) {
          setError("Holding not found");
          return;
        }

        setHolding(foundHolding);

        // Fetch transactions
        setIsLoadingTransactions(true);
        try {
          const txns = await portfoliosApi.getHoldingTransactions(activePortfolio.id, foundHolding.symbol);
          setTransactions(txns);
        } catch (txnError) {
          console.error("Failed to fetch transactions:", txnError);
          // Don't set error - transactions are optional
        } finally {
          setIsLoadingTransactions(false);
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Failed to load holding");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolding();
  }, [activePortfolio, symbol]);

  // Sort helper
  const sortByDate = <T extends { executedAt?: string; acquiredAt?: string; payDate?: string }>(
    items: T[]
  ): T[] => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.executedAt || a.payDate || a.acquiredAt || 0).getTime();
      const dateB = new Date(b.executedAt || b.payDate || b.acquiredAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!transactions) return null;

    const totalDividends = transactions.dividends.reduce((sum, d) => sum + d.grossAmount, 0);
    const totalWithholdingTax = transactions.dividends.reduce(
      (sum, d) => sum + (d.taxWithheld ?? 0),
      0
    );
    const totalCommissions = transactions.commissions.reduce((sum, c) => sum + Math.abs(c.amount), 0);
    const totalTradeCommissions = transactions.trades.reduce(
      (sum, t) => sum + (t.commission || 0),
      0
    );

    const lots = transactions.lots ?? [];
    return {
      totalDividends,
      totalWithholdingTax,
      netDividends: totalDividends - totalWithholdingTax,
      totalCommissions: totalCommissions + totalTradeCommissions,
      totalTrades: transactions.trades.length,
      totalLots: lots.length,
      openLots: lots.filter((l) => l.remainingQuantity > 0).length,
      longTermLots: lots.filter((l) => l.isLongTerm).length,
    };
  }, [transactions]);

  // Show loading if portfolio is loading
  if (isPortfolioLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no portfolio
  if (!activePortfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No Portfolio Selected</h2>
          <p className="text-muted-foreground">
            Select a portfolio to view holding details
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !holding) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive">{error || "Holding not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Position Return % = (Current Price - Avg Cost) / Avg Cost
  const positionReturnPercent =
    holding.avgCostBasis > 0
      ? ((holding.currentPrice - holding.avgCostBasis) / holding.avgCostBasis) * 100
      : 0;

  // Total P&L = Realized + Unrealized
  const totalPnl = holding.realizedPnl + holding.unrealizedPnl;
  
  // Commissions from transactions or fallback
  const totalCommissions = totals?.totalCommissions ?? (holding.totalCommissions || 0);
  
  // Net Dividends from transactions or fallback
  const netDividends = totals?.netDividends ?? holding.totalDividends;
  
  // Net Earnings = Total P&L + Dividends - Commissions
  const netEarnings = totalPnl + netDividends - totalCommissions;

  const tabs: { id: TabType; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "trades", label: "Trades", icon: Activity, count: transactions?.trades.length },
    { id: "dividends", label: "Dividends", icon: Coins, count: transactions?.dividends.length },
    { id: "lots", label: "Tax Lots", icon: Layers, count: transactions?.lots?.length },
    { id: "commissions", label: "Commissions", icon: Receipt, count: transactions?.commissions.length },
    { id: "options", label: "Options", icon: BarChart3, count: transactions?.optionTrades.length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <SymbolLogo symbol={holding.symbol} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{holding.symbol}</h1>
                  <Badge
                    className={cn(
                      "gap-1",
                      holding.status === "open"
                        ? "bg-success/15 text-success"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        holding.status === "open" ? "bg-success" : "bg-muted-foreground"
                      )}
                    />
                    {holding.status.toUpperCase()} POSITION
                  </Badge>
                </div>
                {holding.companyName && (
                  <p className="text-muted-foreground">{holding.companyName}</p>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </motion.div>

        {/* Summary Cards - 2 Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Position Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50 shadow-card h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Position Snapshot
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current value of this position
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shares</span>
                  <span className="font-semibold">{holding.quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Cost</span>
                  <span className="font-semibold">{formatCurrency(holding.avgCostBasis)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-semibold">{formatCurrency(holding.currentPrice)}</span>
                </div>
                <div className="border-t border-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cost Basis</span>
                  <span className="font-semibold">{formatCurrency(holding.totalCostBasis)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Value</span>
                  <span className="font-semibold">{formatCurrency(holding.marketValue)}</span>
                </div>
                {holding.quantity > 0 && (
                  <>
                    <div className="border-t border-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Position Return</span>
                      <span
                        className={cn(
                          "text-lg font-bold flex items-center gap-1",
                          positionReturnPercent >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {positionReturnPercent >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {positionReturnPercent >= 0 ? "+" : ""}
                        {positionReturnPercent.toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Net Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-card h-full bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Net Earnings
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Total profit after dividends and fees
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Realized P&L</span>
                  <span
                    className={cn(
                      "font-semibold",
                      holding.realizedPnl >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {holding.realizedPnl >= 0 ? "+" : ""}
                    {formatCurrency(holding.realizedPnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Unrealized P&L</span>
                  <span
                    className={cn(
                      "font-semibold",
                      holding.unrealizedPnl >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {holding.unrealizedPnl >= 0 ? "+" : ""}
                    {formatCurrency(holding.unrealizedPnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Net Dividends</span>
                  <span className="font-semibold text-success">
                    +{formatCurrency(netDividends)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Commissions</span>
                  <span className="font-semibold text-destructive">
                    -{formatCurrency(totalCommissions)}
                  </span>
                </div>
                <div className="border-t-2 border-primary/30 pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Net Earnings</span>
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        netEarnings >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {netEarnings >= 0 ? "+" : ""}
                      {formatCurrency(netEarnings)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Price History Chart */}
        <PriceHistoryChart
          symbol={holding.symbol}
          currentPrice={holding.currentPrice}
          avgCostBasis={holding.quantity > 0 ? holding.avgCostBasis : undefined}
          trades={transactions?.trades}
        />

        {/* Transaction History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Transaction History
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                    className="gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex gap-1 border-b border-border -mx-6 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !transactions ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>Unable to load transaction history</p>
                </div>
              ) : (
                <>
                  {/* Trades Tab */}
                  {activeTab === "trades" && (
                    <TradesTable trades={sortByDate(transactions.trades)} />
                  )}

                  {/* Dividends Tab */}
                  {activeTab === "dividends" && (
                    <DividendsTable
                      dividends={sortByDate(transactions.dividends)}
                      totals={totals}
                    />
                  )}

                  {/* Lots Tab */}
                  {activeTab === "lots" && (
                    <LotsTable lots={sortByDate(transactions.lots ?? [])} totals={totals} />
                  )}

                  {/* Commissions Tab */}
                  {activeTab === "commissions" && (
                    <CommissionsTable
                      commissions={sortByDate(transactions.commissions)}
                      trades={transactions.trades}
                      totals={totals}
                    />
                  )}

                  {/* Options Tab */}
                  {activeTab === "options" && (
                    <OptionsTable options={sortByDate(transactions.optionTrades)} />
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

// Trades Table Component
function TradesTable({ trades }: { trades: TradeTransactionDto[] }) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2" />
        <p>No trades found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-tertiary/30">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Qty
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Commission
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trades.map((trade, index) => (
            <motion.tr
              key={trade.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="hover:bg-tertiary/50 transition-colors"
            >
              <td className="px-6 py-4 text-sm">{formatDate(trade.executedAt)}</td>
              <td className="px-6 py-4">
                <Badge variant={trade.type === "buy" ? "success" : "destructive"} className="gap-1">
                  {trade.type === "buy" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trade.type.toUpperCase()}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                {trade.quantity.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right text-sm">{formatCurrency(trade.price)}</td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                {formatCurrency(trade.amount)}
              </td>
              <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                {trade.commission ? formatCurrency(trade.commission) : "—"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Dividends Table Component
function DividendsTable({
  dividends,
  totals,
}: {
  dividends: DividendTransactionDto[];
  totals: { totalDividends: number; totalWithholdingTax: number; netDividends: number } | null;
}) {
  if (dividends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Coins className="h-8 w-8 mb-2" />
        <p>No dividends received</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      {totals && (
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-tertiary/20">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Dividends</p>
            <p className="text-xl font-bold text-success">+{formatCurrency(totals.totalDividends)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Withholding Tax</p>
            <p className="text-xl font-bold text-destructive">-{formatCurrency(totals.totalWithholdingTax)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Net Dividends</p>
            <p className="text-xl font-bold text-success">+{formatCurrency(totals.netDividends)}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-tertiary/30">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ex-Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tax Withheld
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Net Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dividends.map((dividend, index) => {
              const taxWithheld = dividend.taxWithheld ?? 0;

              return (
                <motion.tr
                  key={dividend.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-tertiary/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm">{formatDate(dividend.payDate)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {dividend.exDate ? formatDate(dividend.exDate) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-success">
                    +{formatCurrency(dividend.grossAmount)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-destructive">
                    {taxWithheld > 0 ? `-${formatCurrency(taxWithheld)}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-success">
                    +{formatCurrency(dividend.netAmount)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Lots Table Component
function LotsTable({
  lots,
  totals,
}: {
  lots: LotTransactionDto[];
  totals: { totalLots: number; openLots: number; longTermLots: number } | null;
}) {
  if (lots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Layers className="h-8 w-8 mb-2" />
        <p>No tax lots found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      {totals && (
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-tertiary/20">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Total Lots</p>
            <p className="text-xl font-bold">{totals.totalLots}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Open Lots</p>
            <p className="text-xl font-bold">{totals.openLots}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Long-Term Holdings</p>
            <p className="text-xl font-bold text-success">{totals.longTermLots}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-tertiary/30">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acquired
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Remaining
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Cost Basis
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Cost
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Realized P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Holding Period
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lots.map((lot, index) => (
              <motion.tr
                key={lot.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-tertiary/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm">{formatDate(lot.acquiredAt)}</td>
                <td className="px-6 py-4">
                  <Badge
                    variant={lot.remainingQuantity > 0 ? "success" : "secondary"}
                    className="gap-1"
                  >
                    {lot.remainingQuantity > 0 ? "Open" : "Closed"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {lot.quantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {lot.remainingQuantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-sm">{formatCurrency(lot.costBasis)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {formatCurrency(lot.totalCost)}
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {lot.realizedPnl !== 0 ? (
                    <span
                      className={cn(
                        "font-medium",
                        lot.realizedPnl >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {lot.realizedPnl >= 0 ? "+" : ""}
                      {formatCurrency(lot.realizedPnl)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {lot.holdingPeriodDays !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {lot.holdingPeriodDays} days
                      </span>
                    )}
                    {lot.isLongTerm ? (
                      <Badge variant="success" className="text-xs">
                        Long-Term
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs">
                        Short-Term
                      </Badge>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Commissions Table Component
function CommissionsTable({
  commissions,
  trades,
  totals,
}: {
  commissions: CommissionTransactionDto[];
  trades: TradeTransactionDto[];
  totals: { totalCommissions: number } | null;
}) {
  // Combine standalone commissions with trade commissions
  const allCommissions = [
    ...commissions.map((c) => ({
      id: c.id,
      date: c.executedAt,
      type: "Commission",
      amount: c.amount,
      description: c.description,
    })),
    ...trades
      .filter((t) => t.commission && t.commission > 0)
      .map((t) => ({
        id: `trade-${t.id}`,
        date: t.executedAt,
        type: `Trade Commission (${t.type.toUpperCase()})`,
        amount: t.commission!,
        description: `${t.quantity} shares @ ${formatCurrency(t.price)}`,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allCommissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Receipt className="h-8 w-8 mb-2" />
        <p>No commissions paid</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      {totals && (
        <div className="p-6 border-b border-border bg-tertiary/20">
          <p className="text-xs text-muted-foreground uppercase">Total Commissions Paid</p>
          <p className="text-xl font-bold text-destructive">-{formatCurrency(totals.totalCommissions)}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-tertiary/30">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allCommissions.map((commission, index) => (
              <motion.tr
                key={commission.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-tertiary/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm">{formatDate(commission.date)}</td>
                <td className="px-6 py-4 text-sm">{commission.type}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {commission.description || "—"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-destructive">
                  -{formatCurrency(Math.abs(commission.amount))}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Options Table Component
function OptionsTable({ options }: { options: OptionTradeTransactionDto[] }) {
  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <BarChart3 className="h-8 w-8 mb-2" />
        <p>No option trades found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-tertiary/30">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contract
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Action
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Qty
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Premium
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Commission
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {options.map((option, index) => (
            <motion.tr
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="hover:bg-tertiary/50 transition-colors"
            >
              <td className="px-6 py-4 text-sm">{formatDate(option.executedAt)}</td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{option.symbol}</p>
                  <p className="text-xs text-muted-foreground">
                    ${option.strike}{" "}
                    <span className={option.optionType === "call" ? "text-success" : "text-destructive"}>
                      {option.optionType.toUpperCase()}
                    </span>{" "}
                    exp {formatDate(option.expirationDate)}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    option.action === "buy"
                      ? "success"
                      : option.action === "sell"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {option.action.toUpperCase()}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium">{option.quantity}</td>
              <td className="px-6 py-4 text-right text-sm">{formatCurrency(option.price)}</td>
              <td className="px-6 py-4 text-right text-sm font-medium">
                <span
                  className={cn(
                    option.action === "sell" ? "text-success" : "text-destructive"
                  )}
                >
                  {option.action === "sell" ? "+" : "-"}
                  {formatCurrency(Math.abs(option.premium))}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                {option.commission ? formatCurrency(option.commission) : "—"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

