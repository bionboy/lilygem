import { useQuery } from "@tanstack/react-query";

interface LatestExchangeRateParams {
  fromCurrency: string;
  toCurrency: string;
}

interface LatestExchangeRateResponse {
  rate: number;
  error?: string;
}

const fetchLatestExchangeRate = async (params: LatestExchangeRateParams): Promise<number> => {
  const queryParams = {
    base: params.fromCurrency,
    target: params.toCurrency,
    // skipCache: "true",
  };

  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`/api/exchange-rate/live?${queryString}`);
  const data: LatestExchangeRateResponse = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const rate = data?.rate;
  if (!rate) {
    throw new Error("No exchange rate found");
  }

  return rate;
};

export function useLatestExchangeRate(params: LatestExchangeRateParams) {
  return useQuery({
    queryKey: ["latest-exchange-rate", params],
    queryFn: () => fetchLatestExchangeRate(params),
    enabled:
      !!params.fromCurrency && !!params.toCurrency && params.fromCurrency !== params.toCurrency,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
  });
}
