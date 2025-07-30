"use client";

import { useState, useEffect, useCallback } from "react";
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

interface ExchangeRateChartProps {
  fromCurrency: string;
  toCurrency: string;
}

interface ChartDataPoint {
  date: string;
  rate: number;
}

interface RateData {
  date: string;
  rates: Record<string, number>;
}

// Simple cache object
const chartDataCache: Record<string, ChartDataPoint[]> = {};

const fetchExchangeRateData = async (
  startDate: DateTime<true>,
  endDate: DateTime<true>,
  fromCurrency: string,
  toCurrency: string
) => {
  const params = {
    startDate: startDate.toUTC().toISODate(),
    endDate: endDate.toUTC().toISODate(),
    base: fromCurrency,
    symbols: toCurrency,
  };
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/exchange-rate?${queryString}`);
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
};

export default function ExchangeRateChart({ fromCurrency, toCurrency }: ExchangeRateChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>("30");
  const [customStartDate, setCustomStartDate] = useState<DateTime>(dates.thirtyDaysAgo);
  const [customEndDate, setCustomEndDate] = useState<DateTime>(dates.today);

  const fetchHistoricalData = useCallback(async () => {
    const cacheKey = `${fromCurrency}-${toCurrency}-${dateRangeOption}`;

    // Check cache first
    if (chartDataCache[cacheKey]) {
      setChartData(chartDataCache[cacheKey]);
      return;
    }

    setChartLoading(true);
    try {
      const endDate = dates.today;
      let startDate = dates.thirtyDaysAgo;

      switch (dateRangeOption) {
        case "custom":
          startDate = customStartDate;
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
          throw new Error(`Invalid date range: ${dateRangeOption}`);
      }

      const data = await fetchExchangeRateData(startDate, endDate, fromCurrency, toCurrency);

      const chartData = data.rates.map((rate: RateData) => ({
        // convert to local time for the chart
        date: DateTime.fromISO(rate.date).toLocal().toISODate(),
        rate: rate.rates[toCurrency],
      }));

      // Cache the result
      chartDataCache[cacheKey] = chartData;
      setChartData(chartData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [fromCurrency, toCurrency, dateRangeOption, customStartDate, customEndDate]);

  // Fetch historical data when currencies or date range changes
  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetchHistoricalData();
    } else {
      setChartData([]);
    }
  }, [
    fromCurrency,
    toCurrency,
    dateRangeOption,
    customStartDate,
    customEndDate,
    fetchHistoricalData,
  ]);

  const getChartTitle = () => {
    if (dateRangeOption === "custom") {
      return `Exchange Rate History (${dateToDisplay(customStartDate)} to ${dateToDisplay(
        customEndDate
      )})`;
    }
    const days = parseInt(dateRangeOption);
    return `Exchange Rate History (Last ${days} days)`;
  };

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

        {chartLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading chart data...</p>
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
