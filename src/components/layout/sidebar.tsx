"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  LayoutDashboard,
  FileText,
  BarChart3,
  Coins,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useAuth } from "@/providers";
import { SidebarPortfolioSwitcher } from "@/components/dashboard";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/holdings", label: "Holdings", icon: BarChart3 },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/dividends", label: "Dividends", icon: Coins },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-card"
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 pt-4 pb-2",
        collapsed && "justify-center px-3"
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold tracking-tight"
            >
              Trade Insight
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Portfolio Switcher */}
      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <div className="flex-1 min-w-0">
          <SidebarPortfolioSwitcher collapsed={collapsed} />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expand button when collapsed */}
      <AnimatePresence mode="wait">
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 py-1"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-full h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "active bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-tertiary hover:text-foreground"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-border" />

      {/* Upgrade CTA */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="p-3"
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4">
              <div className="absolute right-2 top-2">
                <Sparkles className="h-5 w-5 text-primary/50" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                Upgrade to Pro!
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Unlock advanced analytics, AI insights, and more.
              </p>
              <Button size="sm" className="mt-3 w-full">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Menu */}
      <div className="border-t border-border p-3">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-tertiary",
              collapsed && "justify-center px-0"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <User className="h-4 w-4" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-1 items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user?.email?.split("@")[0] || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && !collapsed && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-border bg-card shadow-elevated"
              >
                <Link
                  href="/settings"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-tertiary hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

