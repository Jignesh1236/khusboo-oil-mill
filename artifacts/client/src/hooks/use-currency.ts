import { useGetConfig } from "./lib/api-client-react";

export function useCurrency() {
  const { data: config } = useGetConfig();
  const symbol = config?.currencySymbol || "₹";

  const format = (amount: number) => `${symbol}${amount.toFixed(2)}`;

  return { symbol, format };
}
