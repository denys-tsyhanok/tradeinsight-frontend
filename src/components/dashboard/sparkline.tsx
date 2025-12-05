"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ 
  data, 
  color = "hsl(var(--primary))",
  height = 64 
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sparklineGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#sparklineGradient-${color})`}
          isAnimationActive={true}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

