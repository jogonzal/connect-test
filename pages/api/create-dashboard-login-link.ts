import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const searchParams = new URLSearchParams(req.url!.split("?")[1]);
    const connectedAccountId: string = searchParams.get("connectedAccountId")!;

    console.log("Params are", connectedAccountId);

    const link = await StripeClient.accounts.createLoginLink(
      connectedAccountId
    );

    console.log("Created link!", link);

    if (!link.url) {
      throw new Error("Session did not contain url!");
    }

    res.redirect(303, link.url);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
