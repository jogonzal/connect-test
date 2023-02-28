import { useMutation } from "react-query";
import Stripe from "stripe";

const createDebit = async (
  accountId: string,
): Promise<Stripe.ApiList<Stripe.Account>> => {
  const accountDebitResponse = await fetch("/api/create-account-debit", {
    body: JSON.stringify({
      accountId,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!accountDebitResponse.ok) {
    throw new Error("Failed to create account debit");
  }

  const accounts = await accountDebitResponse.json();
  return accounts;
};

export const useCreateAccountDebit = (accountId: string) => {
  return useMutation<Stripe.ApiList<Stripe.Account>, Error>(
    "CreateAccountDebit-" + accountId,
    async (): Promise<Stripe.ApiList<Stripe.Account>> => {
      const accounts = await createDebit(accountId);

      return accounts;
    },
  );
};
