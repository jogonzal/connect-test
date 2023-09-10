import * as React from "react";
import { useQuery } from "react-query";

export function useApiQueryHook<T>({
  id,
  path,
  body,
}: {
  id: string;
  path: string;
  body: any;
}) {
  return useQuery<T, Error>("ApiQuery" + id, async (): Promise<T> => {
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
    const responseBody = await apiResponse.json();
    return responseBody;
  });
}
