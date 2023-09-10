import Stripe from "stripe";
import { useApiMutationHook } from "./useApiMutationHook";

export const useCreatePayout = (accountId: string) => {
  return useApiMutationHook<Stripe.Payout>({
    id: "CreatePayout-" + accountId,
    path: "/api/create-payout",
    body: {
      accountId,
    },
  });
};
