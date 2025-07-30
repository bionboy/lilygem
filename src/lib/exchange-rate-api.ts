// Exchange Rate API configuration and utilities

// LATEST API REQUEST FORMAT
// "https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD";
// HISTORICAL API REQUEST FORMAT
// GET https://v6.exchangerate-api.com/v6/YOUR-API-KEY/history/USD/YEAR/MONTH/DAY

const EXCHANGE_RATE_API_BASE = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}`;

const ExchangeRateHeaders = {
  "User-Agent": "Mozilla/5.0 (compatible; LilyGem/1.0)",
  Accept: "application/json",
  "Accept-Encoding": "gzip, deflate",
  "Cache-Control": "no-cache",
} as const;

export const fetchExchangeRate = async (url: string) => {
  const response = await fetch(`${EXCHANGE_RATE_API_BASE}/${url}`, {
    headers: ExchangeRateHeaders,
  });

  if (!response.ok) {
    throw new Error(
      `Exchange rate API responded with status: ${response.status} ${response.statusText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Expected JSON response, got ${contentType}`);
  }

  return response.json();
};

// API functions for different use cases
export const fetchLatestRates = async (baseCurrency: string) => {
  const url = `latest/${baseCurrency}`;
  return fetchExchangeRate(url);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchHistoricalRates = async (baseCurrency: string, date: string) => {
  // TODO: remove this if I find a solution
  console.debug("Skipping historical rates for now, this is a paid feature");
  // const [year, month, day] = date.split("-");
  // const url = `history/${baseCurrency}/${year}/${month}/${day}`;
  // return fetchExchangeRate(url);
};
