import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    console.log("here");
    const connectedAccountId: string = req.body.accountId;

    console.log("Id is ", connectedAccountId);

    const capability1 = await StripeClient.accounts.updateCapability(
      connectedAccountId,
      "transfers",
      { requested: true },
    );

    const capability2 = await StripeClient.accounts.updateCapability(
      connectedAccountId,
      "card_payments",
      { requested: true },
    );

    const capability3 = await StripeClient.accounts.updateCapability(
      connectedAccountId,
      "eps_payments",
      { requested: true },
    );

    const capability4 = await StripeClient.accounts.updateCapability(
      connectedAccountId,
      "giropay_payments",
      { requested: true },
    );

    const capability5 = await StripeClient.accounts.updateCapability(
      connectedAccountId,
      "bancontact_payments",
      { requested: true },
    );

    console.log("Obtained account!", connectedAccountId);

    res.status(200).send({});
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while querying", error);
    res.status(500).json({ error: errorMessage });
  }
}
