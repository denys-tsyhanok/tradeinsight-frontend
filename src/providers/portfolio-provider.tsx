"use client";

import * as React from "react";
import {
  portfoliosApi,
  type PortfolioWithSummaryDto,
  type CreatePortfolioDto,
} from "@/lib/api";

interface PortfolioContextType {
  portfolios: PortfolioWithSummaryDto[];
  activePortfolio: PortfolioWithSummaryDto | null;
  isLoading: boolean;
  error: string | null;
  setActivePortfolio: (portfolio: PortfolioWithSummaryDto) => void;
  refreshPortfolios: () => Promise<void>;
  createPortfolio: (data: CreatePortfolioDto) => Promise<PortfolioWithSummaryDto>;
  deletePortfolio: (portfolioId: string) => Promise<void>;
}

const PortfolioContext = React.createContext<PortfolioContextType | undefined>(
  undefined
);

const ACTIVE_PORTFOLIO_KEY = "trade_insight_active_portfolio";

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [portfolios, setPortfolios] = React.useState<PortfolioWithSummaryDto[]>(
    []
  );
  const [activePortfolio, setActivePortfolioState] =
    React.useState<PortfolioWithSummaryDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load portfolios on mount
  const loadPortfolios = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await portfoliosApi.list();
      setPortfolios(response.portfolios);

      // Try to restore previously selected portfolio from localStorage
      const savedPortfolioId =
        typeof window !== "undefined"
          ? localStorage.getItem(ACTIVE_PORTFOLIO_KEY)
          : null;

      const savedPortfolio = savedPortfolioId
        ? response.portfolios.find((p) => p.id === savedPortfolioId)
        : null;

      // Use saved portfolio, or default portfolio, or first portfolio
      const defaultPortfolio =
        savedPortfolio ||
        response.portfolios.find((p) => p.isDefault) ||
        response.portfolios[0] ||
        null;

      setActivePortfolioState(defaultPortfolio);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load portfolios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  // Set active portfolio and persist to localStorage
  const setActivePortfolio = React.useCallback(
    (portfolio: PortfolioWithSummaryDto) => {
      setActivePortfolioState(portfolio);
      if (typeof window !== "undefined") {
        localStorage.setItem(ACTIVE_PORTFOLIO_KEY, portfolio.id);
      }
    },
    []
  );

  // Refresh portfolios
  const refreshPortfolios = React.useCallback(async () => {
    await loadPortfolios();
  }, [loadPortfolios]);

  // Create new portfolio
  const createPortfolio = React.useCallback(
    async (data: CreatePortfolioDto): Promise<PortfolioWithSummaryDto> => {
      const newPortfolio = await portfoliosApi.create(data);
      // Fetch fresh list to get the full PortfolioWithSummaryDto
      const response = await portfoliosApi.list();
      setPortfolios(response.portfolios);
      
      // Find the newly created portfolio from fresh data
      const created = response.portfolios.find((p) => p.id === newPortfolio.id);
      if (created) {
        setActivePortfolioState(created);
        if (typeof window !== "undefined") {
          localStorage.setItem(ACTIVE_PORTFOLIO_KEY, created.id);
        }
        return created;
      }
      // Return a minimal version if not found
      const minimal: PortfolioWithSummaryDto = {
        ...newPortfolio,
        summary: { reportCount: 0, holdingCount: 0 },
      };
      setActivePortfolioState(minimal);
      return minimal;
    },
    []
  );

  // Delete portfolio
  const deletePortfolio = React.useCallback(
    async (portfolioId: string) => {
      await portfoliosApi.delete(portfolioId);
      // If we deleted the active portfolio, switch to another one
      if (activePortfolio?.id === portfolioId) {
        const remaining = portfolios.filter((p) => p.id !== portfolioId);
        const newActive = remaining.find((p) => p.isDefault) || remaining[0];
        if (newActive) {
          setActivePortfolio(newActive);
        }
      }
      await loadPortfolios();
    },
    [activePortfolio, portfolios, setActivePortfolio, loadPortfolios]
  );

  const value = React.useMemo(
    () => ({
      portfolios,
      activePortfolio,
      isLoading,
      error,
      setActivePortfolio,
      refreshPortfolios,
      createPortfolio,
      deletePortfolio,
    }),
    [
      portfolios,
      activePortfolio,
      isLoading,
      error,
      setActivePortfolio,
      refreshPortfolios,
      createPortfolio,
      deletePortfolio,
    ]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = React.useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}

