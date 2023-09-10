import Stripe from "stripe";
import { useApiMutationHook } from "./useApiMutationHook";

type CustomerProps = {
  name: string;
  description: string;
};

export const useCreateCustomer = (
  accountId: string,
  customerProps: CustomerProps,
) => {
  return useApiMutationHook<Stripe.Customer>({
    id: "CreateCustomer-" + accountId,
    path: "/api/create-customer",
    body: {
      accountId,
      customer: customerProps,
    },
  });
};
