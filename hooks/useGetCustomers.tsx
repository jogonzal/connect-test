import Stripe from "stripe";
import { useApiQueryHook } from "./useApiQueryHook";

export const useGetCustomers = (accountId: string | null) => {
  return useApiQueryHook<Stripe.ApiList<Stripe.Customer>>({
    id: "GetCustomers-" + accountId,
    path: "/api/list-customers",
    body: {
      connectedAccountId: accountId,
    },
  });
};
