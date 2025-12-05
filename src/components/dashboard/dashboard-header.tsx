"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Button, Badge } from "@/components/ui";

interface DashboardHeaderProps {
  userName: string;
  holdingsCount: number;
  totalValue: number;
  totalReturn: number;
  onExport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  userName,
  holdingsCount,
  totalValue,
  totalReturn,
  onExport,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const firstName = userName.split(" ")[0];
  const isPositive = totalReturn >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome Back, {firstName}! 👋
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            {holdingsCount} Holdings Active
          </span>
          <span>•</span>
          <span className="font-medium text-foreground">
            {formatCurrency(totalValue)} Total Value
          </span>
          <span>•</span>
          <Badge
            variant={isPositive ? "success" : "destructive"}
            className="font-medium"
          >
            {formatPercentage(totalReturn)} Total Return
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </motion.div>
  );
}

