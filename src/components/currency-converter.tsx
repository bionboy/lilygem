"use client";

import { useState, useEffect, useCallback } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { useLatestExchangeRate } from "@/lib/hooks";

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

  const {
    data: exchangeRate,
    isLoading,
    error,
  } = useLatestExchangeRate({
    fromCurrency,
    toCurrency,
  });

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
    <LiquidGlassCard>
      <CardHeader>
        <CardTitle className="text-white/90">Convert Currency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:items-end">
          {/* From Currency */}
          <div className="space-y-2">
            <Label htmlFor="from-currency" className="text-white/80">
              From
            </Label>
            <Select value={fromCurrency} onValueChange={onFromCurrencyChange}>
              <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white/90 hover:bg-white/15">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem
                    key={currency.code}
                    value={currency.code}
                    disabled={currency.code === toCurrency}
                  >
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={swapCurrencies}
              variant="outline"
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white/90 hover:text-white transition-all duration-300"
            >
              <ArrowLeftRight className="hidden sm:block" />
              <ArrowUpDown className="block sm:hidden" />
              Swap
            </Button>
          </div>
          {/* To Currency */}
          <div className="-mt-4 sm:mt-0 space-y-2">
            <Label htmlFor="to-currency" className="text-white/80">
              To
            </Label>
            <Select value={toCurrency} onValueChange={onToCurrencyChange}>
              <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white/90 hover:bg-white/15">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem
                    key={currency.code}
                    value={currency.code}
                    disabled={currency.code === fromCurrency}
                  >
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Amount */}
          <div className="space-y-2">
            <Label htmlFor="from-amount" className="text-white/80">
              Amount
            </Label>
            <Input
              id="from-amount"
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white/90 placeholder:text-white/50 focus:bg-white/15"
            />
          </div>

          {/* To Amount */}
          <div className="space-y-2">
            <Label htmlFor="to-amount" className="text-white/80">
              Converted Amount
            </Label>
            <Input
              id="to-amount"
              type="number"
              placeholder="0.00"
              value={toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              className="text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white/90 placeholder:text-white/50 focus:bg-white/15"
            />
          </div>
        </div>

        {/* Exchange Rate Display */}
        {exchangeRate && fromCurrency !== toCurrency && (
          <div className="text-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
            <p className="text-sm text-white/70">
              Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
            {isLoading && <p className="text-xs text-blue-300 mt-1">Updating rate...</p>}
            {error && <p className="text-xs text-red-300 mt-1">Error loading rate</p>}
          </div>
        )}
      </CardContent>
    </LiquidGlassCard>
  );
}
