"use client";

import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { PortfolioProvider } from "./portfolio-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <PortfolioProvider>{children}</PortfolioProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export { useAuth } from "./auth-provider";
export { usePortfolio } from "./portfolio-provider";
