import Stripe from "stripe";
import { useApiQueryHook } from "./useApiQueryHook";

export const useGetAccounts = (startingAfter: string | undefined) => {
  return useApiQueryHook<Stripe.ApiList<Stripe.Account>>({
    id: "GetAccounts-" + startingAfter,
    path: "/api/list-connected-accounts",
    body: {
      starting_after: startingAfter,
    },
  });
};
