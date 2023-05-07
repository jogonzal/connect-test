import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const connectedAccountId: string = req.body.connectedAccountId;

    console.log("Id is ", connectedAccountId);

    const customers = await StripeClient.customers.list({
      stripeAccount: connectedAccountId,
    });

    console.log("Obtained customers!", customers);

    res.status(200).send(customers);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while querying", error);
    res.status(500).json({ error: errorMessage });
  }
}
