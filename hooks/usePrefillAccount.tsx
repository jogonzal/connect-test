import * as React from "react";
import { useApiMutationHook } from "./useApiMutationHook";

export const usePrefillAccount = ({ accountId }: { accountId: string }) => {
  return useApiMutationHook({
    id: "PrefillAccount" + accountId,
    path: "/api/prefill-account",
    body: {
      accountId: accountId,
    },
  });
};
