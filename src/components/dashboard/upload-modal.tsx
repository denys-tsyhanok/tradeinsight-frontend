"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Badge } from "@/components/ui";
import { reportsApi, type BrokerType } from "@/lib/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
  portfolioId: string;
}

const brokers: { id: BrokerType; name: string; logo: string }[] = [
  { id: "ibkr", name: "Interactive Brokers", logo: "IBKR" },
];

const supportedFormats = [
  { ext: "CSV", icon: FileSpreadsheet, color: "text-chart-1" },
];

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface FileUploadStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function UploadModal({ isOpen, onClose, onUploadComplete, portfolioId }: UploadModalProps) {
  const [selectedBroker, setSelectedBroker] = React.useState<BrokerType | "">("");
  const [selectedFiles, setSelectedFiles] = React.useState<FileUploadStatus[]>([]);
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [currentUploadIndex, setCurrentUploadIndex] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("dragging");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("idle");
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    const validFiles: FileUploadStatus[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      
      if (fileExt !== ".csv") {
        invalidFiles.push(file.name);
      } else {
        // Check for duplicates
        const isDuplicate = selectedFiles.some(
          (existing) => existing.file.name === file.name && existing.file.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push({
            file,
            status: "pending",
            progress: 0,
          });
        }
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(`Invalid format: ${invalidFiles.join(", ")}. Only CSV files are supported.`);
      setUploadState("error");
    } else {
      setErrorMessage("");
      setUploadState("idle");
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1) {
      setErrorMessage("");
      setUploadState("idle");
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedBroker) return;

    setUploadState("uploading");
    setCurrentUploadIndex(0);

    let hasError = false;
    const updatedFiles = [...selectedFiles];

    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentUploadIndex(i);
      updatedFiles[i] = { ...updatedFiles[i], status: "uploading", progress: 0 };
      setSelectedFiles([...updatedFiles]);

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setSelectedFiles((prev) => {
          const updated = [...prev];
          if (updated[i] && updated[i].status === "uploading" && updated[i].progress < 90) {
            updated[i] = { ...updated[i], progress: updated[i].progress + Math.random() * 15 };
          }
          return updated;
        });
      }, 200);

      try {
        await reportsApi.upload(portfolioId, selectedFiles[i].file, selectedBroker);
        
        clearInterval(progressInterval);
        updatedFiles[i] = { ...updatedFiles[i], status: "success", progress: 100 };
        setSelectedFiles([...updatedFiles]);
      } catch (error) {
        clearInterval(progressInterval);
        const err = error as Error;
        updatedFiles[i] = { 
          ...updatedFiles[i], 
          status: "error", 
          progress: 0,
          error: err.message || "Upload failed"
        };
        setSelectedFiles([...updatedFiles]);
        hasError = true;
      }
    }

    if (hasError) {
      setUploadState("error");
      setErrorMessage("Some files failed to upload. Check individual file statuses.");
    } else {
      setUploadState("success");
      setTimeout(() => {
        onUploadComplete?.();
        resetModal();
        onClose();
      }, 1000);
    }
  };

  const resetModal = () => {
    setSelectedFiles([]);
    setSelectedBroker("");
    setUploadState("idle");
    setCurrentUploadIndex(0);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const totalProgress = selectedFiles.length > 0
    ? selectedFiles.reduce((acc, f) => acc + f.progress, 0) / selectedFiles.length
    : 0;

  const successCount = selectedFiles.filter((f) => f.status === "success").length;
  const errorCount = selectedFiles.filter((f) => f.status === "error").length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Upload Reports</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload your broker statements to analyze
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Supported Formats */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Supported formats:</span>
                {supportedFormats.map((format) => (
                  <Badge key={format.ext} variant="secondary" className="gap-1">
                    <format.icon className={cn("h-3 w-3", format.color)} />
                    {format.ext}
                  </Badge>
                ))}
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => uploadState !== "uploading" && fileInputRef.current?.click()}
                className={cn(
                  "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200",
                  uploadState === "dragging"
                    ? "border-primary bg-primary/5"
                    : uploadState === "uploading"
                    ? "cursor-default border-primary/50"
                    : "border-border hover:border-primary/50 hover:bg-tertiary"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-2 font-medium">
                    Drag & drop your files here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse (multiple files supported)
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && uploadState === "error" && (
                <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Selected Files ({selectedFiles.length})
                    </label>
                    {uploadState === "uploading" && (
                      <span className="text-xs text-muted-foreground">
                        Uploading {currentUploadIndex + 1} of {selectedFiles.length}
                      </span>
                    )}
                    {uploadState === "success" && (
                      <span className="text-xs text-success">
                        All {successCount} files uploaded successfully!
                      </span>
                    )}
                    {uploadState === "error" && errorCount > 0 && (
                      <span className="text-xs text-destructive">
                        {errorCount} failed, {successCount} succeeded
                      </span>
                    )}
                  </div>
                  
                  {/* Overall Progress */}
                  {uploadState === "uploading" && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-tertiary">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${totalProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground text-right">
                        {Math.round(totalProgress)}% overall
                      </p>
                    </div>
                  )}

                  <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                    {selectedFiles.map((fileStatus, index) => (
                      <div
                        key={`${fileStatus.file.name}-${index}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                          fileStatus.status === "success"
                            ? "border-success/30 bg-success/5"
                            : fileStatus.status === "error"
                            ? "border-destructive/30 bg-destructive/5"
                            : fileStatus.status === "uploading"
                            ? "border-primary/30 bg-primary/5"
                            : "border-border"
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          {fileStatus.status === "uploading" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : fileStatus.status === "success" ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : fileStatus.status === "error" ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {fileStatus.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fileStatus.status === "error" && fileStatus.error
                              ? fileStatus.error
                              : fileStatus.status === "uploading"
                              ? `${Math.round(fileStatus.progress)}%`
                              : `${(fileStatus.file.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                        {fileStatus.status === "pending" && uploadState !== "uploading" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Broker Selection */}
              <div className="mt-4">
                <label className="text-sm font-medium">Select Broker</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {brokers.map((broker) => (
                    <button
                      key={broker.id}
                      onClick={() => setSelectedBroker(broker.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 text-left transition-all duration-200",
                        selectedBroker === broker.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-tertiary"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold",
                          selectedBroker === broker.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-tertiary text-muted-foreground"
                        )}
                      >
                        {broker.logo}
                      </div>
                      <span className="text-sm font-medium">{broker.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || !selectedBroker || uploadState === "uploading" || uploadState === "success"}
                >
                  {uploadState === "uploading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading {currentUploadIndex + 1}/{selectedFiles.length}...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {selectedFiles.length > 1 ? `${selectedFiles.length} Reports` : "Report"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
