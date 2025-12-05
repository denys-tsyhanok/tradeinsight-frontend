"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RefreshCw,
  Search,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Download,
  Wallet,
  Activity,
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
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  transfersApi,
  type TransferResponseDto,
  type TransferSummaryDto,
  type TransferType,
  type BrokerType,
} from "@/lib/api";
import { usePortfolio } from "@/providers";

type FilterType = "all" | "deposit" | "withdrawal" | "transfer" | "transfer_in" | "transfer_out";
type TimeRange = "1M" | "6M" | "YTD" | "1Y" | "3Y" | "ALL";

type BrokerFilter = "all" | BrokerType;

interface ChartDataPoint {
  date: string;
  displayDate: string;
  deposits: number;
  withdrawals: number;
  net: number;
}

const timeRanges: { id: TimeRange; label: string }[] = [
  { id: "1M", label: "1M" },
  { id: "6M", label: "6M" },
  { id: "YTD", label: "YTD" },
  { id: "1Y", label: "1Y" },
  { id: "3Y", label: "3Y" },
  { id: "ALL", label: "All" },
];

function getStartDateForRange(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "3Y":
      return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    case "ALL":
      return null;
  }
}

function formatChartDate(dateStr: string, range: TimeRange): string {
  const date = new Date(dateStr);
  if (range === "1M") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function groupTransfersByMonth(
  transfers: TransferResponseDto[],
  startDate: Date | null,
  range: TimeRange
): ChartDataPoint[] {
  const monthMap = new Map<string, { deposits: number; withdrawals: number }>();

  transfers.forEach((transfer) => {
    const date = new Date(transfer.executedAt);
    if (startDate && date < startDate) return;

    // Only include deposits and withdrawals in chart
    if (transfer.type !== "deposit" && transfer.type !== "withdrawal") return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { deposits: 0, withdrawals: 0 });
    }

    const entry = monthMap.get(monthKey)!;
    if (transfer.type === "deposit") {
      entry.deposits += transfer.amount;
    } else if (transfer.type === "withdrawal") {
      entry.withdrawals += Math.abs(transfer.amount);
    }
  });

  const sortedMonths = Array.from(monthMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return sortedMonths.map(([monthKey, data]) => ({
    date: `${monthKey}-01`,
    displayDate: formatChartDate(`${monthKey}-01`, range),
    deposits: data.deposits,
    withdrawals: data.withdrawals,
    net: data.deposits - data.withdrawals,
  }));
}

const CustomTooltip = ({
  active,
  payload,
  showDeposits = true,
  showWithdrawals = true,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  showDeposits?: boolean;
  showWithdrawals?: boolean;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const displayedNet = (showDeposits ? data.deposits : 0) - (showWithdrawals ? data.withdrawals : 0);
    const hasMultipleVisible = showDeposits && showWithdrawals;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-elevated"
      >
        <p className="text-xs text-muted-foreground mb-2">
          {new Date(data.date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="space-y-1.5">
          {showDeposits && data.deposits > 0 && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success" />
                Deposits
              </span>
              <span className="text-sm font-semibold text-success">
                +{formatCurrency(data.deposits)}
              </span>
            </div>
          )}
          {showWithdrawals && data.withdrawals > 0 && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                Withdrawals
              </span>
              <span className="text-sm font-semibold text-destructive">
                -{formatCurrency(data.withdrawals)}
              </span>
            </div>
          )}
          {hasMultipleVisible && (
            <div className="flex items-center justify-between gap-6 pt-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Net</span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  displayedNet >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {displayedNet >= 0 ? "+" : ""}
                {formatCurrency(displayedNet)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};

function getTransferIcon(type: TransferType) {
  switch (type) {
    case "deposit":
    case "transfer_in":
      return ArrowDownToLine;
    case "withdrawal":
    case "transfer_out":
      return ArrowUpFromLine;
    case "transfer":
    default:
      return ArrowLeftRight;
  }
}

function getTransferColor(type: TransferType) {
  switch (type) {
    case "deposit":
    case "transfer_in":
      return "text-success";
    case "withdrawal":
    case "transfer_out":
      return "text-destructive";
    case "transfer":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

function getTransferBgColor(type: TransferType) {
  switch (type) {
    case "deposit":
    case "transfer_in":
      return "bg-success/10";
    case "withdrawal":
    case "transfer_out":
      return "bg-destructive/10";
    case "transfer":
      return "bg-primary/10";
    default:
      return "bg-muted/10";
  }
}

function getTransferLabel(type: TransferType) {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "transfer":
      return "Transfer";
    case "transfer_in":
      return "Transfer In";
    case "transfer_out":
      return "Transfer Out";
    default:
      return type;
  }
}

function getBrokerLabel(broker: BrokerType) {
  switch (broker) {
    case "ibkr":
      return "IBKR";
    case "freedom_finance":
      return "Freedom Finance";
    default:
      return broker;
  }
}

function getBrokerColor(broker: BrokerType) {
  switch (broker) {
    case "ibkr":
      return "bg-red-500/10 text-red-500 border-red-500/30";
    case "freedom_finance":
      return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    default:
      return "bg-muted/10 text-muted-foreground";
  }
}

export default function TransfersPage() {
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const [transfers, setTransfers] = React.useState<TransferResponseDto[]>([]);
  const [summary, setSummary] = React.useState<TransferSummaryDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<FilterType>("all");
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1Y");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showDeposits, setShowDeposits] = React.useState(true);
  const [showWithdrawals, setShowWithdrawals] = React.useState(true);
  const [brokerFilter, setBrokerFilter] = React.useState<BrokerFilter>("all");
  const pageSize = 10;

  // Fetch transfers
  const fetchTransfers = React.useCallback(async () => {
    if (!activePortfolio) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await transfersApi.list(activePortfolio.id);
      setTransfers(response.transfers);
      setSummary(response.summary);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to fetch transfers");
    } finally {
      setIsLoading(false);
    }
  }, [activePortfolio]);

  React.useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Filter transfers
  const filteredTransfers = React.useMemo(() => {
    let result = [...transfers];

    // Filter by search
    if (searchQuery) {
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== "all") {
      result = result.filter((t) => t.type === filterType);
    }

    // Filter by broker
    if (brokerFilter !== "all") {
      result = result.filter((t) => t.broker === brokerFilter);
    }

    // Sort by date (newest first)
    result.sort(
      (a, b) =>
        new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
    );

    return result;
  }, [transfers, searchQuery, filterType, brokerFilter]);

  // Chart data (filtered by broker)
  const chartData = React.useMemo(() => {
    const startDate = getStartDateForRange(selectedRange);
    // Apply broker filter to chart data
    const filteredForChart = brokerFilter === "all" 
      ? transfers 
      : transfers.filter((t) => t.broker === brokerFilter);
    return groupTransfersByMonth(filteredForChart, startDate, selectedRange);
  }, [transfers, selectedRange, brokerFilter]);

  // Chart stats
  const chartStats = React.useMemo(() => {
    if (chartData.length === 0) return null;

    const totalDeposits = chartData.reduce((sum, d) => sum + d.deposits, 0);
    const totalWithdrawals = chartData.reduce((sum, d) => sum + d.withdrawals, 0);
    const netFlow = totalDeposits - totalWithdrawals;

    return {
      totalDeposits,
      totalWithdrawals,
      netFlow,
      isPositive: netFlow >= 0,
    };
  }, [chartData]);

  // KPI totals (calculated from actual transfer data)
  const kpiTotals = React.useMemo(() => {
    const deposits = transfers
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = transfers
      .filter((t) => t.type === "withdrawal")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const count = transfers.length;

    return {
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      count,
    };
  }, [transfers]);

  // Pagination
  const totalPages = Math.ceil(filteredTransfers.length / pageSize);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const handleExport = () => {
    if (filteredTransfers.length === 0) return;

    const headers = ["Date", "Type", "Broker", "Amount", "Currency", "Description"];
    const rows = filteredTransfers.map((t) => [
      formatDate(t.executedAt),
      getTransferLabel(t.type),
      getBrokerLabel(t.broker),
      t.amount,
      t.currency,
      t.description || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transfers-${new Date().toISOString().split("T")[0]}.csv`;
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
            Create a portfolio to view transfers
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
              Transfers
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track deposits, withdrawals, and account transfers
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchTransfers}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredTransfers.length === 0}
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

        {/* KPI Cards */}
        <div className="dashboard-grid">
          <MetricCard
            label="Total Deposits"
            value={kpiTotals.totalDeposits}
            icon={ArrowDownToLine}
            delay={1}
          />
          <MetricCard
            label="Total Withdrawals"
            value={kpiTotals.totalWithdrawals}
            icon={ArrowUpFromLine}
            delay={2}
          />
          <MetricCard
            label="Transactions"
            value={kpiTotals.count}
            format="number"
            icon={Wallet}
            delay={4}
          />
        </div>

        {/* Deposits Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 bg-gradient-to-br from-card via-card to-tertiary/30 shadow-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-heading-sm">
                      Cash Flow History
                    </CardTitle>
                    {chartStats && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            chartStats.isPositive
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          Net: {chartStats.isPositive ? "+" : ""}
                          {formatCurrency(chartStats.netFlow)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-1 rounded-xl bg-tertiary/50 p-1 backdrop-blur-sm">
                  {timeRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedRange(range.id)}
                      className={cn(
                        "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        selectedRange === range.id
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {selectedRange === range.id && (
                        <motion.div
                          layoutId="transfers-time-range-indicator"
                          className="absolute inset-0 rounded-lg bg-primary"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.4,
                          }}
                        />
                      )}
                      <span className="relative z-10">{range.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-72"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Loading transfer data...
                      </span>
                    </div>
                  </motion.div>
                ) : chartData.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center h-72"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ArrowLeftRight className="h-8 w-8" />
                      <span className="text-sm">No transfer data available</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Stats Bar */}
                    {chartStats && (
                      <div className="flex items-center justify-between mb-4 px-2 flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          {showDeposits && chartStats.totalDeposits > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Deposits
                              </p>
                              <p className="text-lg font-semibold text-success">
                                +{formatCurrency(chartStats.totalDeposits)}
                              </p>
                            </div>
                          )}
                          {showWithdrawals && chartStats.totalWithdrawals > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Withdrawals
                              </p>
                              <p className="text-lg font-semibold text-destructive">
                                -{formatCurrency(chartStats.totalWithdrawals)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Data type toggles */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowDeposits(!showDeposits)}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                showDeposits
                                  ? "bg-success/20 text-success ring-1 ring-success/30"
                                  : "bg-tertiary text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <div className={cn(
                                "w-2.5 h-2.5 rounded",
                                showDeposits ? "bg-success" : "bg-muted-foreground/30"
                              )} />
                              Deposits
                            </button>
                            <button
                              onClick={() => setShowWithdrawals(!showWithdrawals)}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                showWithdrawals
                                  ? "bg-destructive/20 text-destructive ring-1 ring-destructive/30"
                                  : "bg-tertiary text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <div className={cn(
                                "w-2.5 h-2.5 rounded",
                                showWithdrawals ? "bg-destructive" : "bg-muted-foreground/30"
                              )} />
                              Withdrawals
                            </button>
                          </div>

                          {/* Divider */}
                          <div className="h-6 w-px bg-border" />

                          {/* Broker filter */}
                          <div className="flex items-center gap-1 rounded-lg bg-tertiary/50 p-1">
                            <button
                              onClick={() => setBrokerFilter("all")}
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                                brokerFilter === "all"
                                  ? "bg-card text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              All
                            </button>
                            <button
                              onClick={() => setBrokerFilter("ibkr")}
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                                brokerFilter === "ibkr"
                                  ? "bg-red-500/20 text-red-500 shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              IBKR
                            </button>
                            <button
                              onClick={() => setBrokerFilter("freedom_finance")}
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                                brokerFilter === "freedom_finance"
                                  ? "bg-blue-500/20 text-blue-500 shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Freedom
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="depositsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="hsl(var(--success))"
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor="hsl(var(--success))"
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                            <linearGradient
                              id="withdrawalsGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="hsl(var(--destructive))"
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor="hsl(var(--destructive))"
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.5}
                          />
                          <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 11,
                            }}
                            tickMargin={8}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 11,
                            }}
                            tickFormatter={(value: number) =>
                              `$${(value / 1000).toFixed(0)}k`
                            }
                            width={55}
                            tickMargin={8}
                          />
                          <Tooltip content={<CustomTooltip showDeposits={showDeposits} showWithdrawals={showWithdrawals} />} />
                          {showDeposits && (
                            <Bar
                              dataKey="deposits"
                              fill="url(#depositsGradient)"
                              radius={[4, 4, 0, 0]}
                            />
                          )}
                          {showWithdrawals && (
                            <Bar
                              dataKey="withdrawals"
                              fill="url(#withdrawalsGradient)"
                              radius={[4, 4, 0, 0]}
                            />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex gap-1 rounded-lg bg-tertiary p-1">
            {(
              [
                { id: "all", label: "All" },
                { id: "deposit", label: "Deposits" },
                { id: "withdrawal", label: "Withdrawals" },
                { id: "transfer_in", label: "In" },
                { id: "transfer_out", label: "Out" },
              ] as { id: FilterType; label: string }[]
            ).map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setFilterType(type.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  filterType === type.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transfers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-heading-sm">All Transfers</CardTitle>
              <Badge variant="secondary">
                {filteredTransfers.length} transactions
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTransfers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">No transfers found</p>
                  <p className="text-sm text-muted-foreground">
                    {transfers.length === 0
                      ? "Upload broker reports to see your transfers"
                      : "Try adjusting your filters"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {paginatedTransfers.map((transfer, index) => {
                      const Icon = getTransferIcon(transfer.type);
                      const colorClass = getTransferColor(transfer.type);
                      const bgColorClass = getTransferBgColor(transfer.type);
                      // Deposits and transfer_in are inflows
                      const isInflow = transfer.type === "deposit" || transfer.type === "transfer_in";

                      return (
                        <motion.div
                          key={transfer.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="flex items-center justify-between p-4 transition-colors hover:bg-tertiary"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                bgColorClass,
                                colorClass
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {getTransferLabel(transfer.type)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {transfer.currency}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs border", getBrokerColor(transfer.broker))}
                                >
                                  {getBrokerLabel(transfer.broker)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {transfer.description || "Account transfer"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-semibold", colorClass)}>
                              {isInflow ? "+" : "-"}
                              {formatCurrency(Math.abs(transfer.amount))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transfer.executedAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                      <span className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(
                          currentPage * pageSize,
                          filteredTransfers.length
                        )}{" "}
                        of {filteredTransfers.length}
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
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border/50 shadow-card bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Deposited
                    </p>
                    <p className="text-2xl font-bold text-success">
                      +{formatCurrency(summary.totalDeposits)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Withdrawn
                    </p>
                    <p className="text-2xl font-bold text-destructive">
                      -{formatCurrency(summary.totalWithdrawals)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        summary.netTransfers >= 0
                          ? "text-success"
                          : "text-destructive"
                      )}
                    >
                      {summary.netTransfers >= 0 ? "+" : ""}
                      {formatCurrency(summary.netTransfers)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transfer Count
                    </p>
                    <p className="text-2xl font-bold">{summary.count}</p>
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

