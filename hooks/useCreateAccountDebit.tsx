import { useApiMutationHook } from "./useApiMutationHook";

export type AccountDebitCreateMethod = "charge" | "transfer";

export const useCreateAccountDebit = (
  accountId: string,
  method: AccountDebitCreateMethod,
) => {
  return useApiMutationHook<void>({
    id: "CreateAccountDebit-" + accountId + method,
    path: "/api/create-account-debit",
    body: {
      accountId,
      method,
    },
  });
};
