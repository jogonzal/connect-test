import { useMutation } from "react-query";
import Stripe from "stripe";

const createTestCharge = async (accountId: string): Promise<Stripe.Charge> => {
  const testChargeResponse = await fetch("/api/create-test-charge", {
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

  const testCharge = await testChargeResponse.json();
  return testCharge;
};

export const useCreateTestCharge = (accountId: string) => {
  return useMutation<Stripe.Charge, Error>(
    "CreateTestCharge-" + accountId,
    async (): Promise<Stripe.Charge> => {
      const charge = await createTestCharge(accountId);

      return charge;
    },
  );
};
