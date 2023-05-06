import { useQuery } from "react-query";
import Stripe from "stripe";

const getAccount = async (accountId: string): Promise<Stripe.Account> => {
  const response = await fetch("/api/get-account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connectedAccountId: accountId,
    }),
  });
  if (!response.ok) {
    throw new Error(`Unexpected response code ${response.status}`);
  }
  const account: Stripe.Response<Stripe.Account> = await response.json();
  return account;
};

export const useGetAccount = (accountId: string | null) => {
  return useQuery<Stripe.Account, Error>(
    ["GetAccount", accountId],
    async (): Promise<Stripe.Account> => {
      if (!accountId) {
        throw new Error("Please provide an account id");
      }

      const account = await getAccount(accountId);

      return account;
    },
  );
};
