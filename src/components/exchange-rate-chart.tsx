"use client";

import { useState, useMemo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
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
  ReferenceLine,
} from "recharts";
import { DateTime } from "luxon";
import { dateToDisplay } from "@/lib/utils/time";
import { useExchangeRateData, ExchangeRateData, useLatestExchangeRate } from "@/lib/hooks";
import { cn } from "@/lib/utils";

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

  const rateHistory = useExchangeRateData({
    startDate,
    endDate,
    fromCurrency,
    toCurrency,
  });

  const liveRate = useLatestExchangeRate({
    fromCurrency,
    toCurrency,
  });

  // Transform data for chart
  // TODO (@bionboy, 25-07-31): PERFORMANCE: prefetch 60 days of data and on change of date range option just move the window of what data is shown.
  // https://github.com/bionboy/lilygem/issues/3
  const chartData = useMemo(() => {
    if (!rateHistory?.data?.rates) return [];

    return rateHistory.data.rates.map((rate: ExchangeRateData) => ({
      date: DateTime.fromISO(rate.date).toLocal().toISODate(),
      rate: rate.rates[toCurrency],
    }));
  }, [rateHistory, toCurrency]);

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
    <GlassCard className="mt-6 backdrop-blur-3xl">
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
                className={cn(
                  "bg-white/10 backdrop-blur-sm border-white/30  hover:bg-white/30 hover:text-white",
                  dateRangeOption === option.value && "bg-white/20 text-accent-foreground"
                )}
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
                  className="bg-white/10 backdrop-blur-sm border-white/20 focus:bg-white/15"
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
                  className="bg-white/10 backdrop-blur-sm border-white/20 focus:bg-white/15"
                />
              </div>
            </div>
          )}
        </div>

        {rateHistory.isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading chart data...</p>
          </div>
        ) : rateHistory.error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-destructive">Error loading chart data</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--secondary-foreground)"
                  strokeOpacity={0.4}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => DateTime.fromISO(value).toFormat("MM/dd")}
                  stroke="var(--secondary-foreground)"
                />
                <YAxis
                  domain={["dataMin - 0.01", "dataMax + 0.01"]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(3)}
                  stroke="var(--secondary-foreground)"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className=" font-medium bg-background/50 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
                          <p>Date: {label}</p>
                          <p>Rate: {payload[0].value?.toFixed(4)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {liveRate.data && (
                  <ReferenceLine
                    // <ReferenceDot
                    x={DateTime.now().toISO()}
                    y={liveRate.data}
                    r={6}
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                      content: ({ viewBox }) => (
                        <g>
                          <text
                            // @ts-expect-error: viewBox may not have x/y, but we assume Cartesian here
                            x={viewBox.x + 10}
                            // @ts-expect-error: viewBox may not have x/y, but we assume Cartesian here
                            y={viewBox.y - 10}
                            fill="var(--secondary-foreground)"
                            fontWeight="bold"
                          >
                            Live Rate
                          </text>
                        </g>
                      ),
                    }}
                    ifOverflow="extendDomain"
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-5)", strokeWidth: 2, r: 3 }}
                  activeDot={{
                    r: 8,
                    stroke: "var(--chart-1)",
                    strokeWidth: 4,
                  }}
                />
                {/* TODO (@bionboy, 25-08-05): Add reference points or maybe another line for user transactions */}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No chart data available</p>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
