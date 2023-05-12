import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);
    const method: string = req.body.method;
    console.log("method is ", method);

    let accountDebit: any;
    if (method === "charge") {
      accountDebit = await StripeClient.charges.create({
        amount: 888,
        currency: "USD",
        description: "TEST ACCOUNT DEBIT (via charge)",
        source: accountId,
      });
    } else {
      // Get "my own" id
      const platformAccount = await StripeClient.accounts.retrieve();

      // Create account debit via transfer
      accountDebit = await StripeClient.transfers.create(
        {
          amount: 777,
          currency: "usd",
          destination: platformAccount.id,
          description: "TEST ACCOUNT DEBIT (via transfer)",
        },
        {
          stripeAccount: accountId,
        },
      );
    }

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
