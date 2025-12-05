"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "error" | "info" | "pending" | "active" | "inactive";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { bg: string; text: string; dot: string }> = {
  success: {
    bg: "bg-success/15",
    text: "text-success",
    dot: "bg-success",
  },
  warning: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  error: {
    bg: "bg-destructive/15",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  info: {
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    dot: "bg-chart-2",
  },
  pending: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  active: {
    bg: "bg-success/15",
    text: "text-success",
    dot: "bg-success",
  },
  inactive: {
    bg: "bg-muted-foreground/15",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const statusLabels: Record<StatusType, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Info",
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
};

export function StatusBadge({ status, label, pulse = false, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || statusLabels[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <motion.span
            className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", config.dot)}
            animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", config.dot)} />
      </span>
      {displayLabel}
    </span>
  );
}

