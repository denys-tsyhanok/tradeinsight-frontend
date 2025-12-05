"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-muted",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 w-full",
        className
      )}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-4 h-12 w-40" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function HoldingCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="ml-auto h-5 w-20" />
        <Skeleton className="mt-1 ml-auto h-4 w-24" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-7 w-10 rounded-md" />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <div className="p-5">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        {[...Array(4)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <div className="space-y-6">
          <ChartSkeleton />
          <TableSkeleton />
        </div>
        <div className="space-y-6">
          <ChartSkeleton />
          {[...Array(4)].map((_, i) => (
            <HoldingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

