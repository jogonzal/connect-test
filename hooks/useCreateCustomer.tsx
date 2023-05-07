import { useMutation } from "react-query";
import Stripe from "stripe";

type CustomerProps = {
  name: string;
  description: string;
};

const createCustomer = async (
  accountId: string,
  customerProps: CustomerProps,
): Promise<Stripe.Customer> => {
  const createdCustomer = await fetch("/api/create-customer", {
    body: JSON.stringify({
      accountId,
      customer: customerProps,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!createdCustomer.ok) {
    throw new Error(`Unexpected response code ${createdCustomer.status}`);
  }

  const testCharge = await createdCustomer.json();
  return testCharge;
};

export const useCreateCustomer = (
  accountId: string,
  customerProps: CustomerProps,
) => {
  return useMutation<Stripe.Customer, Error>(
    "CreateCustomer-" + accountId,
    async (): Promise<Stripe.Customer> => {
      const customer = await createCustomer(accountId, customerProps);

      return customer;
    },
  );
};
