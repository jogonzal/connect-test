import {
  clearFeaturesConfig,
  getAccountSessionComponentParamWithFeatures,
} from "../utils/featuresConfigUtils";

export const fetchClientSecret = async (accountId: string): Promise<string> => {
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

  const defaultComponents = {
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
    balances: {
      enabled: true,
    },
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
      features: {
        refund_management: true,
        dispute_management: true,
        capture_payments: true,
      },
    },
    payment_method_settings: {
      enabled: true,
    },
    payments: {
      enabled: true,
      features: {
        refund_management: true,
        dispute_management: true,
        capture_payments: true,
      },
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
  };
  try {
    const apiResponse = await fetch("/api/create-account-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: accountId,
        components: getAccountSessionComponentParamWithFeatures(
          accountId,
          defaultComponents,
        ),
      }),
    });

    if (!apiResponse.ok) {
      let errorText: string | undefined = undefined;
      try {
        const error = await apiResponse.json();
        errorText = error?.error;
      } catch (e) {
        // ignore
      }
      clearFeaturesConfig(accountId);
      throw new Error(
        `Unexpected response code ${apiResponse.status}. ${
          errorText ? `Internal error: ${errorText}` : ""
        }`,
      );
    }

    const json = await apiResponse.json();
    return json.client_secret;
  } catch (error) {
    console.error(`Failed to get client secret`, error);
    throw error;
  }
};
