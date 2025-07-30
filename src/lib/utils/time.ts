import { DateTime } from "luxon";

/**
 * Get current date in UTC ISO format for database storage
 */
export const getCurrentUTCDate = (): string => {
  return DateTime.utc().toISO();
};

/**
 * Convert Unix timestamp to ISO string
 * Input format: 1585267200
 * Output format: "2020-03-27T00:00:00.000Z"
 */
export const convertUnixToISO = (unixTimestamp: number): string => {
  const isoDate = DateTime.fromSeconds(unixTimestamp).toISO();
  if (!isoDate) {
    throw new Error("Failed to convert Unix timestamp to ISO string");
  }
  return isoDate;
};

export const convertUTCToLocal = (utcDate: string): string => {
  const localDate = DateTime.fromISO(utcDate).toLocal().toISODate();
  if (!localDate) {
    throw new Error("Failed to convert UTC to local time");
  }
  return localDate;
};

export const dateToDisplay = (date: DateTime): string => {
  return date.toFormat("yyyy-MM-dd");
};
