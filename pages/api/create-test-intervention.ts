import type { NextApiRequest, NextApiResponse } from "next";
import { getHostUrl } from "../../config/EnvironmentVariables";
import { StripeClient } from "../../config/StripeUtils";
import { Stripe } from "stripe";

const merchantIssueResource = Stripe.StripeResource.extend({
  create: Stripe.StripeResource.method({
    method: "POST",
    path: "/test_helpers/demo/merchant_issue",
  }),
});

/**
 * Generates test intervention for the logged-in salon. This is only used for testing purposes
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);

    const interventionResponse = await new merchantIssueResource(
      StripeClient,
    ).create({
      account: accountId,
      issue_type: "additional_info",
    });

    console.log("Created interventionResponse!", interventionResponse);

    res.status(200).json(interventionResponse);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
