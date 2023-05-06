import { useMutation } from "react-query";
import Stripe from "stripe";

const createPayout = async (
  accountId: string,
): Promise<Stripe.ApiList<Stripe.Account>> => {
  const listAccountsResponse = await fetch("/api/create-payout", {
    body: JSON.stringify({
      accountId,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!listAccountsResponse.ok) {
    throw new Error(`Unexpected response code ${listAccountsResponse.status}`);
  }

  const accounts = await listAccountsResponse.json();
  return accounts;
};

export const useCreatePayout = (accountId: string) => {
  return useMutation<Stripe.ApiList<Stripe.Account>, Error>(
    "CreatePayout-" + accountId,
    async (): Promise<Stripe.ApiList<Stripe.Account>> => {
      const accounts = await createPayout(accountId);

      return accounts;
    },
  );
};
