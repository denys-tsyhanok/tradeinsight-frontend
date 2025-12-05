"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SymbolLogoProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-14 w-14 text-base",
};

const paddingClasses = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
};

// Logo source
const getLogoUrl = (symbol: string): string => {
  return `https://assets.parqet.com/logos/symbol/${encodeURIComponent(symbol.toUpperCase())}`;
};

export function SymbolLogo({ symbol, size = "md", className }: SymbolLogoProps) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  // Reset state when symbol changes
  React.useEffect(() => {
    setStatus("loading");
  }, [symbol]);

  const logoUrl = getLogoUrl(symbol);
  const showLogo = status === "loaded";
  const showFallback = status === "error" || status === "loading";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl overflow-hidden",
        "bg-inherit",
        sizeClasses[size],
        className
      )}
    >
      {/* Fallback text - always visible behind, hidden when logo loads */}
      <span
        className={cn(
          "font-bold text-primary flex items-center justify-center transition-opacity duration-200",
          "bg-gradient-to-br from-primary/20 to-primary/5 absolute inset-0",
          showLogo && "opacity-0"
        )}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>

      {/* Logo image */}
      <img
        key={symbol}
        src={logoUrl}
        alt={`${symbol} logo`}
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
          paddingClasses[size],
          showLogo ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}

