"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTransactions } from "@/lib/hooks";

export default function TransactionList() {
  const { data: transactions = [], isLoading, error } = useTransactions();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <GlassCard hoverEffect={isLoading}>
      <CardHeader>
        <CardTitle>Your Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading transactions...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-destructive">Error: {error?.message || "An error occurred"}</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">No transactions found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="relative group">
                <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatCurrency(transaction.base_amount, transaction.base_currency)} →{" "}
                      {formatCurrency(transaction.target_amount, transaction.target_currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rate: {transaction.exchange_rate.toFixed(6)}
                    </div>
                    {transaction.description && (
                      <div className="text-sm text-muted-foreground">{transaction.description}</div>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
