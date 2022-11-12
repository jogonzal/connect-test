import { useMutation } from "react-query";
import Stripe from "stripe";

export type Params = {
  accountName: string;
  accountType: string;
  email: string;
};

export const useCreateAccount = () => {
  return useMutation<Stripe.Account, Error, Params>(
    "CreateAccount",
    async (params: Params): Promise<Stripe.Account> => {
      const accountsResponse = await fetch("/api/create-connected-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: params.accountName,
          type: params.accountType,
          email: params.email,
        }),
      });
      const account = await accountsResponse.json();
      return account;
    },
  );
};
