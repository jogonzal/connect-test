import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const connectedAccountId: string = req.body.accountId;

    console.log("Id is ", connectedAccountId);

    await StripeClient.accounts.update(connectedAccountId, {
      individual: {
        first_name:
          "PREFILLED INFO business profile name" +
          Math.round(Math.random() * 100),
      },
      business_profile: {
        name:
          "PREFILLED INFO business profile name" +
          Math.round(Math.random() * 100),
      },
      business_type: "individual",
    });

    res.status(200).send({});
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while updating account", error);
    res.status(500).json({ error: errorMessage });
  }
}
