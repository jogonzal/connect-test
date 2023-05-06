import { useQuery } from "react-query";
import Stripe from "stripe";

const getAccounts = async (
  startingAfter: string | undefined,
): Promise<Stripe.ApiList<Stripe.Account>> => {
  const listAccountsResponse = await fetch("/api/list-connected-accounts", {
    body: JSON.stringify({
      starting_after: startingAfter,
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

export const useGetAccounts = (startingAfter: string | undefined) => {
  return useQuery<Stripe.ApiList<Stripe.Account>, Error>(
    "GetAccounts-" + startingAfter,
    async (): Promise<Stripe.ApiList<Stripe.Account>> => {
      const accounts = await getAccounts(startingAfter);

      return accounts;
    },
  );
};
