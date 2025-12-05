"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  Zap,
  CloudUpload,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@/components/ui";
import {
  UploadModal,
  ReportStatusBadge,
  type ReportStatus,
  FlexQueryCard,
  FlexQueryConfigModal,
} from "@/components/dashboard";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { reportsApi, type ReportResponseDto, type BrokerType } from "@/lib/api";
import { usePortfolio } from "@/providers";

const brokerConfig: Record<BrokerType, { name: string; logo: string; color: string }> = {
  ibkr: { name: "Interactive Brokers", logo: "IBKR", color: "bg-red-500/20 text-red-400" },
  freedom_finance: { name: "Freedom Finance", logo: "FF", color: "bg-blue-500/20 text-blue-400" },
};

export default function ReportsPage() {
  const { activePortfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isFlexQueryModalOpen, setIsFlexQueryModalOpen] = React.useState(false);
  const [flexQueryKey, setFlexQueryKey] = React.useState(0);
  const [reports, setReports] = React.useState<ReportResponseDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 5;

  // Fetch reports when portfolio changes
  const fetchReports = React.useCallback(async () => {
    if (!activePortfolio) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await reportsApi.list(activePortfolio.id);
      setReports(response.reports);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, [activePortfolio]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Poll for processing reports
  React.useEffect(() => {
    const processingReports = reports.filter(
      (r) => r.status === "pending" || r.status === "processing"
    );

    if (processingReports.length === 0) return;

    const pollInterval = setInterval(() => {
      fetchReports();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [reports, fetchReports]);

  const filteredReports = reports.filter(
    (report) =>
      report.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brokerConfig[report.broker].name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = async (reportId: string) => {
    if (!activePortfolio) return;

    try {
      await reportsApi.delete(activePortfolio.id, reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to delete report");
    }
  };

  const statusCounts = {
    total: reports.length,
    completed: reports.filter((r) => r.status === "completed").length,
    processing: reports.filter((r) => r.status === "processing" || r.status === "pending").length,
    failed: reports.filter((r) => r.status === "failed").length,
  };

  // Show loading if portfolio is loading
  if (isPortfolioLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no portfolio
  if (!activePortfolio) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No Portfolio Selected</h2>
          <p className="text-muted-foreground">
            Create a portfolio to start uploading reports
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Data Sources
            </h1>
            <p className="mt-1 text-muted-foreground">
              Import your trades via automatic sync or manual upload
            </p>
          </div>
        </motion.div>

        {/* Data Sources Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Flex Query Integration Card */}
          <FlexQueryCard
            key={flexQueryKey}
            portfolioId={activePortfolio.id}
            onConfigureClick={() => setIsFlexQueryModalOpen(true)}
            onConfigured={() => {
              setFlexQueryKey((k) => k + 1);
              fetchReports();
            }}
          />

          {/* Manual Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50 transition-colors hover:border-primary/30">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <CloudUpload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Manual Upload</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload CSV or JSON broker statements
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setIsUploadModalOpen(true)} variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </Button>
                </div>
                <div className="border-t border-border bg-tertiary/50 px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    Supports Interactive Brokers and Freedom Finance export formats
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </motion.div>
        )}

        {/* Reports History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold">Reports History</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your imported broker statements
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Total Reports", value: statusCounts.total, color: "text-foreground" },
            { label: "Completed", value: statusCounts.completed, color: "text-success" },
            { label: "In Progress", value: statusCounts.processing, color: "text-chart-2" },
            { label: "Failed", value: statusCounts.failed, color: "text-destructive" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`mt-1 text-3xl font-bold ${stat.color}`}>
                    {isLoading ? "—" : stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </motion.div>

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-heading-sm">All Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          File Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Broker
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedReports.map((report, index) => {
                        const broker = brokerConfig[report.broker];
                        
                        return (
                          <motion.tr
                            key={report.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="group transition-colors hover:bg-tertiary"
                          >
                            {/* File Name */}
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{report.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(report.fileSize / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Broker */}
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex h-7 w-10 items-center justify-center rounded-md text-xs font-bold ${broker.color}`}
                                >
                                  {broker.logo}
                                </span>
                                <span className="text-sm">{broker.name}</span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="whitespace-nowrap px-6 py-4">
                              <ReportStatusBadge status={report.status as ReportStatus} />
                              {report.errorMessage && (
                                <p className="mt-1 text-xs text-destructive">
                                  {report.errorMessage}
                                </p>
                              )}
                            </td>

                            {/* Transactions */}
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              {report.status === "completed" && report.transactionCount ? (
                                <span className="font-medium">
                                  {report.transactionCount.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>

                            {/* Uploaded */}
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <p className="text-sm">{formatDate(report.createdAt)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelativeTime(report.createdAt)}
                                </p>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {report.status === "completed" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  title="Delete"
                                  onClick={() => handleDelete(report.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredReports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">No reports found</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your first broker statement to get started
                  </p>
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-4"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && filteredReports.length > pageSize && (
                <div className="flex items-center justify-between border-t border-border px-6 py-3">
                  <span className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredReports.length)} of{" "}
                    {filteredReports.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={fetchReports}
        portfolioId={activePortfolio.id}
      />

      {/* Flex Query Config Modal */}
      <FlexQueryConfigModal
        isOpen={isFlexQueryModalOpen}
        onClose={() => setIsFlexQueryModalOpen(false)}
        onSuccess={() => {
          setFlexQueryKey((k) => k + 1);
          fetchReports();
        }}
        portfolioId={activePortfolio.id}
      />
    </DashboardLayout>
  );
}
