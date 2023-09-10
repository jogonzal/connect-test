import Stripe from "stripe";
import { useApiMutationHook } from "./useApiMutationHook";

export const useCreateTestCharge = (
  accountId: string,
  description: string,
  destinationCharge: boolean,
  transferAmount: boolean,
  amount: number,
  fee: number,
  obo: boolean,
  currency: string,
  disputed: boolean,
) => {
  return useApiMutationHook<Stripe.Charge>({
    id: "CreateTestCharge-" + accountId,
    path: "/api/create-test-charge",
    body: {
      accountId,
      description,
      destinationCharge,
      transferAmount,
      amount,
      fee,
      obo,
      currency,
      disputed,
    },
  });
};
