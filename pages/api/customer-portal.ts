import type { NextApiRequest, NextApiResponse } from "next";
import { getHostUrl } from "../../config/EnvironmentVariables";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const searchParams = new URLSearchParams(req.url?.split("?")[1]);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const connectedAccountId: string = searchParams.get("accountId")!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const customerId: string = searchParams.get("customerId")!;

    console.log("Id is ", connectedAccountId);
    console.log("Customer id is ", customerId);

    const configuration =
      await StripeClient.billingPortal.configurations.create({
        business_profile: {
          headline:
            "Cactus Practice partners with Stripe for simplified billing.",
        },
        features: {
          invoice_history: {
            enabled: true,
          },
          customer_update: {
            enabled: true,
            allowed_updates: ["address", "email", "phone"],
          },
          payment_method_update: {
            enabled: true,
          },
          subscription_cancel: {
            enabled: true,
          },
          subscription_pause: {
            enabled: true,
          },
        },
      });

    const session = await StripeClient.billingPortal.sessions.create(
      {
        customer: customerId,
        return_url: getHostUrl(req) + "/account/" + connectedAccountId,
      },
      {
        stripeAccount: connectedAccountId,
      },
    );

    res.redirect(session.url);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while processing", error);
    res.status(500).json({ error: errorMessage });
  }
}
