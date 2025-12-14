"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Settings,
  FileText,
  Key,
  Zap,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function FlexQueryGuidePage() {
  const [copiedItem, setCopiedItem] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const steps = [
    {
      number: 1,
      title: "Create a FlexQuery in Account Management",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Log in to your Interactive Brokers Account Management portal and navigate to:
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-tertiary px-4 py-3 font-mono text-sm">
            <span className="text-primary">Reports</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-primary">Flex Queries</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-primary">Create</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a
              href="https://www.interactivebrokers.com/AccountManagement/AmAuthentication?action=TA_FLEX_QUERIES"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open IBKR Flex Queries
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      ),
    },
    {
      number: 2,
      title: "Required Sections to Include",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            When creating your FlexQuery, make sure to enable <strong>all</strong> of these sections
            with <strong>All Fields</strong> selected:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { name: "Trades", desc: "Stock and option trades" },
              { name: "Cash Transactions", desc: "Dividends, fees, interest" },
              { name: "Transfers", desc: "Deposits and withdrawals" },
              { name: "Corporate Actions", desc: "Splits, mergers, spinoffs" },
              { name: "Option EAE", desc: "Option exercises & assignments" },
              { name: "Open Positions", desc: "Current holdings" },
            ].map((section) => (
              <div
                key={section.name}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <div>
                  <p className="font-medium">{section.name}</p>
                  <p className="text-xs text-muted-foreground">{section.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
            <p className="text-sm text-warning">
              <strong>Important:</strong> For each section, click "Select All" to include all available fields.
              This ensures Trade Insight can properly analyze your data.
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: "FlexQuery Settings",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Configure these settings for optimal compatibility:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-tertiary">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Setting
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { setting: "Format", value: "XML", status: "Required", required: true },
                  { setting: "Period", value: "Daily (1 Day)", status: "Recommended", required: false },
                  { setting: "Date Format", value: "yyyyMMdd", status: "Required", required: true },
                  { setting: "Time Format", value: "HHmmss", status: "Required", required: true },
                  { setting: "Date/Time Separator", value: "; (semi-colon)", status: "Required", required: true },
                  { setting: "Include Account Information", value: "Yes", status: "Required", required: true },
                  { setting: "Include Canceled Trades", value: "No", status: "Recommended", required: false },
                ].map((row) => (
                  <tr key={row.setting} className="hover:bg-tertiary/50">
                    <td className="px-4 py-3 text-sm font-medium">{row.setting}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-tertiary px-2 py-1 text-xs text-primary">
                        {row.value}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                          row.required
                            ? "bg-success/20 text-success"
                            : "bg-primary/20 text-primary"
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
            <p className="text-sm">
              <strong>💡 About Period Setting:</strong> We recommend "Daily (1 Day)" as Trade Insight 
              syncs your data automatically every day. If you notice missing transactions, you can 
              temporarily change the period to a longer range.
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: "Get Your Credentials",
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            After creating the FlexQuery, you'll need two pieces of information:
          </p>
          
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Query ID</p>
                  <p className="text-sm text-muted-foreground">
                    Shown next to your FlexQuery name (e.g., <code className="text-primary">123456</code>)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Flex Web Service Token</p>
                  <p className="text-sm text-muted-foreground">Generate from:</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-tertiary px-4 py-2 font-mono text-sm">
                <span className="text-primary">Settings</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">Reporting</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">FlexQuery Web Service</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
            <p className="text-sm">
              <strong>💡 Tip:</strong> Keep your token secure! It provides read-only access to your account data.
              You can regenerate it anytime from IBKR settings.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">FlexQuery Setup Guide</h1>
            <p className="text-muted-foreground">
              Configure automatic trade syncing with Interactive Brokers
            </p>
          </div>
        </motion.div>

        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">What is FlexQuery?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  FlexQuery is IBKR's powerful reporting API that allows Trade Insight to automatically 
                  sync your trades, dividends, and transfers. Once configured, your portfolio updates 
                  automatically—no manual uploads needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/20">
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-warning">Important: Upload Historical Data First</h3>
                  <p className="text-sm text-muted-foreground">
                    Due to IBKR API constraints, FlexQuery cannot retrieve your complete trading history. 
                    We recommend this approach:
                  </p>
                  <ol className="mt-3 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning">1</span>
                      <span><strong>First</strong>, download Activity Statements for all your trading years from IBKR</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning">2</span>
                      <span><strong>Then</strong>, upload them to Trade Insight to build your complete history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/20 text-xs font-bold text-warning">3</span>
                      <span><strong>Finally</strong>, set up FlexQuery for automatic daily syncing going forward</span>
                    </li>
                  </ol>
                  <div className="mt-3">
                    <Link
                      href="/guides/activity-statement"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Learn how to download Activity Statements
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <span className="text-lg font-bold">{step.number}</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                      </div>
                      {step.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <h3 className="font-semibold">Additional Resources</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href="https://www.interactivebrokers.com/en/software/am/am/reports/activityflexqueries.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official IBKR FlexQuery Docs
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link href="/guides/activity-statement">
                    Activity Statement Guide
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex justify-center py-6"
        >
          <Button size="lg" className="gap-2" asChild>
            <Link href="/reports">
              <Zap className="h-4 w-4" />
              Connect Your FlexQuery
            </Link>
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

