import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";
import {
  StripeConnectInstance,
  IStripeConnectInitParams,
  StripeConnectWrapper,
  AppearanceVariables,
} from "@stripe/connect-js/pure";
import {
  getConnectJSSourceInStorage,
  getConnectJsSpecificCommitInStorage,
  getFeaturesConfigInStorage,
  getLocaleInStorage,
  getThemeInStorage,
  getConnectJsFontConfig,
} from "../clientsStorage/LocalStorageEntry";
import { assertNever } from "@fluentui/react";
import { loadConnect } from "@stripe/connect-js/pure";
import {
  DEFAULT_CUSTOM_FONT_SOURCE,
  DEFAULT_FONT_CONFIG,
} from "../utils/fontConfig";

const injectScript = (): HTMLScriptElement => {
  const script = document.createElement("script");

  const src = getConnectJSSourceInStorage();
  const specificCommit = getConnectJsSpecificCommitInStorage();
  switch (src) {
    case "local":
      script.src = "http://localhost:3001/v0.1/connect.js";
      break;
    case "prodv0.1":
      script.src = "https://connect-js.stripe.com/v0.1/connect.js";
      // Use this to test QA
      // script.src = "https://qa-connect-js.stripe.com/v0.1/connect.js";
      break;
    case "prodv1.0":
      script.src = "https://connect-js.stripe.com/v1.0/connect.js";
      break;
    case "bstripecdn":
      script.src =
        "https://b.stripecdn.com/submerchant-surfaces-statics-srv/assets/v0.1/connect.js";
      break;
    case "specificcommit":
      script.src = `https://connect-js.stripe.com/v0.1/connectjs-${specificCommit}.js`;
      break;
    default:
      assertNever(src);
  }

  const head = document.head;

  if (!head) {
    throw new Error(
      "Expected document.head not to be null. Connect.js requires a <head> element.",
    );
  }

  document.head.appendChild(script);

  return script;
};

export const loadConnectPrivate = (): Promise<StripeConnectWrapper> => {
  return new Promise((resolve, reject) => {
    try {
      const script = injectScript();
      script.addEventListener("load", () => {
        if ((window as any).StripeConnect) {
          loadConnect()
            .then((connect) => {
              resolve(connect);
            })
            .catch(reject);
        } else {
          reject(new Error("Connect.js did not load the necessary objects"));
        }
      });

      script.addEventListener("error", () => {
        reject(new Error("Failed to load Connect.js"));
      });
    } catch (error) {
      reject(error);
    }
  });
};

const connectJsCache: Record<
  string,
  {
    stripeConnectInstance: StripeConnectInstance;
    stripeConnectWrapper: StripeConnectWrapper;
  }
> = {};

export const useConnectJSInit = (accountId: string) => {
  return useQuery<
    {
      stripeConnectInstance: StripeConnectInstance;
      stripeConnectWrapper: StripeConnectWrapper;
    },
    Error
  >(["ConnectJSInit", accountId], async () => {
    if (connectJsCache[accountId]) {
      return connectJsCache[accountId];
    }

    console.log("Initializing ConectJS for account", accountId);

    const publishableKey = StripePublicKey;
    const stripeConnect: StripeConnectWrapper = await loadConnectPrivate();
    const secret = await fetchClientSecret(
      accountId,
      getFeaturesConfigInStorage(),
    );

    const appearanceForLightMode: AppearanceVariables = {};
    const appearanceForDarkMode: AppearanceVariables = {
      buttonSecondaryColorBackground: "#7F7A7A",
      buttonSecondaryColorBorder: "#7F7A7A",
      offsetBackgroundColor: "#4F4F4F",
      colorText: "#FFFFFF",
      colorSecondaryText: "#C4C4C4",
      colorBorder: "#696969",
      formHighlightColorBorder: "#616161",
      colorBackground: "#222222",
    };

    const theme = getThemeInStorage();

    // Font logic
    const { fontFamily, fontSource, cssFontSource } =
      getConnectJsFontConfig() || DEFAULT_FONT_CONFIG;

    console.log("DEFAULT", fontSource, DEFAULT_CUSTOM_FONT_SOURCE);
    console.log({
      fonts:
        fontSource === "customfontsource"
          ? DEFAULT_CUSTOM_FONT_SOURCE
          : [
              {
                cssSrc: cssFontSource,
              },
            ],
      appearance: {
        variables: {
          fontFamily:
            fontSource === "customfontsource" ? "Segoe UI" : fontFamily,
          ...(theme === "Light"
            ? appearanceForLightMode
            : appearanceForDarkMode),
        } as any,
      },
    });
    const initProps: IStripeConnectInitParams = {
      publishableKey: publishableKey,
      clientSecret: secret,
      fonts:
        fontSource === "customfontsource"
          ? DEFAULT_CUSTOM_FONT_SOURCE
          : [
              {
                cssSrc: cssFontSource,
              },
            ],
      appearance: {
        variables: {
          fontFamily:
            fontSource === "customfontsource" ? "Segoe UI" : fontFamily,
          ...(theme === "Light"
            ? appearanceForLightMode
            : appearanceForDarkMode),
        } as any,
      },
      locale: getLocaleInStorage(),
    } as any;

    const instance = stripeConnect.initialize({
      ...initProps,
      // Overriding these flags so it is easier to test
      metaOptions: {
        flagOverrides: {
          enable_uiconfig_copy_link: true,
          enable_developer_ids: true,
          // Until I am enabled
          enable_balance_transactions_component: true,
          enable_embedded_account_management: true,
          enable_embedded_account_onboarding: true,
          enable_standard_account_access: true,
          enable_standard_auth_popup_reload: true,
        },
      },
    } as any);

    connectJsCache[accountId] = {
      stripeConnectInstance: instance,
      stripeConnectWrapper: stripeConnect,
    };

    return {
      stripeConnectInstance: instance,
      stripeConnectWrapper: stripeConnect,
    };
  });
};
