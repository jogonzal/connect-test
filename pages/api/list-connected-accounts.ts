import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const accounts = await StripeClient.accounts.list({
      limit: 100,
    });

    res.status(200).json(accounts);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.error("An error ocurred when fetching accounts", error);
    res.status(500).json({ error: errorMessage });
  }
}
