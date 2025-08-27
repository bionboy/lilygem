"use client";

import { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";

interface Transaction {
  id: number;
  date: string;
  base_currency: string;
  target_currency: string;
  base_amount: number;
  target_amount: number;
  exchange_rate: number;
  description?: string;
  created_at: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <GlassCard hoverEffect>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading transactions...</div>
          </div>
        </CardContent>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-destructive">Error: {error}</div>
          </div>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle>Your Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">No transactions found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="relative group">
                {/* Glass effect for individual transaction */}
                <div className="absolute inset-0 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl p-4 space-y-2 hover:bg-white/20 dark:hover:bg-gray-900/20 transition-all duration-300">
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
                        <div className="text-sm text-muted-foreground">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </div>
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
