"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui";

interface MetricCardProps {
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
  format?: "currency" | "percentage" | "number";
  icon?: React.ElementType;
  className?: string;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  change,
  changeLabel = "vs last month",
  format = "currency",
  icon: Icon,
  className,
  delay = 0,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === 0;

  // Count-up animation
  React.useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, increment * step);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "percentage":
        return formatPercentage(val);
      default:
        return val.toLocaleString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      <Card className="card-hover relative overflow-hidden border-border/50 bg-card shadow-card">
        <CardContent className="p-5">
          {/* Label */}
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <span className="text-label text-muted-foreground">{label}</span>
          </div>

          {/* Value */}
          <div className="mt-3">
            <span className="text-kpi number-animate tracking-tight">
              {formatValue(displayValue)}
            </span>
          </div>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant={isNeutral ? "secondary" : isPositive ? "success" : "destructive"}
                className="gap-1 px-2 py-0.5"
              >
                {isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPercentage(Math.abs(change))}
              </Badge>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </CardContent>

        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5" />
      </Card>
    </motion.div>
  );
}

