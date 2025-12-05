"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Sidebar } from "./sidebar";
import { SidebarPortfolioSwitcher } from "@/components/dashboard";
import { useMediaQuery } from "@/hooks";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  // Auto-collapse on tablet
  React.useEffect(() => {
    if (isTablet) {
      setSidebarCollapsed(true);
    }
  }, [isTablet]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 72 : 280;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex-1 min-w-0">
            <SidebarPortfolioSwitcher collapsed={false} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-2 shrink-0"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 top-16 z-50 w-72"
            >
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          paddingTop: isMobile ? 64 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "min-h-screen transition-all duration-300",
          isMobile ? "pt-16" : ""
        )}
      >
        <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}

