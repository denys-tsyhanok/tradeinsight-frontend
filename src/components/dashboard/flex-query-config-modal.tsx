"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Zap,
  Key,
  Hash,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  flexQueryApi,
  type FlexQueryCredentialsDto,
  type ConfigureFlexQueryDto,
} from "@/lib/api";

interface FlexQueryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  portfolioId: string;
}

type Step = "info" | "credentials" | "success";

export function FlexQueryConfigModal({
  isOpen,
  onClose,
  onSuccess,
  portfolioId,
}: FlexQueryConfigModalProps) {
  const [step, setStep] = React.useState<Step>("info");
  const [token, setToken] = React.useState("");
  const [queryId, setQueryId] = React.useState("");
  const [showToken, setShowToken] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [existingCredentials, setExistingCredentials] =
    React.useState<FlexQueryCredentialsDto | null>(null);

  // Load existing credentials
  React.useEffect(() => {
    if (isOpen) {
      flexQueryApi
        .getCredentials(portfolioId)
        .then((data) => {
          setExistingCredentials(data);
          if (data.configured && data.queryId) {
            setQueryId(data.queryId);
            setStep("credentials");
          }
        })
        .catch(() => {
          setExistingCredentials({ configured: false });
        });
    }
  }, [isOpen, portfolioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim() || !queryId.trim()) {
      setError("Both Token and Query ID are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await flexQueryApi.configure(portfolioId, {
        token: token.trim(),
        queryId: queryId.trim(),
      });

      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to configure credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("info");
    setToken("");
    setQueryId("");
    setShowToken(false);
    setError(null);
    setExistingCredentials(null);
    onClose();
  };

  const renderInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Hero */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">
          Connect IBKR Flex Query
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Automatically sync your trades, dividends, and transfers from
          Interactive Brokers
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 rounded-xl bg-tertiary/50 p-4">
        <h4 className="text-sm font-medium">How to get your credentials:</h4>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              1
            </span>
            <span>
              Log into{" "}
              <a
                href="https://www.interactivebrokers.com/sso/Login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                IBKR Account Management
              </a>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              2
            </span>
            <span>
              Navigate to <strong>Reports → Flex Queries</strong>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              3
            </span>
            <span>
              Create a new Activity Flex Query or use an existing one
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              4
            </span>
            <span>
              Copy your <strong>Query ID</strong> and generate a{" "}
              <strong>Flex Web Service Token</strong>
            </span>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={() => setStep("credentials")} className="flex-1 gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Help link */}
      <p className="text-center text-xs text-muted-foreground">
        Need help?{" "}
        <a
          href="https://www.interactivebrokers.com/en/software/am/am/reports/activityflexqueries.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          View IBKR documentation
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>
    </motion.div>
  );

  const renderCredentialsStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Enter Your Credentials</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {existingCredentials?.configured
              ? "Update your IBKR Flex Query credentials"
              : "Paste your IBKR Flex Query credentials below"}
          </p>
        </div>

        {/* Existing config info */}
        {existingCredentials?.configured && (
          <div className="flex items-start gap-3 rounded-lg bg-chart-2/10 p-3">
            <Info className="h-5 w-5 shrink-0 text-chart-2" />
            <div className="text-sm">
              <p className="font-medium text-chart-2">Currently configured</p>
              <p className="text-muted-foreground">
                Query ID: {existingCredentials.queryId} • Token:{" "}
                {existingCredentials.tokenMasked}
              </p>
            </div>
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {/* Query ID */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Query ID
            </label>
            <Input
              type="text"
              placeholder="e.g., 123456"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Found in Flex Queries section of your IBKR account
            </p>
          </div>

          {/* Token */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Key className="h-4 w-4 text-muted-foreground" />
              Flex Web Service Token
            </label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                placeholder="Enter your token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate this in Settings → Flex Web Service
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              existingCredentials?.configured
                ? handleClose()
                : setStep("info")
            }
            className="flex-1"
            disabled={isSubmitting}
          >
            {existingCredentials?.configured ? "Cancel" : "Back"}
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={isSubmitting || !token.trim() || !queryId.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {existingCredentials?.configured
                  ? "Update Connection"
                  : "Connect"}
              </>
            )}
          </Button>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-muted-foreground">
          🔒 Your credentials are encrypted and stored securely
        </p>
      </form>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20"
      >
        <CheckCircle2 className="h-8 w-8 text-success" />
      </motion.div>
      <h3 className="mt-4 text-lg font-semibold">Successfully Connected!</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Your IBKR account is now linked. Initial sync has been queued.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirecting...
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
              {/* Close button */}
              {step !== "success" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-4 top-4 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Content */}
              <AnimatePresence mode="wait">
                {step === "info" && (
                  <React.Fragment key="info">{renderInfoStep()}</React.Fragment>
                )}
                {step === "credentials" && (
                  <React.Fragment key="credentials">
                    {renderCredentialsStep()}
                  </React.Fragment>
                )}
                {step === "success" && (
                  <React.Fragment key="success">
                    {renderSuccessStep()}
                  </React.Fragment>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
