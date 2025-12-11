"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Coins,
  Briefcase,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  MetricCard,
  DonutChart,
  TransactionsTable,
  OpenPositionsTable,
  DashboardSkeleton,
} from "@/components/dashboard";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { formatCurrency } from "@/lib/utils";
import { usePortfolio, useAuth } from "@/providers";
import {
  portfoliosApi,
  reportsApi,
  tradesApi,
  type PortfolioBreakdownResponseDto,
  type TradeResponseDto,
} from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const [breakdown, setBreakdown] = React.useState<PortfolioBreakdownResponseDto | null>(null);
  const [trades, setTrades] = React.useState<TradeResponseDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasReports, setHasReports] = React.useState(false);

  // Fetch dashboard data
  const fetchDashboardData = React.useCallback(async () => {
    if (!activePortfolio) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Check for reports
      const reportsResponse = await reportsApi.list(activePortfolio.id);
      setHasReports(reportsResponse.total > 0);

      if (reportsResponse.total === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch all dashboard data in parallel
      const [portfolioBreakdown, tradesResponse] = await Promise.all([
        portfoliosApi.getBreakdown(activePortfolio.id).catch(() => null),
        tradesApi.list(activePortfolio.id).catch(() => ({ trades: [], total: 0, summary: null })),
      ]);

      if (portfolioBreakdown) {
        setBreakdown(portfolioBreakdown);
      }
      
      setTrades(tradesResponse.trades);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activePortfolio]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log("Exporting data...");
  };

  // Calculate metrics from breakdown
  const metrics = React.useMemo(() => {
    if (!breakdown?.holdings || breakdown.holdings.length === 0) {
      return {
        totalValue: 0,
        realizedPL: 0,
        unrealizedPL: 0,
        totalDividends: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
      };
    }

    // Calculate totals from holdings
    const totalValue = breakdown.holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalCostBasis = breakdown.holdings.reduce((sum, h) => sum + h.totalCostBasis, 0);
    const realizedPL = breakdown.holdings.reduce((sum, h) => sum + h.realizedPnl, 0);
    const unrealizedPL = breakdown.holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
    const totalDividends = breakdown.holdings.reduce((sum, h) => sum + h.totalDividends, 0);
    const totalReturn = realizedPL + unrealizedPL;
    const totalReturnPercent = totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0;

    return {
      totalValue,
      realizedPL,
      unrealizedPL,
      totalDividends,
      totalReturn,
      totalReturnPercent,
    };
  }, [breakdown]);

  // Prepare holdings for donut chart
  const holdingsData = React.useMemo(() => {
    if (!breakdown?.holdings) return [];

    const openHoldings = breakdown.holdings
      .filter((h) => h.status === "open" && h.marketValue > 0)
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 5);

    const totalValue = metrics.totalValue;
    const topHoldingsValue = openHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    const otherValue = totalValue - topHoldingsValue;

    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "hsl(var(--muted-foreground))",
    ];

    const data = openHoldings.map((h, i) => ({
      name: h.companyName || h.symbol,
      symbol: h.symbol,
      value: h.marketValue,
      percentage: h.percentOfPortfolio,
      color: colors[i],
    }));

    if (otherValue > 0 && totalValue > 0) {
      data.push({
        name: "Others",
        symbol: "OTHER",
        value: otherValue,
        percentage: (otherValue / totalValue) * 100,
        color: colors[5],
      });
    }

    return data;
  }, [breakdown, metrics.totalValue]);

  // Transform trades for TransactionsTable
  const transactionsData = React.useMemo(() => {
    return trades
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
      .slice(0, 10)
      .map((trade) => ({
        id: trade.id,
        date: new Date(trade.executedAt),
        type: trade.type.toUpperCase() as "BUY" | "SELL",
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        amount: trade.amount,
      }));
  }, [trades]);

  // Show loading if portfolio is loading
  if (isPortfolioLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Show message if no portfolio
  if (!activePortfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold">Welcome to Trade Insight</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              Create your first portfolio to start tracking your investments
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const userName = user?.email?.split("@")[0] || "there";
  const holdingsCount = breakdown?.holdings?.filter((h) => h.status === "open").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          userName={userName}
          holdingsCount={holdingsCount}
          totalValue={metrics.totalValue}
          totalReturn={metrics.totalReturnPercent}
          onExport={handleExport}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* No Data State */}
        {!hasReports && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-8 text-center"
          >
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Data Yet</h3>
            <p className="mt-2 text-muted-foreground">
              Upload your first broker report to see your portfolio analytics
            </p>
            <motion.a
              href="/reports"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Go to Reports
            </motion.a>
          </motion.div>
        )}

        {/* KPI Cards */}
        {(hasReports || breakdown) && (
          <>
            <div className="dashboard-grid">
              <MetricCard
                label="Total Portfolio Value"
                value={metrics.totalValue}
                icon={Wallet}
                delay={1}
              />
              <MetricCard
                label="Realized P&L"
                value={metrics.realizedPL}
                icon={TrendingUp}
                delay={2}
              />
              <MetricCard
                label="Unrealized P&L"
                value={metrics.unrealizedPL}
                icon={DollarSign}
                delay={3}
              />
              <MetricCard
                label="Total Dividends"
                value={metrics.totalDividends}
                icon={Coins}
                delay={4}
              />
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
              {/* Left Column - Portfolio Overview */}
              <div className="space-y-6">
                {/* Holdings Distribution Pie Chart */}
                {holdingsData.length > 0 && (
                  <DonutChart
                    data={holdingsData}
                    centerValue={formatCurrency(metrics.totalValue)}
                  />
                )}

                {/* Latest Trades */}
                <TransactionsTable 
                  transactions={transactionsData} 
                  title="Latest Trades"
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Open Positions Table */}
                {breakdown?.holdings && (
                  <OpenPositionsTable holdings={breakdown.holdings} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
