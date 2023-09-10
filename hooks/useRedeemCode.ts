import Stripe from "stripe";
import { useApiQueryHook } from "./useApiQueryHook";

export const useRedeemCode = (code: string | null) => {
  return useApiQueryHook<Stripe.OAuthToken>({
    id: "RedeemCode" + code,
    path: "/api/redeem-code",
    body: {
      code: code,
    },
  });
};
