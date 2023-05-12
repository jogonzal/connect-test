import { useMutation } from "react-query";
import Stripe from "stripe";

export type AccountDebitCreateMethod = "charge" | "transfer";

const createDebit = async (
  accountId: string,
  method: AccountDebitCreateMethod,
): Promise<Stripe.ApiList<Stripe.Account>> => {
  const accountDebitResponse = await fetch("/api/create-account-debit", {
    body: JSON.stringify({
      accountId,
      method,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!accountDebitResponse.ok) {
    throw new Error(`Unexpected response code ${accountDebitResponse.status}`);
  }

  const accounts = await accountDebitResponse.json();
  return accounts;
};

export const useCreateAccountDebit = (accountId: string) => {
  return useMutation<
    Stripe.ApiList<Stripe.Account>,
    Error,
    { method: AccountDebitCreateMethod }
  >(
    "CreateAccountDebit-" + accountId,
    async ({ method }): Promise<Stripe.ApiList<Stripe.Account>> => {
      const accounts = await createDebit(accountId, method);

      return accounts;
    },
  );
};
