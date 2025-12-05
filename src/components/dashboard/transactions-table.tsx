"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";

interface Transaction {
  id: string;
  date: Date | string;
  type: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  price: number;
  amount: number;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  title?: string;
  showPagination?: boolean;
  pageSize?: number;
  className?: string;
}

type SortField = "date" | "symbol" | "quantity" | "price" | "amount";
type SortDirection = "asc" | "desc";

export function TransactionsTable({
  transactions,
  title = "Recent Transactions",
  showPagination = true,
  pageSize = 5,
  className,
}: TransactionsTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [transactions, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const paginatedTransactions = showPagination
    ? sortedTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedTransactions;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={className}
    >
      <Card className="border-border/50 bg-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-heading-sm">{title}</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("symbol")}
                  >
                    <div className="flex items-center gap-1">
                      Symbol
                      <SortIcon field="symbol" />
                    </div>
                  </th>
                  <th
                    className="group cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("quantity")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Qty
                      <SortIcon field="quantity" />
                    </div>
                  </th>
                  <th
                    className="group cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Price
                      <SortIcon field="price" />
                    </div>
                  </th>
                  <th
                    className="group cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="transition-colors hover:bg-tertiary"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge
                        variant={transaction.type === "BUY" ? "success" : "destructive"}
                        className="gap-1"
                      >
                        {transaction.type === "BUY" ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      {transaction.symbol}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {transaction.quantity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-3">
              <span className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, sortedTransactions.length)} of{" "}
                {sortedTransactions.length}
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
  );
}

