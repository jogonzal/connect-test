import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const connectedAccountId: string = req.body.accountId;

    console.log("Id is ", connectedAccountId);

    const link = await StripeClient.accounts.createLoginLink(
      connectedAccountId,
    );

    res.status(200).send(link);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while updating account", error);
    res.status(500).json({ error: errorMessage });
  }
}
