import type { NextApiRequest, NextApiResponse } from "next";
import { getHostUrl } from "../../config/EnvironmentVariables";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);

    const payout = await StripeClient.payouts.create(
      {
        amount: 1000,
        currency: "USD",
        description: "TEST PAYOUT",
      },
      {
        stripeAccount: accountId,
      },
    );

    console.log("Created payout!", payout);

    res.status(200).json(payout);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
