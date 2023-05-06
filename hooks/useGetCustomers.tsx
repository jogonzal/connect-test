import { useQuery } from "react-query";
import Stripe from "stripe";

export const useGetCustomers = (accountId: string | null) => {
  return useQuery<Stripe.ApiList<Stripe.Customer>, Error>(
    ["GetCustomers", accountId],
    async () => {
      if (!accountId) {
        throw new Error("Please provide an account id");
      }

      const response = await fetch("/api/get-customers", {
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
      const result: Stripe.ApiList<Stripe.Customer> = await response.json();

      return result;
    },
  );
};
