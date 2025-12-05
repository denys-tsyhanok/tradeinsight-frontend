"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Calendar,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Search,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
} from "@/components/ui";
import { MetricCard } from "@/components/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  dividendsApi,
  type DividendResponseDto,
  type DividendSummaryDto,
} from "@/lib/api";
import { usePortfolio } from "@/providers";

export default function DividendsPage() {
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const [dividends, setDividends] = React.useState<DividendResponseDto[]>([]);
  const [summary, setSummary] = React.useState<DividendSummaryDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Fetch dividends
  const fetchDividends = React.useCallback(async () => {
    if (!activePortfolio) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await dividendsApi.list(activePortfolio.id);
      setDividends(response.dividends);
      setSummary(response.summary);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to fetch dividends");
    } finally {
      setIsLoading(false);
    }
  }, [activePortfolio]);

  React.useEffect(() => {
    fetchDividends();
  }, [fetchDividends]);

  // Filter dividends by search
  const filteredDividends = React.useMemo(() => {
    if (!searchQuery) return dividends;
    return dividends.filter(
      (d) =>
        d.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [dividends, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredDividends.length / pageSize);
  const paginatedDividends = filteredDividends.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


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
            Create a portfolio to start tracking dividends
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
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dividends</h1>
            <p className="mt-1 text-muted-foreground">
              Track your dividend income and upcoming payments
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDividends}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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

        {/* KPI Cards */}
        <div className="dashboard-grid">
          <MetricCard
            label="Total Dividends (Gross)"
            value={summary?.totalGross ?? 0}
            change={summary && summary.totalGross > 0 ? 12.5 : undefined}
            changeLabel="vs last year"
            icon={Coins}
            delay={1}
          />
          <MetricCard
            label="Tax Withheld"
            value={summary?.totalTax ?? 0}
            icon={DollarSign}
            delay={2}
          />
          <MetricCard
            label="Net Dividends"
            value={summary?.totalNet ?? 0}
            icon={TrendingUp}
            delay={3}
          />
          <MetricCard
            label="Payments"
            value={summary?.count ?? 0}
            format="number"
            icon={Calendar}
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
              placeholder="Search by symbol..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </motion.div>

        {/* Dividends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-heading-sm">All Dividends</CardTitle>
              <Badge variant="secondary">
                {filteredDividends.length} payments
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDividends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Coins className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">No dividends found</p>
                  <p className="text-sm text-muted-foreground">
                    Upload broker reports to see your dividends
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {paginatedDividends.map((dividend, index) => (
                      <motion.div
                        key={dividend.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-tertiary"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                            <Coins className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{dividend.symbol}</span>
                              {(dividend.withholdingTaxes?.length ?? 0) > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {dividend.withholdingTaxes?.[0]?.country || "Tax"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {dividend.description || "Dividend payment"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-success">
                                +{formatCurrency(dividend.netAmount)}
                              </p>
                              {dividend.taxWithheld > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Gross: {formatCurrency(dividend.grossAmount)}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(dividend.executedAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredDividends.length)} of{" "}
                        {filteredDividends.length}
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

        {/* Summary Card */}
        {summary && summary.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/50 shadow-card bg-gradient-to-br from-card to-success/5">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Gross Dividends</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalGross)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Withheld</p>
                    <p className="text-2xl font-bold text-destructive">
                      -{formatCurrency(summary.totalTax)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Received</p>
                    <p className="text-2xl font-bold text-success">
                      +{formatCurrency(summary.totalNet)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
                    <p className="text-2xl font-bold">
                      {summary.totalGross > 0
                        ? ((summary.totalTax / summary.totalGross) * 100).toFixed(1)
                        : "0"}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
