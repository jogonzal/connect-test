import { useQuery } from "react-query";
import Stripe from "stripe";
import { db } from "../clientsStorage/StarredAccountsDatabase";

export const useGetStarredAccounts = () => {
  return useQuery<Stripe.Account[], Error>(
    "GetStarredAccounts",
    async (): Promise<Stripe.Account[]> => {
      const accounts = await db.starredAccounts.toArray();

      return accounts;
    },
  );
};
