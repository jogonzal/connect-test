import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const code: string = req.body.code;

    console.log("code is ", code);

    const oauthToken = await StripeClient.oauth.token({
      grant_type: "authorization_code",
      code: code,
    });

    console.log("Obtained token!", oauthToken);

    res.status(200).send(oauthToken);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while querying", error);
    res.status(500).json({ error: errorMessage });
  }
}
