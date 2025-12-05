"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn, formatPercentage, formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface HoldingData {
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color: string;
}

interface DonutChartProps {
  data: HoldingData[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: HoldingData }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-elevated">
        <p className="font-medium">{data.symbol}</p>
        <p className="text-xs text-muted-foreground">{data.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">{formatCurrency(data.value)}</span>
          <span className="text-xs text-muted-foreground">
            ({data.percentage.toFixed(1)}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function DonutChart({
  data,
  title = "Holdings Distribution",
  centerLabel = "Total Value",
  centerValue,
  className,
}: DonutChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const displayCenterValue = centerValue || formatCurrency(totalValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={className}
    >
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-heading-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as unknown as Array<Record<string, unknown>>}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">{centerLabel}</span>
              <span className="text-xl font-bold">{displayCenterValue}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.symbol}</span>
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

