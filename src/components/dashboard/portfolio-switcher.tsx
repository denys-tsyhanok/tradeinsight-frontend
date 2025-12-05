"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  ChevronDown,
  Check,
  Plus,
  Loader2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortfolio } from "@/providers";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
} from "@/components/ui";

export function PortfolioSwitcher() {
  const {
    portfolios,
    activePortfolio,
    isLoading,
    setActivePortfolio,
    createPortfolio,
  } = usePortfolio();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newPortfolioName, setNewPortfolioName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPortfolio = (
    portfolio: (typeof portfolios)[0]
  ) => {
    setActivePortfolio(portfolio);
    setIsOpen(false);
  };

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return;

    setIsCreating(true);
    try {
      await createPortfolio({ name: newPortfolioName.trim() });
      setNewPortfolioName("");
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create portfolio:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getPortfolioTag = (portfolio: (typeof portfolios)[0]) => {
    if (portfolio.isDefault) return "default";
    if (portfolio.isArchived) return "archived";
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex h-14 items-center gap-3 rounded-xl bg-secondary px-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!activePortfolio) {
    return (
      <Button
        onClick={() => setIsCreateOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Portfolio
      </Button>
    );
  }

  return (
    <>
      <div ref={dropdownRef} className="relative">
        {/* Switcher Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
            "bg-secondary hover:bg-tertiary",
            "border border-transparent",
            isOpen && "border-primary/30 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
          )}
        >
          {/* Portfolio Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>

          {/* Portfolio Info */}
          <div className="flex flex-col items-start">
            <span className="text-base font-semibold text-foreground">
              {activePortfolio.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {activePortfolio.summary.reportCount} reports ·{" "}
              {activePortfolio.summary.holdingCount} holdings
            </span>
          </div>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.button>

        {/* Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "absolute left-0 top-full z-50 mt-2 min-w-[280px] overflow-hidden",
                "rounded-xl border border-border bg-card",
                "shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
              )}
            >
              {/* Portfolio List */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                {portfolios.map((portfolio) => {
                  const isSelected = portfolio.id === activePortfolio.id;
                  const tag = getPortfolioTag(portfolio);

                  return (
                    <motion.button
                      key={portfolio.id}
                      onClick={() => handleSelectPortfolio(portfolio)}
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                        isSelected
                          ? "bg-primary/10"
                          : "hover:bg-tertiary"
                      )}
                    >
                      {/* Small Icon */}
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          isSelected ? "bg-primary/20" : "bg-tertiary"
                        )}
                      >
                        <Briefcase
                          className={cn(
                            "h-4 w-4",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      </div>

                      {/* Portfolio Name & Tag */}
                      <div className="flex flex-1 flex-col items-start">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {portfolio.name}
                        </span>
                        {tag && (
                          <span
                            className={cn(
                              "text-xs",
                              tag === "default"
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {tag === "default" && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Default
                              </span>
                            )}
                            {tag === "archived" && "Archived"}
                          </span>
                        )}
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-2 h-px bg-border" />

              {/* Create New Portfolio */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-tertiary hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Create new portfolio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Portfolio Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
            <DialogDescription>
              Create a new portfolio to organize your investments separately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="portfolio-name"
                className="text-sm font-medium text-foreground"
              >
                Portfolio Name
              </label>
              <Input
                id="portfolio-name"
                placeholder="e.g., Retirement IRA, Dividend Portfolio"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreatePortfolio();
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePortfolio}
                disabled={!newPortfolioName.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Portfolio"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

