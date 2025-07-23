// Database utilities for storing exchange rates
// Choose one of the implementations below based on your preferred database

import { supabaseAdmin } from "./supabase";

export interface ExchangeRate {
  date: string;
  base: string;
  rates: Record<string, number>;
  timestamp: string;
}

export async function storeExchangeRatesSupabase(rates: ExchangeRate[]) {
  const pairs = [];

  for (const rate of rates) {
    // Convert JSONB rates to individual pairs
    for (const [targetCurrency, rateValue] of Object.entries(rate.rates)) {
      if (targetCurrency !== rate.base) {
        // Skip self-references
        pairs.push({
          date: rate.date,
          base_currency: rate.base,
          target_currency: targetCurrency,
          rate: rateValue as number,
          created_at: rate.timestamp,
        });
      }
    }
  }

  // Batch insert all pairs
  if (pairs.length > 0) {
    const { error } = await supabaseAdmin.from("exchange_rate_pairs").upsert(pairs, {
      onConflict: "date,base_currency,target_currency",
    });

    if (error) {
      console.error("Error storing exchange rate pairs:", error);
      throw error;
    }
  }
}

// Default implementation (logs to console)
export async function storeExchangeRates(rates: ExchangeRate[]) {
  console.log("Exchange rates to store:", JSON.stringify(rates, null, 2));

  await storeExchangeRatesSupabase(rates);
}

// Function to retrieve exchange rates from database
export async function getExchangeRates(date: string, base?: string) {
  // Implement based on your chosen database
  // This is a placeholder - implement based on your database choice
  console.log(`Retrieving exchange rates for ${date}${base ? ` with base ${base}` : ""}`);
  return [];
}
