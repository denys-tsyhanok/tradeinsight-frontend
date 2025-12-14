"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Info,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function ActivityStatementGuidePage() {
  const steps = [
    {
      number: 1,
      title: "Navigate to Statements",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Log in to your Interactive Brokers Account Management and go to:
          </p>
          <div className="flex items-center gap-2 rounded-lg bg-tertiary px-4 py-3 font-mono text-sm">
            <span className="text-primary">Reports</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-primary">Statements</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a
              href="https://www.interactivebrokers.com/AccountManagement/AmAuthentication?action=TA_STATEMENTS"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open IBKR Statements
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      ),
    },
    {
      number: 2,
      title: "Select Activity Statement",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Under "Default Statements", click on <strong>Activity Statement</strong>. 
            This report contains all your trades, dividends, and transfers.
          </p>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Activity Statement includes:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Stock and option trades</li>
                  <li>• Dividends and interest</li>
                  <li>• Deposits and withdrawals</li>
                  <li>• Fees and commissions</li>
                  <li>• Open positions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: "Choose Period & Download",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Select the period for your statement and download as CSV:
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold">Annual Statement</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For past years' complete trading history
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Period:</span>
                  <Badge variant="secondary">Annual</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <Badge variant="secondary">2024</Badge>
                  <span className="text-xs text-muted-foreground">(or earlier years)</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">YTD Statement</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                For current year's trading activity
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Period:</span>
                  <Badge variant="secondary">Year to Date</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <Badge variant="secondary">Current Year</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-success/50 bg-success/10 p-4">
            <FileSpreadsheet className="h-8 w-8 text-success" />
            <div>
              <p className="font-medium">Click "Download CSV"</p>
              <p className="text-sm text-muted-foreground">
                Make sure to select CSV format, not PDF or HTML
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: "Upload to Trade Insight",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Once downloaded, upload the CSV file to Trade Insight:
          </p>
          
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <span className="text-sm">Go to the Reports page in Trade Insight</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <span className="text-sm">Click "Upload File" in the Manual Upload section</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <span className="text-sm">Select your downloaded CSV file</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                4
              </span>
              <span className="text-sm">Choose "Interactive Brokers" as the broker</span>
            </li>
          </ol>
        </div>
      ),
    },
  ];

  const tips = [
    {
      title: "Download Multiple Years",
      description: "Upload statements for each year separately to build complete history",
    },
    {
      title: "Current Year",
      description: "Use YTD (Year to Date) for the current year's activity",
    },
    {
      title: "Duplicate Prevention",
      description: "Trade Insight automatically detects and skips duplicate transactions",
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
            <h1 className="text-2xl font-bold">Download Activity Statement</h1>
            <p className="text-muted-foreground">
              How to export your trading history from Interactive Brokers
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
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Manual Import</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Download your Activity Statement from IBKR and upload it to Trade Insight. 
                  This is the quickest way to import your trading history without setting up 
                  automatic syncing.
                </p>
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
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      {step.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Pro Tips
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {tips.map((tip) => (
                  <div key={tip.title} className="rounded-lg bg-tertiary p-4">
                    <p className="font-medium">{tip.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4 py-6"
        >
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <Link href="/guides/flex-query">
              Set Up Auto-Sync Instead
            </Link>
          </Button>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/reports">
              <Download className="h-4 w-4" />
              Upload Your Statement
            </Link>
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

