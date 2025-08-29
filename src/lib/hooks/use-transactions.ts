import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  baseCurrency?: string;
  targetCurrency?: string;
}

type Transaction = {
  id: number;
  date: string;
  base_currency: string;
  target_currency: string;
  base_amount: number;
  target_amount: number;
  exchange_rate: number;
  description?: string;
  created_at: string;
  updated_at: string;
};

// API response types
type GetTransactionsResponse = {
  transactions: Transaction[];
};

type PostTransactionResponse = {
  transaction: Transaction;
};

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async (): Promise<Transaction[]> => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.set("startDate", filters.startDate);
      if (filters?.endDate) params.set("endDate", filters.endDate);
      if (filters?.baseCurrency) params.set("baseCurrency", filters.baseCurrency);
      if (filters?.targetCurrency) params.set("targetCurrency", filters.targetCurrency);

      const response = await fetch(`/api/transactions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const { transactions }: GetTransactionsResponse = await response.json();
      return transactions;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction): Promise<Transaction> => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to create transaction");

      const { transaction: newTransaction }: PostTransactionResponse = await response.json();
      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
