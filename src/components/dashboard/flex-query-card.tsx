"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { cn, formatRelativeTime } from "@/lib/utils";
import { flexQueryApi, type FlexQueryCredentialsDto } from "@/lib/api";

interface FlexQueryCardProps {
  portfolioId: string;
  onConfigureClick: () => void;
  onConfigured?: () => void;
}

type SyncStatus = "not_configured" | "active" | "syncing" | "error";

export function FlexQueryCard({
  portfolioId,
  onConfigureClick,
  onConfigured,
}: FlexQueryCardProps) {
  const [credentials, setCredentials] = React.useState<FlexQueryCredentialsDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCredentials = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await flexQueryApi.getCredentials(portfolioId);
      setCredentials(data);
    } catch (err) {
      // If 404, it means no credentials configured - that's fine
      setCredentials({ configured: false });
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  React.useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleDisconnect = async () => {
    try {
      setIsDeleting(true);
      await flexQueryApi.delete(portfolioId);
      setCredentials({ configured: false });
      setShowDisconnectConfirm(false);
      onConfigured?.();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to disconnect");
    } finally {
      setIsDeleting(false);
    }
  };

  const getSyncStatus = (): SyncStatus => {
    if (!credentials?.configured) return "not_configured";
    if (credentials.lastSyncStatus === "failed" || credentials.lastError) return "error";
    if (credentials.lastSyncStatus === "pending") return "syncing";
    return "active";
  };

  const syncStatus = getSyncStatus();

  const statusConfig = {
    not_configured: {
      icon: Zap,
      label: "Not Connected",
      description: "Set up automatic trade syncing",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-border",
    },
    active: {
      icon: CheckCircle2,
      label: "Connected",
      description: "Automatically syncing trades",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
    },
    syncing: {
      icon: RefreshCw,
      label: "Syncing",
      description: "Fetching latest trades...",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/30",
    },
    error: {
      icon: AlertCircle,
      label: "Sync Error",
      description: credentials?.lastError || "Check your credentials",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
    },
  };

  const config = statusConfig[syncStatus];
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className={cn("border transition-colors", config.borderColor)}>
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Status */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  config.bgColor
                )}
              >
                <StatusIcon
                  className={cn(
                    "h-6 w-6",
                    config.color,
                    syncStatus === "syncing" && "animate-spin"
                  )}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-12 items-center justify-center rounded-md bg-red-500/20 text-xs font-bold text-red-400">
                    IBKR
                  </span>
                  <h3 className="font-semibold">Flex Query</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      config.bgColor,
                      config.color
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {config.description}
                </p>
                {credentials?.configured && credentials.lastSyncAt && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last sync: {formatRelativeTime(credentials.lastSyncAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {credentials?.configured ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onConfigureClick}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDisconnectConfirm(true)}
                    disabled={isDeleting}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Disconnect"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={onConfigureClick} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Connect IBKR
                </Button>
              )}
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="border-t border-destructive/20 bg-destructive/5 px-5 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Info banner for not configured */}
          {!credentials?.configured && (
            <div className="border-t border-border bg-tertiary/50 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Connect your Interactive Brokers account to automatically sync trades, dividends, and transfers.{" "}
                <a
                  href="https://www.interactivebrokers.com/en/software/am/am/reports/activityflexqueries.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Learn more
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowDisconnectConfirm(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="absolute right-4 top-4 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Content */}
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <Trash2 className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    Disconnect IBKR Flex Query?
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Automatic syncing will stop. Previously imported data will be kept.
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    className="flex-1 gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Re-export for external refreshing
export function useFlexQueryRefresh() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const refresh = React.useCallback(() => setRefreshKey((k) => k + 1), []);
  return { refreshKey, refresh };
}
