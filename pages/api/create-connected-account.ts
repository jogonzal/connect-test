import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const name: string = req.body.name;
    console.log("Name is ", name);
    const type: string = req.body.type;
    console.log("Type is ", type);
    const email: string = req.body.email;
    console.log("Email is ", email);

    let account;
    if (type === "UA7") {
      account = await StripeClient.accounts.create(
        {
          country: "US",
          ...(email ? { email } : {}),
          business_profile: {
            name: name,
          },
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
          // Specify parameters to indicate an account with no dashboard, where Stripe owns loss liability and onboarding and the platform owns pricing
          controller: {
            application: {
              loss_liable: false, // Stripe owns loss liability
              onboarding_owner: false, // Stripe is the onboarding owner
              pricing_controls: true, // The platform is the pricing owner
            },
            dashboard: {
              type: "none", // The connected account will not have access to dashboard
            },
          },
        } as any,
        {
          apiVersion:
            "2022-08-01; embedded_connect_beta=v1;unified_accounts_beta=v1",
        },
      );
    } else {
      account = await StripeClient.accounts.create({
        type: type as Stripe.Account.Type,
        country: "US",
        ...(email ? { email } : {}),
        business_profile: {
          name: name,
        },
        ...(type === "standard"
          ? {}
          : {
              capabilities: {
                card_payments: {
                  requested: true,
                },
                transfers: {
                  requested: true,
                },
              },
            }),
      });
    }

    console.log("Created!", account);

    res.status(200).json(account);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
