"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Upload,
  FileText,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { useAuth } from "@/providers";

const features = [
  {
    icon: Upload,
    title: "Multi-Broker Support",
    description: "Upload statements from Interactive Brokers, Freedom Finance, and more.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description: "Get complete P&L breakdown, dividend tracking, and position analysis.",
  },
  {
    icon: PieChart,
    title: "Asset Allocation",
    description: "Visualize your portfolio distribution across different asset classes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared with third parties.",
  },
];

const stats = [
  { value: "2", label: "Supported Brokers" },
  { value: "100%", label: "Free to Use" },
  { value: "Real-time", label: "Analysis" },
  { value: "Secure", label: "Data Storage" },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <TrendingUp className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Trade Insight</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isLoading ? null : isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Complete Portfolio Analytics
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Analyze your trades with{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                clarity
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Upload your broker statements and get instant portfolio profitability analytics. 
              Track P&L, dividends, and performance — all in one place.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {isAuthenticated ? (
                <Button size="lg" className="gap-2 px-8" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="gap-2 px-8" asChild>
                    <Link href="/register">
                      Start Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2 px-8" asChild>
                    <Link href="/login">
                      <Zap className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <div className="text-3xl font-bold tracking-tight md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-card/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get your portfolio analytics in three simple steps
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Upload Report",
                description: "Export your statement from your broker and upload the CSV file.",
                icon: Upload,
              },
              {
                step: "2",
                title: "Process & Analyze",
                description: "We parse your transactions and calculate comprehensive metrics.",
                icon: LineChart,
              },
              {
                step: "3",
                title: "View Insights",
                description: "Get detailed P&L breakdown, holdings analysis, and dividend tracking.",
                icon: FileText,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="relative h-full border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to track your investments
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools designed for individual investors.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-10 md:p-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
            
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to analyze your portfolio?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Create your free account and get started in minutes. No credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Button size="lg" variant="secondary" className="gap-2 px-8" asChild>
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" variant="secondary" className="gap-2 px-8" asChild>
                      <Link href="/register">
                        Create Free Account
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">Trade Insight</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Trade Insight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
