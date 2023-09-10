import { useApiMutationHook } from "./useApiMutationHook";

export const useEditPaymentIntent = (accountId: string, id: string) => {
  return useApiMutationHook<void>({
    id: "EditPaymentIntent-" + accountId,
    path: "/api/edit-payment-intent",
    body: {
      accountId: accountId,
      id: id,
    },
  });
};
