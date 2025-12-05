"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Clock, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReportStatus = "pending" | "processing" | "completed" | "failed";

interface ReportStatusBadgeProps {
  status: ReportStatus;
  onRetry?: () => void;
  className?: string;
}

const statusConfig: Record<
  ReportStatus,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    animate?: boolean;
  }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-500/15",
    text: "text-amber-400",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    animate: true,
  },
  completed: {
    label: "Completed",
    icon: Check,
    bg: "bg-success/15",
    text: "text-success",
  },
  failed: {
    label: "Failed",
    icon: AlertTriangle,
    bg: "bg-destructive/15",
    text: "text-destructive",
  },
};

export function ReportStatusBadge({
  status,
  onRetry,
  className,
}: ReportStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          config.bg,
          config.text
        )}
      >
        <Icon
          className={cn("h-3 w-3", config.animate && "animate-spin")}
        />
        {config.label}
      </span>
      
      {status === "failed" && onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </motion.button>
      )}
    </div>
  );
}

