import Stripe from "stripe";
import { useApiQueryHook } from "./useApiQueryHook";

export const useGetAccount = (accountId: string | null) => {
  return useApiQueryHook<Stripe.Account>({
    id: "GetAccount-" + accountId,
    path: "/api/get-account",
    body: {
      connectedAccountId: accountId,
    },
  });
};
