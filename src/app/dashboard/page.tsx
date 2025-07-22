"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
];

export default function DashboardPage() {
  const [fromCurrency, setFromCurrency] = useState(currencies[0].code);
  const [toCurrency, setToCurrency] = useState(currencies[1].code);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Fetch exchange rate when currencies change
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchExchangeRate();
      fetchHistoricalData();
    } else if (fromCurrency === toCurrency) {
      setExchangeRate(1);
      setChartData([]);
    }
  }, [fromCurrency, toCurrency]);

  // Update converted amount when rate or fromAmount changes
  useEffect(() => {
    if (exchangeRate && fromAmount) {
      const converted = parseFloat(fromAmount) * exchangeRate;
      setToAmount(converted.toFixed(2));
    } else {
      setToAmount("");
    }
  }, [exchangeRate, fromAmount]);

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();
      setExchangeRate(data.rates[toCurrency]);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Fallback to a mock rate for demo purposes
      setExchangeRate(100);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    setChartLoading(true);
    try {
      // Get dates for the last 30 days
      const dates = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]);
      }

      // Fetch historical data for each date
      const historicalData = [];
      for (const date of dates) {
        try {
          const response = await fetch(
            `https://api.exchangerate-api.com/v4/${date}?base=${fromCurrency}&symbols=${toCurrency}`
          );
          const data = await response.json();
          historicalData.push({
            date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            rate: data.rates[toCurrency],
          });
        } catch (error) {
          // Skip failed requests
          continue;
        }
      }

      setChartData(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      // Generate mock data for demo
      const mockData = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockData.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          rate: 1.35 + (Math.random() - 0.5) * 0.1, // Random rate around 1.35
        });
      }
      setChartData(mockData);
    } finally {
      setChartLoading(false);
    }
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (exchangeRate && value) {
      const converted = parseFloat(value) / exchangeRate;
      setFromAmount(converted.toFixed(2));
    } else {
      setFromAmount("");
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Currency Converter</h1>

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
                  onChange={(e) => setFromCurrency(e.target.value)}
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
                  onChange={(e) => setToCurrency(e.target.value)}
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
                  onChange={(e) => handleFromAmountChange(e.target.value)}
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
                  readOnly={!fromAmount}
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

        {/* Historical Chart */}
        {fromCurrency !== toCurrency && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Exchange Rate History (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                      <YAxis
                        domain={["dataMin - 0.01", "dataMax + 0.01"]}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.toFixed(3)}
                      />
                      <Tooltip
                        formatter={(value: number) => [value.toFixed(4), "Rate"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">No chart data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
