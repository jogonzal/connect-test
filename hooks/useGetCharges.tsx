import Stripe from "stripe";
import { useApiQueryHook } from "./useApiQueryHook";

export const useGetCharges = (account: Stripe.Account) => {
  return useApiQueryHook<Stripe.ApiList<Stripe.Charge>>({
    id: "GetCharges-" + account.id,
    path: "/api/list-charges",
    body: {
      connectedAccountId: account.id,
    },
  });
};
