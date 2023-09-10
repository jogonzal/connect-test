import Stripe from "stripe";
import { useApiQueryHook } from "./useApiQueryHook";

export const useGetCurrentAccount = () => {
  return useApiQueryHook<Stripe.Account>({
    id: "GetCurrentAccount",
    path: "/api/get-current-account",
    body: {},
  });
};
