import { NextRequest, NextResponse } from "next/server";
import { storeExchangeRates } from "@/lib/database";
import { fetchLatestRates } from "@/lib/exchange-rate-api";

// This route will be called by Vercel Cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Verify the request is from Vercel Cron
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const currencies = [
      "USD",
      "CAD",
      // TODO:
      // "EUR",
      // "GBP",
      // "JPY",
    ];
    const today = new Date().toISOString().split("T")[0];

    const exchangeRates = [];

    // Fetch rates for each currency as base
    for (const base of currencies) {
      try {
        const data = await fetchLatestRates(base);

        exchangeRates.push({
          date: today,
          base: data.base,
          rates: data.rates,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Failed to fetch rates for ${base}:`, error);
      }
    }

    // Store in database
    await storeExchangeRates(exchangeRates);

    return NextResponse.json({
      success: true,
      message: `Stored ${exchangeRates.length} exchange rate records for ${today}`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
