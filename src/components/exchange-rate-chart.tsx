"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dateRangeOptions = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Custom range", value: "custom" },
];

interface ExchangeRateChartProps {
  fromCurrency: string;
  toCurrency: string;
}

export default function ExchangeRateChart({ fromCurrency, toCurrency }: ExchangeRateChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [dateRange, setDateRange] = useState("7");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Set default custom dates when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setCustomEndDate(today);
    setCustomStartDate(sevenDaysAgo);
  }, []);

  // Fetch historical data when currencies or date range changes
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchHistoricalData();
    } else {
      setChartData([]);
    }
  }, [fromCurrency, toCurrency, dateRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date().toISOString().split("T")[0];

    if (dateRange === "custom") {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    const days = parseInt(dateRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return { startDate, endDate };
  };

  const fetchHistoricalData = async () => {
    setChartLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      const response = await fetch(
        `/api/exchange-rate?startDate=${startDate}&endDate=${endDate}&base=${fromCurrency}&symbols=${toCurrency}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform data for the chart
      const chartData = data.rates.map((rate: any) => ({
        date: rate.date,
        rate: rate.rates[toCurrency],
      }));

      setChartData(chartData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const getChartTitle = () => {
    if (dateRange === "custom") {
      return `Exchange Rate History (${customStartDate} to ${customEndDate})`;
    }
    const days = parseInt(dateRange);
    return `Exchange Rate History (Last ${days} days)`;
  };

  // Don't render if currencies are the same
  if (fromCurrency === toCurrency) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Date Range Selector */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
        </div>

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
  );
}
