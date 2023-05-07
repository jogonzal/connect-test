import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);
    const customer: any = req.body.customer;

    const customerData = await StripeClient.customers.create(
      {
        name: customer.name,
        description: customer.description,
      },
      {
        stripeAccount: accountId,
      },
    );

    console.log("Created customer!", customerData);

    res.status(200).json(customerData);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
