import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchHistoricalRates, fetchLatestRates } from "@/lib/exchange-rate-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") || "USD";
  const symbols = searchParams.get("symbols") || "CAD";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0];

  if (!startDate) {
    return NextResponse.json({ error: "startDate is required" }, { status: 400 });
  }

  try {
    // 1. Check what data we have in the database
    const { data: existingPairs, error: dbError } = await supabaseAdmin
      .from("exchange_rate_pairs")
      .select("date, base_currency, target_currency, rate")
      .eq("base_currency", base)
      .in("target_currency", symbols.split(","))
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // 2. Identify missing dates
    const existingDates = new Set(existingPairs?.map((pair) => pair.date) || []);
    const missingDates = [];

    const currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (currentDate <= endDateTime) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (!existingDates.has(dateStr)) {
        missingDates.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Fetch missing data from external API
    const fetchedPairs = [];
    for (const date of missingDates) {
      try {
        let data;

        // Use latest rates API for today's date, historical API for past dates
        const today = new Date().toISOString().split("T")[0];
        if (date === today) {
          data = await fetchLatestRates(base);
          // Transform latest rates data to match historical format
          data = {
            base: data.base_code,
            rates: data.conversion_rates,
            date: today,
          };
        } else {
          data = await fetchHistoricalRates(base, date);
        }

        // Convert to pairs and store
        const pairs = [];
        for (const [targetCurrency, rateValue] of Object.entries(data.rates)) {
          pairs.push({
            date: date,
            base_currency: data.base,
            target_currency: targetCurrency,
            rate: rateValue as number,
            created_at: new Date().toISOString(),
          });
        }

        // Store in database
        await supabaseAdmin
          .from("exchange_rate_pairs")
          .upsert(pairs, { onConflict: "date,base_currency,target_currency" });

        fetchedPairs.push(...pairs);
      } catch (error) {
        console.error(`Failed to fetch rates for ${date}:`, error);
      }
    }

    // 4. Combine and return all data
    const allPairs = [...(existingPairs || []), ...fetchedPairs].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 5. Group by date for easier frontend consumption
    const ratesByDate = allPairs.reduce((acc, pair) => {
      if (!acc[pair.date]) {
        acc[pair.date] = {
          date: pair.date,
          base: pair.base_currency,
          rates: {},
        };
      }
      acc[pair.date].rates[pair.target_currency] = pair.rate;
      return acc;
    }, {} as Record<string, { date: string; base: string; rates: Record<string, number> }>);

    const rates = Object.values(ratesByDate);

    return NextResponse.json({
      base,
      symbols: symbols.split(","),
      startDate,
      endDate,
      totalRecords: rates.length,
      fetchedRecords: fetchedPairs.length,
      rates,
    });
  } catch (error) {
    console.error("Exchange rate API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
