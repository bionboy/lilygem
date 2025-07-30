"use client";

import { useState, useMemo } from "react";
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
import { DateTime } from "luxon";
import { dateToDisplay } from "@/lib/utils/time";
import { useExchangeRateData, ExchangeRateData } from "@/lib/hooks";

interface ExchangeRateChartProps {
  fromCurrency: string;
  toCurrency: string;
}

const dateRangeOptions = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 60 days", value: "60" },
  { label: "Custom range", value: "custom" },
] as const;
type DateRangeOption = (typeof dateRangeOptions)[number]["value"];

const dates = {
  today: DateTime.now(),
  sevenDaysAgo: DateTime.now().minus({ days: 7 }),
  thirtyDaysAgo: DateTime.now().minus({ days: 30 }),
  sixtyDaysAgo: DateTime.now().minus({ days: 60 }),
} as const;

export default function ExchangeRateChart({ fromCurrency, toCurrency }: ExchangeRateChartProps) {
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>("30");
  const [customStartDate, setCustomStartDate] = useState<DateTime>(dates.thirtyDaysAgo);
  const [customEndDate, setCustomEndDate] = useState<DateTime>(dates.today);

  // Calculate date range based on selected option
  const { startDate, endDate } = useMemo(() => {
    let endDate = dates.today;
    let startDate = dates.thirtyDaysAgo;

    switch (dateRangeOption) {
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      case "7":
        startDate = dates.sevenDaysAgo;
        break;
      case "30":
        startDate = dates.thirtyDaysAgo;
        break;
      case "60":
        startDate = dates.sixtyDaysAgo;
        break;
      default:
        startDate = dates.thirtyDaysAgo;
    }

    return { startDate, endDate };
  }, [dateRangeOption, customStartDate, customEndDate]);

  // Use React Query to fetch data
  const { data, isLoading, error } = useExchangeRateData({
    startDate,
    endDate,
    fromCurrency,
    toCurrency,
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data?.rates) return [];

    return data.rates.map((rate: ExchangeRateData) => ({
      date: DateTime.fromISO(rate.date).toLocal().toISODate(),
      rate: rate.rates[toCurrency],
    }));
  }, [data, toCurrency]);

  const chartTitle = useMemo(() => {
    if (dateRangeOption === "custom") {
      return `Exchange Rate History (${dateToDisplay(customStartDate)} to ${dateToDisplay(
        customEndDate
      )})`;
    }
    const days = parseInt(dateRangeOption);
    return `Exchange Rate History (Last ${days} days)`;
  }, [dateRangeOption, customStartDate, customEndDate]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Date Range Selector */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={dateRangeOption === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRangeOption(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {dateRangeOption === "custom" && (
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateToDisplay(customStartDate)}
                  onChange={(e) => setCustomStartDate(DateTime.fromISO(e.target.value))}
                  max={dateToDisplay(customEndDate)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateToDisplay(customEndDate)}
                  onChange={(e) => setCustomEndDate(DateTime.fromISO(e.target.value))}
                  min={dateToDisplay(customStartDate)}
                  max={dateToDisplay(dates.today)}
                />
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">Error loading chart data</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => DateTime.fromISO(value).toFormat("MM/dd")}
                />
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
