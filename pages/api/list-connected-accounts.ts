import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const starting_after = req.body.starting_after ?? undefined;
  console.log("Starting after", starting_after);
  try {
    const accounts = await StripeClient.accounts.list({
      limit: 20,
      ...(starting_after ? { starting_after } : {}),
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
