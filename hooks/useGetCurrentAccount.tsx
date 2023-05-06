import { useQuery } from "react-query";
import Stripe from "stripe";

const getAccount = async (): Promise<Stripe.Account> => {
  const response = await fetch("/api/get-current-account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    throw new Error(`Unexpected response code ${response.status}`);
  }
  const account: Stripe.Response<Stripe.Account> = await response.json();
  return account;
};

export const useGetCurrentAccount = () => {
  return useQuery<Stripe.Account, Error>(
    ["GetAccount"],
    async (): Promise<Stripe.Account> => {
      const account = await getAccount();

      return account;
    },
  );
};
