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
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Activity, Loader2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { marketDataApi, type HistoricalPriceDto, type TradeTransactionDto } from "@/lib/api";

type TimeRange = "6M" | "YTD" | "1Y" | "2Y" | "5Y";

interface PriceHistoryChartProps {
  symbol: string;
  currentPrice: number;
  avgCostBasis?: number;
  trades?: TradeTransactionDto[];
  className?: string;
}

interface QuarterActivity {
  quarter: string;
  year: number;
  quarterNum: number;
  buyQuantity: number;
  sellQuantity: number;
  buyAmount: number;
  sellAmount: number;
  startDate: string;
  endDate: string;
  avgBuyPrice: number;
  avgSellPrice: number;
}
function getQuarter(date: Date): { quarter: number; year: number } {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return { quarter, year: date.getFullYear() };
}

function getQuarterDates(year: number, quarter: number): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function formatQuantity(qty: number): string {
  if (qty >= 1000000) {
    return `${(qty / 1000000).toFixed(1)}M`;
  }
  if (qty >= 1000) {
    return `${(qty / 1000).toFixed(1)}K`;
  }
  return qty.toFixed(0);
}

function groupTradesByQuarter(trades: TradeTransactionDto[], startDateStr: string): QuarterActivity[] {
  const startDate = new Date(startDateStr);
  const quarterMap = new Map<string, QuarterActivity>();

  trades.forEach((trade) => {
    const tradeDate = new Date(trade.executedAt);
    if (tradeDate < startDate) return;

    const { quarter, year } = getQuarter(tradeDate);
    const key = `Q${quarter} ${year}`;
    const dates = getQuarterDates(year, quarter);

    if (!quarterMap.has(key)) {
      quarterMap.set(key, {
        quarter: key,
        year,
        quarterNum: quarter,
        buyQuantity: 0,
        sellQuantity: 0,
        buyAmount: 0,
        sellAmount: 0,
        startDate: dates.start,
        endDate: dates.end,
        avgBuyPrice: 0,
        avgSellPrice: 0,
      });
    }

    const activity = quarterMap.get(key)!;
    if (trade.type === "buy") {
      activity.buyQuantity += trade.quantity;
      activity.buyAmount += trade.amount;
    } else {
      activity.sellQuantity += trade.quantity;
      activity.sellAmount += trade.amount;
    }
  });

  // Calculate average prices
  quarterMap.forEach((activity) => {
    if (activity.buyQuantity > 0) {
      activity.avgBuyPrice = activity.buyAmount / activity.buyQuantity;
    }
    if (activity.sellQuantity > 0) {
      activity.avgSellPrice = activity.sellAmount / activity.sellQuantity;
    }
  });

  return Array.from(quarterMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.quarterNum - b.quarterNum;
  });
}


function getDaysForRange(range: TimeRange): number {
  const now = new Date();
  switch (range) {
    case "6M":
      return 180;
    case "YTD":
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return Math.ceil((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    case "1Y":
      return 365;
    case "2Y":
      return 730;
    case "5Y":
      return 1825;
    default:
      return 365;
  }
}

const timeRanges: { id: TimeRange; label: string }[] = [
  { id: "6M", label: "6M" },
  { id: "YTD", label: "YTD" },
  { id: "1Y", label: "1Y" },
  { id: "2Y", label: "2Y" },
  { id: "5Y", label: "5Y" },
];

function getStartDate(range: TimeRange): string {
  const now = new Date();
  if (range === "YTD") {
    return `${now.getFullYear()}-01-01`;
  }
  const days = getDaysForRange(range);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

function formatDate(dateStr: string, range: TimeRange): string {
  const date = new Date(dateStr);
  if (range === "6M" || range === "YTD") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  close: number;
  open: number;
  high: number;
  low: number;
  index: number;
  volume: number;
}

const CustomTooltip = ({
  active,
  payload,
  avgCostBasis,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  avgCostBasis?: number;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isAboveCost = avgCostBasis ? data.close >= avgCostBasis : true;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm px-4 py-3 shadow-elevated"
      >
        <p className="text-xs text-muted-foreground mb-2">
          {new Date(data.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-muted-foreground">Close</span>
            <span
              className={cn(
                "text-sm font-semibold",
                isAboveCost ? "text-success" : "text-destructive"
              )}
            >
              {formatCurrency(data.close)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-muted-foreground">Open</span>
            <span className="text-sm text-foreground">{formatCurrency(data.open)}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-muted-foreground">High</span>
            <span className="text-sm text-success">{formatCurrency(data.high)}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-muted-foreground">Low</span>
            <span className="text-sm text-destructive">{formatCurrency(data.low)}</span>
          </div>
          {data.volume > 0 && (
            <div className="flex items-center justify-between gap-6 pt-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Volume</span>
              <span className="text-sm text-muted-foreground">
                {(data.volume / 1000000).toFixed(2)}M
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};

export function PriceHistoryChart({
  symbol,
  currentPrice,
  avgCostBasis,
  trades = [],
  className,
}: PriceHistoryChartProps) {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1Y");
  const [data, setData] = React.useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = React.useState<QuarterActivity | null>(null);

  const startDateStr = getStartDate(selectedRange);

  // Group trades by quarter
  const quarterActivities = React.useMemo(() => {
    return groupTradesByQuarter(trades, startDateStr);
  }, [trades, startDateStr]);
  // Fetch historical data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const endDate = new Date().toISOString().split("T")[0];

        const response = await marketDataApi.getHistoricalPrices(
          symbol,
          startDateStr,
          endDate
        );

        const chartData: ChartDataPoint[] = response.data.map((d: HistoricalPriceDto, idx: number) => ({
          date: d.date,
          displayDate: formatDate(d.date, selectedRange),
          close: d.close,
          open: d.open,
          high: d.high,
          low: d.low,
          volume: d.volume,
          index: idx,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Failed to fetch historical prices:", err);
        setError("Unable to load price history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, selectedRange, startDateStr]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (data.length < 2) return null;

    const firstPrice = data[0].close;
    const lastPrice = data[data.length - 1].close;
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    const high = Math.max(...data.map((d) => d.high));
    const low = Math.min(...data.map((d) => d.low));

    return {
      change,
      changePercent,
      high,
      low,
      isPositive: change >= 0,
    };
  }, [data]);

  // Find data indices for quarter boundaries
  const getQuarterIndices = React.useCallback((activity: QuarterActivity) => {
    const startIdx = data.findIndex((d) => d.date >= activity.startDate);
    const endIdx = data.findIndex((d) => d.date > activity.endDate);
    return {
      start: startIdx >= 0 ? startIdx : 0,
      end: endIdx >= 0 ? endIdx - 1 : data.length - 1,
    };
  }, [data]);

  // Calculate period totals
  const periodTotals = React.useMemo(() => {
    return quarterActivities.reduce(
      (acc, q) => ({
        totalBought: acc.totalBought + q.buyQuantity,
        totalSold: acc.totalSold + q.sellQuantity,
        totalBuyAmount: acc.totalBuyAmount + q.buyAmount,
        totalSellAmount: acc.totalSellAmount + q.sellAmount,
      }),
      { totalBought: 0, totalSold: 0, totalBuyAmount: 0, totalSellAmount: 0 }
    );
  }, [quarterActivities]);
  
  // Chart gradient colors based on performance
  const gradientId = `gradient-${symbol}`;
  const isPositive = stats?.isPositive ?? true;
  const strokeColor = isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))";
  const fillColor = isPositive ? "url(#" + gradientId + ")" : "url(#" + gradientId + "-red)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={className}
    >
      <Card className="border-border/50 bg-gradient-to-br from-card via-card to-tertiary/30 shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-heading-sm flex items-center gap-2">
                  Price History
                  <span className="text-sm font-normal text-muted-foreground">
                    {symbol}
                  </span>
                </CardTitle>
                {stats && (
                  <div className="flex items-center gap-2 mt-0.5">
                    {stats.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        stats.isPositive ? "text-success" : "text-destructive"
                      )}
                    >
                      {stats.isPositive ? "+" : ""}
                      {stats.changePercent.toFixed(2)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({stats.isPositive ? "+" : ""}
                      {formatCurrency(stats.change)})
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
                      layoutId="time-range-indicator"
                      className="absolute inset-0 rounded-lg bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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
                className="flex items-center justify-center h-96"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading price data...</span>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-96"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Calendar className="h-8 w-8" />
                  <span className="text-sm">{error}</span>
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
                {/* Price Stats Bar */}
                {stats && (
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Current
                        </p>
                        <p className="text-lg font-semibold">{formatCurrency(currentPrice)}</p>
                      </div>
                      {avgCostBasis && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Avg Cost
                          </p>
                          <p className="text-lg font-semibold text-chart-2">
                            {formatCurrency(avgCostBasis)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Period High
                        </p>
                        <p className="text-lg font-semibold text-success">
                          {formatCurrency(stats.high)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Period Low
                        </p>
                        <p className="text-lg font-semibold text-destructive">
                          {formatCurrency(stats.low)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart with quarter activity markers */}
                <div className="h-96 relative">
                  {/* Quarter Activity Cards - Spanning full quarter width */}
                  {quarterActivities.length > 0 && data.length > 0 && (
                    <div className="absolute top-0 left-14 right-2 z-10 pointer-events-none" style={{ height: '130px' }}>
                      <div className="relative w-full h-full flex">
                        {quarterActivities.map((activity, idx) => {
                          const hasBuys = activity.buyQuantity > 0;
                          const hasSells = activity.sellQuantity > 0;
                          if (!hasBuys && !hasSells) return null;

                          const indices = getQuarterIndices(activity);
                          const totalPoints = data.length;
                          // Calculate position and width based on quarter boundaries
                          const leftPercent = (indices.start / totalPoints) * 100;
                          const widthPercent = ((indices.end - indices.start + 1) / totalPoints) * 100;
                          const isSelected = selectedQuarter?.quarter === activity.quarter;

                          return (
                            <motion.div
                              key={activity.quarter}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="absolute h-full flex flex-col items-center justify-end pb-1 pointer-events-auto cursor-pointer"
                              style={{ 
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                              }}
                              onClick={() => setSelectedQuarter(isSelected ? null : activity)}
                            >
                              {/* Quarter label at bottom */}
                              <span className={cn(
                                "text-[10px] font-medium mb-1 transition-colors whitespace-nowrap",
                                isSelected ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {activity.quarter}
                              </span>
                              
                              {/* Stacked card badges - fill quarter width */}
                              <div className="flex flex-col gap-1 items-center w-full px-1">
                                {/* Buy Card */}
                                {hasBuys && (
                                  <div
                                    className={cn(
                                      "relative flex flex-col items-center justify-center w-full",
                                      "py-2 px-1 rounded-xl min-h-[52px]",
                                      "shadow-lg",
                                      isSelected
                                        ? "bg-success ring-2 ring-success/50 ring-offset-1 ring-offset-background shadow-success/30"
                                        : "bg-gradient-to-br from-success to-success/80"
                                    )}
                                  >
                                    <span className="text-base font-bold text-white leading-none">
                                      {formatQuantity(activity.buyQuantity)}
                                    </span>
                                    <span className="text-[8px] font-medium text-white/80 leading-tight mt-0.5">
                                      shares
                                    </span>
                                    <span className="text-[8px] font-medium text-white/80 leading-tight">
                                      purchased
                                    </span>
                                  </div>
                                )}
                                {/* Sell Card */}
                                {hasSells && (
                                  <div
                                    className={cn(
                                      "relative flex flex-col items-center justify-center w-full",
                                      "py-2 px-1 rounded-xl min-h-[52px]",
                                      "shadow-lg",
                                      isSelected
                                        ? "bg-destructive ring-2 ring-destructive/50 ring-offset-1 ring-offset-background shadow-destructive/30"
                                        : "bg-gradient-to-br from-destructive to-destructive/80"
                                    )}
                                  >
                                    <span className="text-base font-bold text-white leading-none">
                                      {formatQuantity(activity.sellQuantity)}
                                    </span>
                                    <span className="text-[8px] font-medium text-white/80 leading-tight mt-0.5">
                                      shares
                                    </span>
                                    <span className="text-[8px] font-medium text-white/80 leading-tight">
                                      sold
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data}
                      margin={{ top: quarterActivities.length > 0 ? 140 : 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                          <stop offset="50%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id={`${gradientId}-red`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="50%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
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
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        tickMargin={8}
                        interval="preserveStartEnd"
                        minTickGap={50}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        tickFormatter={(value: number) => `$${value.toFixed(0)}`}
                        width={55}
                        tickMargin={8}
                      />
                      <Tooltip
                        content={<CustomTooltip avgCostBasis={avgCostBasis} />}
                        cursor={{
                          stroke: "hsl(var(--muted-foreground))",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                      />

                      {/* Average Cost Basis Reference Line */}
                      {avgCostBasis && (
                        <ReferenceLine
                          y={avgCostBasis}
                          stroke="hsl(var(--chart-2))"
                          strokeDasharray="6 4"
                          strokeWidth={2}
                          label={{
                            value: "Avg Cost",
                            position: "insideTopRight",
                            fill: "hsl(var(--chart-2))",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={fillColor}
                        animationDuration={750}
                        animationEasing="ease-out"
                        activeDot={{
                          r: 6,
                          fill: strokeColor,
                          stroke: "hsl(var(--background))",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {/* Selected Quarter Detail / Period Summary */}
                {(selectedQuarter || periodTotals.totalBought > 0 || periodTotals.totalSold > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-4 border-t border-border/50"
                  >
                    {selectedQuarter ? (
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            selectedQuarter.sellQuantity > selectedQuarter.buyQuantity 
                              ? "bg-destructive" 
                              : "bg-success"
                          )} />
                          <div>
                            <div className="font-medium">
                              {selectedQuarter.buyQuantity > 0 && (
                                <span className="text-success">
                                  Bought {formatQuantity(selectedQuarter.buyQuantity)} shares
                                </span>
                              )}
                              {selectedQuarter.buyQuantity > 0 && selectedQuarter.sellQuantity > 0 && (
                                <span className="text-muted-foreground"> · </span>
                              )}
                              {selectedQuarter.sellQuantity > 0 && (
                                <span className="text-destructive">
                                  Sold {formatQuantity(selectedQuarter.sellQuantity)} shares
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{selectedQuarter.quarter}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {selectedQuarter.buyQuantity > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Buy Price</p>
                              <p className="text-sm font-semibold text-success">
                                {formatCurrency(selectedQuarter.avgBuyPrice)}
                              </p>
                            </div>
                          )}
                          {selectedQuarter.sellQuantity > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Sell Price</p>
                              <p className="text-sm font-semibold text-destructive">
                                {formatCurrency(selectedQuarter.avgSellPrice)}
                              </p>
                            </div>
                          )}
                          {selectedQuarter.buyQuantity > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Invested</p>
                              <p className="text-sm font-semibold">
                                {formatCurrency(selectedQuarter.buyAmount)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Trading Activity ({selectedRange})
                        </span>
                        <div className="flex items-center gap-4">
                          {periodTotals.totalBought > 0 && (
                            <span className="text-success font-medium">
                              +{formatQuantity(periodTotals.totalBought)} bought
                              <span className="text-muted-foreground font-normal ml-1">
                                ({formatCurrency(periodTotals.totalBuyAmount)})
                              </span>
                            </span>
                          )}
                          {periodTotals.totalSold > 0 && (
                            <span className="text-destructive font-medium">
                              -{formatQuantity(periodTotals.totalSold)} sold
                              <span className="text-muted-foreground font-normal ml-1">
                                ({formatCurrency(periodTotals.totalSellAmount)})
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

