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
  { ext: "JSON", icon: FileText, color: "text-chart-2" },
];

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export function UploadModal({ isOpen, onClose, onUploadComplete, portfolioId }: UploadModalProps) {
  const [selectedBroker, setSelectedBroker] = React.useState<BrokerType | "">("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = React.useState(0);
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
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".csv", ".json"];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    
    if (!validExtensions.includes(fileExt)) {
      setErrorMessage("Invalid file format. Please upload a CSV or JSON file.");
      setUploadState("error");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setUploadState("idle");
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedBroker) return;

    setUploadState("uploading");
    setUploadProgress(0);

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      await reportsApi.upload(portfolioId, selectedFile, selectedBroker);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState("success");
      
      setTimeout(() => {
        onUploadComplete?.();
        resetModal();
        onClose();
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      const err = error as Error;
      setErrorMessage(err.message || "Upload failed. Please try again.");
      setUploadState("error");
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setSelectedBroker("");
    setUploadState("idle");
    setUploadProgress(0);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

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
                  <h2 className="text-xl font-semibold">Upload Report</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload your broker statement to analyze
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
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200",
                  uploadState === "dragging"
                    ? "border-primary bg-primary/5"
                    : uploadState === "error"
                    ? "border-destructive bg-destructive/5"
                    : uploadState === "success"
                    ? "border-success bg-success/5"
                    : "border-border hover:border-primary/50 hover:bg-tertiary"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadState === "uploading" ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-3 font-medium">Uploading...</p>
                    <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-tertiary">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.round(uploadProgress)}% complete
                    </p>
                  </div>
                ) : uploadState === "success" ? (
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-6 w-6 text-success" />
                    </div>
                    <p className="mt-3 font-medium text-success">Upload successful!</p>
                  </div>
                ) : uploadState === "error" ? (
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="mt-3 font-medium text-destructive">{errorMessage}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Click to try again</p>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mt-3 font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="mt-3 font-medium">
                      Drag & drop your file here
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>

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
                  disabled={!selectedFile || !selectedBroker || uploadState === "uploading"}
                >
                  {uploadState === "uploading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Report
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
