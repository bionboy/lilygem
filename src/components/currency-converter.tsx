"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
];

interface CurrencyConverterProps {
  fromCurrency: string;
  toCurrency: string;
  onFromCurrencyChange: (currency: string) => void;
  onToCurrencyChange: (currency: string) => void;
}

export default function CurrencyConverter({
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
}: CurrencyConverterProps) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExchangeRate = useCallback(async () => {
    setLoading(true);
    try {
      // Get today's rate using enhanced API
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/exchange-rate?startDate=${today}&base=${fromCurrency}&symbols=${toCurrency}`
      );
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      // Get the rate from the first (and only) record
      const rate = data.rates[0]?.rates[toCurrency];
      setExchangeRate(rate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Fallback to a mock rate for demo purposes
      setExchangeRate(100);
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency]);

  // Fetch exchange rate when currencies change
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchExchangeRate();
    } else if (fromCurrency === toCurrency) {
      setExchangeRate(1);
    }
  }, [fromCurrency, toCurrency, fetchExchangeRate]);

  // Update converted amount when rate or fromAmount changes
  useEffect(() => {
    if (exchangeRate && fromAmount) {
      const converted = parseFloat(fromAmount) * exchangeRate;
      setToAmount(converted.toFixed(2));
    } else {
      setToAmount("");
    }
  }, [exchangeRate, fromAmount]);

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (exchangeRate && value) {
      const converted = parseFloat(value) / exchangeRate;
      setFromAmount(converted.toFixed(2));
    } else {
      setFromAmount("");
    }
  };

  const swapCurrencies = useCallback(() => {
    onFromCurrencyChange(toCurrency);
    onToCurrencyChange(fromCurrency);
  }, [fromCurrency, toCurrency, onFromCurrencyChange, onToCurrencyChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convert Currency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 items-end justify-between">
          {/* From Currency */}
          <div className="space-y-2">
            <Label htmlFor="from-currency">From</Label>
            <select
              id="from-currency"
              value={fromCurrency}
              onChange={(e) => onFromCurrencyChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          {/* Swap Button */}
          <div className="flex justify-center">
            <Button onClick={swapCurrencies} variant="outline" className="px-4 py-2">
              <ArrowLeftRight />
              Swap
            </Button>
          </div>
          {/* To Currency */}
          <div className="space-y-2">
            <Label htmlFor="to-currency">To</Label>
            <select
              id="to-currency"
              value={toCurrency}
              onChange={(e) => onToCurrencyChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Amount */}
          <div className="space-y-2">
            <Label htmlFor="from-amount">Amount</Label>
            <Input
              id="from-amount"
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* To Amount */}
          <div className="space-y-2">
            <Label htmlFor="to-amount">Converted Amount</Label>
            <Input
              id="to-amount"
              type="number"
              placeholder="0.00"
              value={toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>

        {/* Exchange Rate Display */}
        {exchangeRate && fromCurrency !== toCurrency && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
            {loading && <p className="text-xs text-blue-600 mt-1">Updating rate...</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
