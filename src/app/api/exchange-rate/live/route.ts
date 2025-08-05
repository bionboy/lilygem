import { NextRequest, NextResponse } from "next/server";
import { fetchLatestRates } from "@/lib/exchange-rate-api";
import { ExchangeRateApiResponse } from "@/lib/types";

// Simple in-memory cache with expiration
interface CacheEntry {
  data: {
    base: string;
    rates: Record<string, number>;
  };
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

function getCacheKey(base: string, _symbols: string): string {
  // return `${base}:${symbols}`;
  // only cache on base because API should return rate to all targets
  return `${base}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base");
  const target = searchParams.get("target");
  const skipCache = searchParams.get("skipCache");

  if (!base || !target) {
    return NextResponse.json({ error: "base and target are required" }, { status: 400 });
  }

  const cacheKey = getCacheKey(base, target);
  const cachedEntry = cache.get(cacheKey);

  // Return cached data if it's still valid
  if (!skipCache && cachedEntry && isCacheValid(cachedEntry)) {
    return NextResponse.json({
      // only return the target rate, cache has all rates
      rate: cachedEntry.data.rates[target],
      cached: true,
      cacheTimestamp: new Date(cachedEntry.timestamp).toISOString(),
    });
  }

  try {
    // Fetch latest rates from external API
    const data = await fetchLatestRates(base);

    const cacheData = {
      base: data.base_code,
      rates: data.conversion_rates,
    };

    // Cache the response
    cache.set(cacheKey, {
      data: cacheData,
      timestamp: Date.now(),
    });

    // Only return a single rate, not all rates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rates, ...responseData } = {
      ...cacheData,
      rate: data.conversion_rates?.[target],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Live exchange rate API error:", error);
    return NextResponse.json({ error: "Failed to fetch live exchange rates" }, { status: 500 });
  }
}
