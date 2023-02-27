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

    const payment = await StripeClient.paymentIntents.create(
      {
        amount: 1000,
        currency: "USD",
        description: "TEST CHARGE",
        payment_method: "pm_card_bypassPending",
        confirmation_method: "manual",
        confirm: true,
      },
      {
        stripeAccount: accountId,
      },
    );

    console.log("Created payment!", payment);

    res.status(200).json(payment);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
