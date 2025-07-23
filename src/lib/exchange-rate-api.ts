// Exchange Rate API configuration and utilities

// LATEST API REQUEST FORMAT
// "https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD";
// HISTORICAL API REQUEST FORMAT
// GET https://v6.exchangerate-api.com/v6/YOUR-API-KEY/history/USD/YEAR/MONTH/DAY

// export const EXCHANGE_RATE_API_BASE = "https://api.exchangerate-api.com/v4";
// export const EXCHANGE_RATE_API_BASE = "https://v6.exchangerate-api.com/v6";
export const EXCHANGE_RATE_API_BASE = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}`;

export const getExchangeRateHeaders = () => ({
  "User-Agent": "Mozilla/5.0 (compatible; LilyGem/1.0)",
  Accept: "application/json",
});

export const fetchExchangeRate = async (url: string) => {
  const response = await fetch(url, {
    headers: getExchangeRateHeaders(),
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
  const url = `${EXCHANGE_RATE_API_BASE}/latest/${baseCurrency}`;
  return fetchExchangeRate(url);
};

export const fetchHistoricalRates = async (baseCurrency: string, date: string) => {
  const [year, month, day] = date.split("-");
  const url = `${EXCHANGE_RATE_API_BASE}/history/${baseCurrency}/${year}/${month}/${day}`;
  return fetchExchangeRate(url);
};
