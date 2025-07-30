import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchLatestRates } from "@/lib/exchange-rate-api";
import { getCurrentUTCDate } from "@/lib/utils/time";

export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getCurrentUTCDate();
  const baseCurrencies = ["USD", "CAD"]; // Add more base currencies here as needed

  try {
    console.log(`[CRON] Starting exchange rate update for ${today}`);

    let totalStored = 0;
    const allResults = [];

    for (const baseCurrency of baseCurrencies) {
      try {
        console.log(`[CRON] Processing base currency: ${baseCurrency}`);

        // Fetch latest rates from external API to get all available currencies
        const latestRates = await fetchLatestRates(baseCurrency);
        const targetCurrencies = Object.keys(latestRates.conversion_rates).filter(
          (currency) => currency !== baseCurrency
        );

        // Check what rates we already have for today
        const { data: existingRates, error: dbError } = await supabaseAdmin
          .from("exchange_rate_pairs")
          .select("target_currency, rate")
          .eq("date", today)
          .eq("base_currency", baseCurrency)
          .in("target_currency", targetCurrencies);

        if (dbError) {
          console.error(
            `[CRON] Database error checking existing rates for ${baseCurrency}:`,
            dbError
          );
          continue; // Skip this base currency and continue with next
        }

        const existingCurrencies = new Set(
          existingRates?.map((rate) => rate.target_currency) || []
        );
        const missingCurrencies = targetCurrencies.filter(
          (currency) => !existingCurrencies.has(currency)
        );

        if (missingCurrencies.length === 0) {
          console.log(`[CRON] All rates for ${baseCurrency} on ${today} already exist in database`);
          allResults.push({
            baseCurrency,
            message: "All rates already exist",
            existingCount: existingRates?.length || 0,
          });
          continue;
        }

        console.log(
          `[CRON] Storing missing rates for ${baseCurrency}: ${missingCurrencies.join(", ")}`
        );

        // Prepare pairs to insert using already fetched rates
        const pairsToInsert = missingCurrencies.map((currency) => ({
          date: today,
          base_currency: baseCurrency,
          target_currency: currency,
          rate: latestRates.conversion_rates[currency],
          created_at: today,
        }));

        // Store in database
        const { error: insertError } = await supabaseAdmin
          .from("exchange_rate_pairs")
          .upsert(pairsToInsert, { onConflict: "date,base_currency,target_currency" });

        if (insertError) {
          console.error(`[CRON] Error storing rates for ${baseCurrency}:`, insertError);
          allResults.push({
            baseCurrency,
            error: "Failed to store rates",
            details: insertError.message,
          });
          continue;
        }

        // Log success with rates
        console.log(
          `[CRON] Successfully stored ${pairsToInsert.length} exchange rates for ${baseCurrency} on ${today}:`
        );
        pairsToInsert.forEach((pair) => {
          console.log(`  ${pair.base_currency}/${pair.target_currency}: ${pair.rate}`);
        });

        totalStored += pairsToInsert.length;
        allResults.push({
          baseCurrency,
          message: "Exchange rates updated successfully",
          storedCount: pairsToInsert.length,
          rates: pairsToInsert.map((pair) => ({
            currency: pair.target_currency,
            rate: pair.rate,
          })),
        });
      } catch (error) {
        console.error(`[CRON] Error processing ${baseCurrency}:`, error);
        allResults.push({
          baseCurrency,
          error: "Processing failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: "Exchange rate update completed",
      date: today,
      totalStored,
      results: allResults,
    });
  } catch (error) {
    console.error("[CRON] Exchange rate update failed:", error);
    return NextResponse.json(
      {
        error: "Exchange rate update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
