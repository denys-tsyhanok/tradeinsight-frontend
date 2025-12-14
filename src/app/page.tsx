"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  ArrowRight,
  Upload,
  FileText,
  Download,
  Settings,
  BarChart3,
  Zap,
  Check,
  X,
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useAuth } from "@/providers";

// Animated counter component
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  className = "",
  isPositive = true,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  isPositive?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <span className={isPositive ? "text-primary" : "text-destructive"}>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </span>
    </motion.span>
  );
}


// Section navigation items
const sections = [
  { id: "hero", label: "Overview" },
  { id: "holdings", label: "Holdings" },
  { id: "details", label: "Stock Details" },
  { id: "cashflow", label: "Cash Flow" },
  { id: "how-it-works", label: "How It Works" },
];

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("hero");
  const [activeTab, setActiveTab] = useState(0);

  // Track scroll position for progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tab content for interactive stock details
  const stockDetailsTabs = [
    { label: "Overview", image: "/application/q_buys.jpeg" },
    { label: "Buys by Quarter", image: "/application/q_buys.jpeg" },
    { label: "Transactions", image: "/application/q_buys.jpeg" },
  ];

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
            <span className="text-xl font-bold tracking-tight">
              TradeInsight
            </span>
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

      {/* Scroll Progress Indicator - Desktop only */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              document
                .getElementById(section.id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-3"
          >
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-primary w-3 h-3"
                  : "bg-muted-foreground/30 group-hover:bg-muted-foreground"
              }`}
            />
            <span
              className={`text-xs font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
              }`}
            >
              {section.label}
            </span>
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32"
      >
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Finally see how much you{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                actually earned
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Your broker shows balances. TradeInsight shows profits, dividends,
              commissions, and real performance — all calculated from your
              actual trades.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isAuthenticated ? (
                <Button size="lg" className="gap-2 px-8" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="gap-2 px-8" asChild>
                  <Link href="/register">
                    <Upload className="h-4 w-4" />
                    Get Started — Upload Your Broker Report
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Proof of Seriousness */}
            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                Built around IBKR Flex Queries
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                Handles dividends, fees, partial fills
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" />
                No estimates — real calculations
              </span>
            </motion.div>
          </div>

          {/* Dashboard Screenshot with Callouts */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="rounded-xl border border-border/50 bg-card/30 p-2 shadow-2xl overflow-hidden">
              <Image
                src="/application/dashboard.png"
                alt="TradeInsight Dashboard"
                width={1920}
                height={1080}
                className="rounded-lg w-full h-auto"
                quality={100}
                unoptimized
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Before vs After Comparison */}
      <section className="py-20 md:py-32 bg-card/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What you see vs. what you actually know
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border/50 bg-card/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <X className="h-4 w-4 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold">Broker Reports</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Raw transaction history",
                      "No net profit calculation",
                      "Dividends buried in statements",
                      "No per-stock breakdown",
                      "Manual spreadsheet work",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-primary/50 bg-primary/5">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">TradeInsight</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Net profit per stock, fully calculated",
                      "Realized + unrealized P&L separated",
                      "Dividends automatically included",
                      "Commissions tracked and deducted",
                      "Complete portfolio view instantly",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-foreground"
                      >
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Holdings Section with Metric Strip */}
      <section id="holdings" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Pain Statement */}
          <motion.p
            className="text-center text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Most investors only see balances — not real profit.
          </motion.p>

          {/* Header */}
          <motion.div
            className="mx-auto max-w-3xl text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              See exactly what each position earned
            </h2>
          </motion.div>

          {/* Animated Metric Strip */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {[
              {
                value: 286502,
                label: "NVDA Net Profit",
                prefix: "+$",
                isPositive: true,
              },
              {
                value: 65666,
                label: "PLTR Net Profit",
                prefix: "+$",
                isPositive: true,
              },
              {
                value: 386,
                label: "Dividends Earned",
                prefix: "+$",
                isPositive: true,
              },
              {
                value: 438,
                label: "Total Commissions",
                prefix: "-$",
                isPositive: false,
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center p-6 rounded-xl bg-card/50 border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  <AnimatedNumber
                    value={metric.value}
                    prefix={metric.prefix}
                    isPositive={metric.isPositive}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-sm text-muted-foreground mb-8">
            All calculated automatically from broker data.
          </p>

          {/* Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-xl border border-border/50 bg-card/30 p-2 shadow-2xl overflow-hidden">
              <Image
                src="/application/holdings.png"
                alt="Holdings Table"
                width={1920}
                height={1080}
                className="rounded-lg w-full h-auto"
                quality={100}
                unoptimized
              />
            </div>
          </motion.div>

          {/* Result Statement */}
          <motion.p
            className="text-center text-lg text-foreground mt-8 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Now you know which positions made you money — and which didn&apos;t.
          </motion.p>
        </div>
      </section>

      {/* Stock Details Section - Interactive Tabs */}
      <section id="details" className="py-20 md:py-32 bg-card/30">
        <div className="mx-auto max-w-7xl px-6">
          {/* Pain Statement */}
          <motion.p
            className="text-center text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Clicking through broker statements takes hours. Understanding your
            timing? Nearly impossible.
          </motion.p>

          {/* Header */}
          <motion.div
            className="mx-auto max-w-3xl text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Go deep into every position
            </h2>
            <p className="mt-4 text-muted-foreground">
              Click any stock to see the full picture — instantly.
            </p>
          </motion.div>

          {/* Interactive Tabs */}
          <motion.div
            className="flex justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {stockDetailsTabs.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-xl border border-border/50 bg-card/50 p-2 shadow-2xl overflow-hidden">
              <Image
                src={stockDetailsTabs[activeTab].image}
                alt="Stock Details"
                width={1920}
                height={1080}
                className="rounded-lg w-full h-auto"
                quality={100}
                unoptimized
              />
            </div>
          </motion.div>

          {/* Result Statement */}
          <motion.p
            className="text-center text-lg text-foreground mt-8 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Understand your conviction, timing, and long-term performance at a
            glance.
          </motion.p>
        </div>
      </section>

      {/* Cash Flow Section */}
      <section id="cashflow" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Pain Statement */}
          <motion.p
            className="text-center text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            &quot;How much did I actually invest?&quot; — A question your broker
            can&apos;t easily answer.
          </motion.p>

          {/* Header */}
          <motion.div
            className="mx-auto max-w-3xl text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Track every dollar in and out
            </h2>
          </motion.div>

          {/* Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-xl border border-border/50 bg-card/30 p-2 shadow-2xl overflow-hidden">
              <Image
                src="/application/deposits.jpeg"
                alt="Deposits and Withdrawals"
                width={1920}
                height={1080}
                className="rounded-lg w-full h-auto"
                quality={100}
                unoptimized
              />
            </div>
          </motion.div>

          {/* Result Statement */}
          <motion.p
            className="text-center text-lg text-foreground mt-8 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            You always know exactly how much you invested and how much your
            portfolio grew.
          </motion.p>
        </div>
      </section>

      {/* How It Works - Visual Timeline */}
      <section id="how-it-works" className="py-20 md:py-32 bg-card/30">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From broker report to full portfolio view
            </h2>
            <p className="mt-4 text-muted-foreground">
              Simple, secure, and automatic.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

            {[
              {
                step: "1",
                title: "Export from your broker",
                description:
                  "Download Activity Statements or set up Flex Queries in IBKR",
                icon: Download,
              },
              {
                step: "2",
                title: "Connect or upload",
                description:
                  "Link your Flex Query for automatic sync, or upload CSV/XML files",
                icon: Upload,
              },
              {
                step: "3",
                title: "Automatic processing",
                description:
                  "We parse every trade, dividend, fee, and corporate action",
                icon: Zap,
              },
              {
                step: "4",
                title: "Your portfolio, explained",
                description:
                  "Explore profits, performance, and insights — instantly",
                icon: BarChart3,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Content */}
                <div
                  className={`flex-1 ${
                    index % 2 === 0 ? "md:text-right" : "md:text-left"
                  }`}
                >
                  <div
                    className={`inline-flex items-center gap-3 ${
                      index % 2 === 0
                        ? "md:flex-row-reverse"
                        : "md:flex-row"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step number - center */}
                <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shrink-0 z-10">
                  {item.step}
                </div>

                {/* Empty space for alignment */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>

          {/* Reports Screenshot */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mx-auto max-w-4xl rounded-xl border border-border/50 bg-card/30 p-2 shadow-xl overflow-hidden">
              <Image
                src="/application/reports.jpeg"
                alt="Reports and Flex Query Connection"
                width={1200}
                height={600}
                className="rounded-lg w-full h-auto"
                quality={100}
                unoptimized
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for investors who take their portfolio seriously
            </h2>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: "Real data, real calculations",
                  description:
                    "Every number comes directly from your broker reports. No estimates.",
                },
                {
                  icon: Settings,
                  title: "Handles edge cases",
                  description:
                    "Partial fills, stock splits, dividends, corporate actions — all processed correctly.",
                },
                {
                  icon: Check,
                  title: "Your data stays yours",
                  description:
                    "Processed securely. Never shared. You&apos;re always in control.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="p-6 rounded-xl bg-card/30 border border-border/50"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <item.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary p-10 md:p-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Finally see how much you actually earned
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Your portfolio — fully explained.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2 px-8"
                    asChild
                  >
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 px-8"
                      asChild
                    >
                      <Link href="/register">
                        Start Analyzing Your Portfolio
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-white hover:bg-white/10 hover:text-white"
                      asChild
                    >
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
              <span className="font-semibold">TradeInsight</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TradeInsight. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
