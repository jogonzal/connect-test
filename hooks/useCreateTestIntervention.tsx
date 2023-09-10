import { useApiMutationHook } from "./useApiMutationHook";

export const useCreateTestIntervention = (accountId: string) => {
  return useApiMutationHook<void>({
    id: "CreateTestIntervention-" + accountId,
    path: "/api/create-test-intervention",
    body: {
      accountId,
    },
  });
};
