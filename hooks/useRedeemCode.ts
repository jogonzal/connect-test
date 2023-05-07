import { useQuery } from "react-query";
import Stripe from "stripe";

const redeemCode = async (code: string): Promise<Stripe.OAuthToken> => {
  const response = await fetch("/api/redeem-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: code,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unexpected response code ${response.status}`);
  }

  const account: Stripe.Response<Stripe.OAuthToken> = await response.json();
  return account;
};

export const useRedeemCode = (code: string | null) => {
  return useQuery<Stripe.OAuthToken, Error>(
    ["RedeemCode", code],
    async (): Promise<Stripe.OAuthToken> => {
      if (!code) {
        throw new Error("Please provide a code");
      }

      const account = await redeemCode(code);

      return account;
    },
  );
};
