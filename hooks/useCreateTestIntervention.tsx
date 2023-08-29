import { useMutation } from "react-query";

const createTestIntervention = async (accountId: string): Promise<void> => {
  const testChargeResponse = await fetch("/api/create-test-intervention", {
    body: JSON.stringify({
      accountId,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!testChargeResponse.ok) {
    throw new Error(`Unexpected response code ${testChargeResponse.status}`);
  }
};

export const useCreateTestIntervention = (accountId: string) => {
  return useMutation<void, Error>(
    "CreateTestIntervention-" + accountId,
    async (): Promise<void> => {
      const charge = await createTestIntervention(accountId);
    },
  );
};
