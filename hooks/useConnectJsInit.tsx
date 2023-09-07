import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";
import {
  StripeConnectInstance,
  IStripeConnectInitParams,
  AppearanceOptions,
  StripeConnectWrapper,
} from "@stripe/connect-js/pure";
import {
  getConnectJSSourceInStorage,
  getConnectJsSpecificCommitInStorage,
  getLocaleInStorage,
  getThemeInStorage,
} from "../clientsStorage/LocalStorageEntry";
import { assertNever } from "@fluentui/react";
import { loadConnect } from "@stripe/connect-js";

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
      break;
    case "prodv1.0":
      script.src = "https://connect-js.stripe.com/v1.0/connect.js";
      break;
    case "popoverinline-cdn":
      script.src =
        "https://connectjstestcdn.azureedge.net/vpopoverinline/dist/v0.1/connect.js";
      break;
    case "popoverinline-storage":
      script.src =
        "https://connectjstest.blob.core.windows.net/vpopoverinline/dist/v0.1/connect.js";
      break;
    case "popoveraccesory-cdn":
      script.src =
        "https://connectjstestcdn.azureedge.net/vpopoveraccesory/dist/v0.1/connect.js";
      break;
    case "popoveraccesory-storage":
      script.src =
        "https://connectjstest.blob.core.windows.net/vpopoveraccesory/dist/v0.1/connect.js";
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
              console.log("loadconnect returned", connect);
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
    const secret = await fetchClientSecret(accountId);

    const appearanceForLightMode: AppearanceOptions = {};
    const appearanceForDarkMode = {
      colorSecondaryButtonBackground: "#7F7A7A",
      colorSecondaryButtonBorder: "#7F7A7A",
      colorOffsetBackground: "#4F4F4F",
      colorText: "#FFFFFF",
      colorSecondaryText: "#C4C4C4",
      colorBorder: "#696969",
      colorBorderHighlight: "#616161",
      colorBackground: "#222222",
    } as any;

    const theme = getThemeInStorage();

    const initProps: IStripeConnectInitParams = {
      publishableKey: publishableKey,
      clientSecret: secret,
      appearance:
        theme === "Light" ? appearanceForLightMode : appearanceForDarkMode,
      uiConfig: {
        overlay: "dialog",
      },
      locale: getLocaleInStorage(),
    };

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
