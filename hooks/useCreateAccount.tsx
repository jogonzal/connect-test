import Stripe from "stripe";
import { useApiMutationHook } from "./useApiMutationHook";

export type Params = {
  accountName: string;
  accountType: string;
  email: string;
  prefill: boolean;
};

export const useCreateAccount = (params: Params) => {
  return useApiMutationHook<Stripe.Account>({
    id: "CreateAccount",
    path: "/api/create-connected-account",
    body: {
      name: params.accountName,
      type: params.accountType,
      email: params.email,
      prefill: params.prefill,
    },
  });
};
