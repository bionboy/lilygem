"use client";

import { useState } from "react";
import CurrencyConverter from "@/components/currency-converter";
import ExchangeRateChart from "@/components/exchange-rate-chart";

export default function DashboardPage() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CAD");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <CurrencyConverter
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          onFromCurrencyChange={setFromCurrency}
          onToCurrencyChange={setToCurrency}
        />
        <ExchangeRateChart fromCurrency={fromCurrency} toCurrency={toCurrency} />
      </div>
    </div>
  );
}
