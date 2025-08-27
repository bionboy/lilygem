"use client";

import { useState } from "react";
import CurrencyConverter from "@/components/currency-converter";
import ExchangeRateChart from "@/components/exchange-rate-chart";
import TransactionList from "@/components/TransactionTest";

export default function DashboardPage() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CAD");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <CurrencyConverter
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          onFromCurrencyChange={setFromCurrency}
          onToCurrencyChange={setToCurrency}
        />
        <ExchangeRateChart fromCurrency={fromCurrency} toCurrency={toCurrency} />
        <TransactionList />
      </div>
    </div>
  );
}
