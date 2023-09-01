import type { NextApiRequest, NextApiResponse } from "next";
import { StripeClient } from "../../config/StripeUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const accountId: string = req.body.accountId;
    console.log("Id is ", accountId);

    // Original list:
    /**
       "account_management" => @account_permissions,
        "account_onboarding" => @account_permissions,
        "app_onboarding" => @app_onboarding_permissions,
        "app_install" => @app_onboarding_permissions,
        "app_settings" => @app_settings_permissions,
        "balances" => @payout_permissions,
        "capital_overview" => @capital_overview_permissions,
        "capital_offer" => @capital_offer_permissions,
        "notification_banner" => @account_permissions,
        "instant_payouts" => @instant_payouts_permissions,
        "payment_details" => @payment_permissions,
        "payment_method_settings" => @payment_method_settings_permissions,
        "payments" => @payment_permissions,
        "payouts_list" => @payout_permissions,
        "payouts" => @payout_permissions,
        "transactions_list" => @transactions_permissions
     */

    // Specify the API version to include the beta header
    const accountSessionResponse = await StripeClient.accountSessions.create({
      account: accountId,
      components: {
        account_management: {
          enabled: true,
        },
        account_onboarding: {
          enabled: true,
        },
        app_onboarding: {
          enabled: true,
        },
        app_install: {
          enabled: true,
        },
        app_settings: {
          enabled: true,
        },
        // balances: {
        //   enabled: true,
        // },
        capital_overview: {
          enabled: true,
        },
        capital_offer: {
          enabled: true,
        },
        notification_banner: {
          enabled: true,
        },
        instant_payouts: {
          enabled: true,
        },
        payment_details: {
          enabled: true,
        },
        payment_method_settings: {
          enabled: true,
        },
        payments: {
          enabled: true,
        },
        payouts_list: {
          enabled: true,
        },
        payouts: {
          enabled: true,
        },
        transactions_list: {
          enabled: true,
        },
      } as any, // Bypass type since we have private options here,
    });

    (accountSessionResponse as any).publicKey =
      process.env.NEXT_PUBLIC_stripe_public_key;
    res.status(200).json(accountSessionResponse);
  } catch (error) {
    const errorAsAny = error as any;
    const errorMessage =
      errorAsAny && errorAsAny.message ? errorAsAny.message : "unknown";
    console.log("Error while creating", error);
    res.status(500).json({ error: errorMessage });
  }
}
