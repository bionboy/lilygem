import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";

interface ExchangeRateParams {
  startDate: DateTime<true>;
  endDate: DateTime<true>;
  fromCurrency: string;
  toCurrency: string;
}

export interface ExchangeRateData {
  date: string;
  rates: Record<string, number>;
}

interface ExchangeRateResponse {
  rates: ExchangeRateData[];
  error?: string;
}

const fetchExchangeRateData = async (params: ExchangeRateParams): Promise<ExchangeRateResponse> => {
  const queryParams = {
    startDate: params.startDate.toUTC().toISODate(),
    endDate: params.endDate.toUTC().toISODate(),
    base: params.fromCurrency,
    symbols: params.toCurrency,
  };

  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`/api/exchange-rate?${queryString}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
};

export function useExchangeRateData(params: ExchangeRateParams) {
  return useQuery({
    queryKey: ["exchange-rate-data", params],
    queryFn: () => fetchExchangeRateData(params),
    enabled: !!params.fromCurrency && !!params.toCurrency,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
