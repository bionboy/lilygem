import { z } from "zod";

// Zod schemas for API response validation
export const ExchangeRateApiResponse = z.object({
  result: z.string(),
  documentation: z.string().optional(),
  terms_of_use: z.string().optional(),
  time_last_update_unix: z.number().optional(),
  time_last_update_utc: z.string().optional(),
  time_next_update_unix: z.number().optional(),
  time_next_update_utc: z.string().optional(),
  base_code: z.string(),
  conversion_rates: z.record(z.string(), z.number()),
});

// TypeScript types inferred from Zod schemas
export type ExchangeRateApiResponse = z.infer<typeof ExchangeRateApiResponse>;

// Utility type for currency codes
export type CurrencyCode = string;
