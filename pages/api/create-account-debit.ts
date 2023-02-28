import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);

    const accountDebit = await StripeClient.charges.create({
      amount: 888,
      currency: "USD",
      description: "TEST ACCOUNT DEBIT",
      source: accountId,
    });

    console.log("Created account debit!", accountDebit);

    res.status(200).json(accountDebit);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
