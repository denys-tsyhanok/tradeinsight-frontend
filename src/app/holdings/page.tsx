"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Wallet,
  BarChart3,
  Coins,
  FileText,
  Briefcase,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  Button,
  Input,
} from "@/components/ui";
import { HoldingsTable } from "@/components/dashboard/holdings-table";
import { MetricCard } from "@/components/dashboard";
import { formatCurrency } from "@/lib/utils";
import {
  portfoliosApi,
  reportsApi,
  type PortfolioBreakdownResponseDto,
  type BreakdownHoldingDto,
} from "@/lib/api";
import { usePortfolio } from "@/providers";

export default function HoldingsPage() {
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const [breakdown, setBreakdown] = React.useState<PortfolioBreakdownResponseDto | null>(null);
  const [holdings, setHoldings] = React.useState<BreakdownHoldingDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [hasReports, setHasReports] = React.useState(false);

  // Fetch portfolio breakdown (holdings are calculated automatically when reports are uploaded)
  const fetchHoldings = React.useCallback(async () => {
    if (!activePortfolio) return;

    try {
      setIsLoading(true);
      setError(null);

      // First check if user has any reports
      const reportsResponse = await reportsApi.list(activePortfolio.id);
      setHasReports(reportsResponse.total > 0);

      if (reportsResponse.total === 0) {
        setIsLoading(false);
        return;
      }

      // Get portfolio breakdown
      try {
        const portfolioBreakdown = await portfoliosApi.getBreakdown(activePortfolio.id);
        setBreakdown(portfolioBreakdown);
        setHoldings(portfolioBreakdown.holdings || []);
      } catch {
        // No breakdown available yet - reports may still be processing
        console.log("No portfolio breakdown available yet");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to fetch holdings");
    } finally {
      setIsLoading(false);
    }
  }, [activePortfolio]);

  React.useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  // Filter holdings by search
  const filteredHoldings = React.useMemo(() => {
    if (!searchQuery) return holdings;
    return holdings.filter(
      (h) =>
        h.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [holdings, searchQuery]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const openPositions = holdings.filter((h) => h.status === "open");
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalRealizedPnl = holdings.reduce((sum, h) => sum + h.realizedPnl, 0);
    const totalUnrealizedPnl = holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
    const totalDividends = holdings.reduce((sum, h) => sum + h.totalDividends, 0);
    const totalCostBasis = holdings.reduce((sum, h) => sum + h.totalCostBasis, 0);
    const totalReturn = totalRealizedPnl + totalUnrealizedPnl;
    const totalReturnPercent = totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0;

    return {
      totalPositions: openPositions.length,
      totalValue,
      totalRealizedPnl,
      totalUnrealizedPnl,
      totalDividends,
      totalReturn,
      totalReturnPercent,
    };
  }, [holdings]);


  // Export to CSV
  const handleExport = () => {
    if (holdings.length === 0) return;

    const headers = [
      "Symbol",
      "Company",
      "Status",
      "Quantity",
      "Avg Cost",
      "Current Price",
      "Market Value",
      "Realized P&L",
      "Unrealized P&L",
      "Dividends",
      "Total P&L",
    ];

    const rows = holdings.map((h) => [
      h.symbol,
      h.companyName || "",
      h.status,
      h.quantity,
      h.avgCostBasis,
      h.currentPrice,
      h.marketValue,
      h.realizedPnl,
      h.unrealizedPnl,
      h.totalDividends,
      h.totalPnl,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `holdings-${new Date().toISOString().split("T")[0]}.csv`;
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
            Create a portfolio to start tracking holdings
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
              All Holdings
            </h1>
            <p className="mt-1 text-muted-foreground">
              {stats.totalPositions} Active Positions • {formatCurrency(stats.totalValue)} Total Value
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchHoldings}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={holdings.length === 0}
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

        {/* No Reports State */}
        {!isLoading && !hasReports && (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Reports Yet</h3>
              <p className="mt-1 text-center text-muted-foreground">
                Upload a broker report to analyze your holdings
              </p>
              <Button className="mt-4" asChild>
                <a href="/reports">Go to Reports</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Holdings State */}
        {!isLoading && hasReports && !breakdown && (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Holdings Processing</h3>
              <p className="mt-1 text-center text-muted-foreground">
                Your portfolio holdings are being calculated. This happens automatically when reports are uploaded.
              </p>
              <Button
                className="mt-4"
                onClick={fetchHoldings}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Refresh"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {(isLoading || (hasReports && breakdown)) && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                label="Total Value"
                value={stats.totalValue}
                icon={Wallet}
                delay={1}
              />
              <MetricCard
                label="Realized P&L"
                value={stats.totalRealizedPnl}
                change={stats.totalRealizedPnl > 0 ? undefined : undefined}
                icon={TrendingUp}
                delay={2}
              />
              <MetricCard
                label="Unrealized P&L"
                value={stats.totalUnrealizedPnl}
                icon={BarChart3}
                delay={3}
              />
              <MetricCard
                label="Total Dividends"
                value={stats.totalDividends}
                icon={Coins}
                delay={4}
              />
            </div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search holdings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </motion.div>

            {/* Holdings Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <HoldingsTable 
                holdings={filteredHoldings} 
                portfolioId={activePortfolio.id}
                isLoading={isLoading} 
              />
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
