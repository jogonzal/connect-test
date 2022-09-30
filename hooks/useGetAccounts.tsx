import { useQuery } from "react-query";
import Stripe from "stripe";
import { StripePublicKey } from "../config/ClientConfig";

const getAccounts = async (): Promise<Stripe.ApiList<Stripe.Account>> => {
  const listAccountsResponse = await fetch("/api/list-connected-accounts");
  const accounts = await listAccountsResponse.json();
  return accounts;
};

export const useGetAccounts = () => {
  return useQuery<Stripe.Account[], Error>(
    "GetAccounts",
    async (): Promise<Stripe.Account[]> => {
      const publishableKey = StripePublicKey;
      const accounts = await getAccounts();

      return accounts.data;
    },
  );
};
