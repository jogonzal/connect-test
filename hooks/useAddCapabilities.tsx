import * as React from "react";
import { useApiMutationHook } from "./useApiMutationHook";

export const useAddCapabilities = ({ accountId }: { accountId: string }) => {
  return useApiMutationHook({
    id: "AddCapabilities" + accountId,
    path: "/api/add-capabilities",
    body: {
      accountId: accountId,
    },
  });
};
