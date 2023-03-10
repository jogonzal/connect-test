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
    const prefill: string = req.body.prefill;
    console.log("prefill is ", prefill);

    let accountParams: Stripe.AccountCreateParams = {
      country: "US",
      ...(email ? { email } : {}),
      business_profile: {
        name: name,
      },
    };
    if (type === "standard" || type === "express" || type === "custom") {
      accountParams.type = type;
    } else if (type === "UA1") {
      accountParams.controller = {
        application: {
          loss_liable: true, // Platform owns loss liability
          onboarding_owner: false, // Stripe is the onboarding owner
          pricing_controls: true, // The platform is the pricing owner
        },
        dashboard: {
          type: "full", // Standard dash
        },
      };
    } else if (type === "UA2") {
      accountParams.controller = {
        application: {
          loss_liable: false, // Stripe owns loss liability
          onboarding_owner: false, // Stripe is the onboarding owner
          pricing_controls: true, // The platform is the pricing owner
        },
        dashboard: {
          type: "full", // Standard dash
        },
      };
    } else if (type === "UA3 or UA6") {
      accountParams.controller = {
        application: {
          loss_liable: true, // Platform owns loss liability
          onboarding_owner: true, // Platform is the onboarding owner
          pricing_controls: true, // The platform is the pricing owner
        },
        dashboard: {
          type: "none", // The connected account will not have access to dashboard
        },
      };
    } else if (type === "UA7") {
      accountParams.controller = {
        application: {
          loss_liable: false, // Stripe owns loss liability
          onboarding_owner: false, // Stripe is the onboarding owner
          pricing_controls: true, // The platform is the pricing owner
        },
        dashboard: {
          type: "none", // The connected account will not have access to dashboard
        },
      };
    } else {
      throw new Error(`Unsupported account type ${type}`);
    }

    // "You cannot create standard accounts with capabilities via the API"
    if (type != "standard" && type !== "UA1" && type !== "UA2") {
      accountParams.capabilities = {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      };
    }

    if (prefill) {
      const bankAccountToken = (
        await StripeClient.tokens.create({
          bank_account: {
            country: "US",
            currency: "usd",
            account_holder_name: "Jenny Rosen",
            account_holder_type: "individual",
            routing_number: "110000000",
            account_number: "000123456789",
          },
        })
      ).id;

      accountParams.external_account = bankAccountToken;
      accountParams = {
        ...accountParams,
        country: "US",
        email: email ?? "jorgea@stripe.com",
        business_type: "individual",
        business_profile: {
          mcc: "7299",
          name: name,
          product_description: "Description",
          support_address: {
            line1: "354 Oyster Point Blvd",
            city: "South San Francisco",
            state: "CA",
            postal_code: "94080",
          },
          support_email: "jorgea@stripe.com",
          support_phone: "4257537116",
          support_url: "https://furever.dev",
          url: "https://furever.dev",
        },
        individual: {
          first_name: "Jenny",
          last_name: "Rosen",
          email: "jenny.rosen@example.com",
          address: {
            line1: "354 Oyster Point Blvd",
            city: "South San Francisco",
            state: "CA",
            postal_code: "94080",
          },
          dob: {
            day: 1,
            month: 1,
            year: 1990,
          },
          phone: "4257537115",
          ssn_last_4: "1234",
        },
        settings: {
          card_payments: {
            statement_descriptor_prefix: "FurEver",
            statement_descriptor_prefix_kana: null,
            statement_descriptor_prefix_kanji: null,
          },
          payments: {
            statement_descriptor: "FurEver",
            statement_descriptor_kana: undefined,
            statement_descriptor_kanji: undefined,
          },
        },
      };
    }

    const account = await StripeClient.accounts.create(accountParams);

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
