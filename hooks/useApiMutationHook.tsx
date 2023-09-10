import * as React from "react";
import { useMutation } from "react-query";

export function useApiMutationHook<TReturn>({
  id,
  path,
  body,
}: {
  id: string;
  path: string;
  body: any;
}) {
  return useMutation<TReturn, Error>(
    "ApiMutation" + id,
    async (): Promise<TReturn> => {
      const apiResponse = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!apiResponse.ok) {
        let errorText: string | undefined = undefined;
        try {
          const error = await apiResponse.json();
          errorText = error?.error;
        } catch (e) {
          // ignore
        }
        throw new Error(
          `Unexpected response code ${apiResponse.status}. ${
            errorText ? `Internal error: ${errorText}` : ""
          }`,
        );
      }
      const account = await apiResponse.json();
      return account;
    },
  );
}
