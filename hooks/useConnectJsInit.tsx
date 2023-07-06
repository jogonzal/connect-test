import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";
import {
  StripeConnectInstance,
  loadConnect,
  IStripeConnectInitParams,
  AppearanceOptions,
  StripeConnectWrapper,
} from "@stripe/connect-js/pure";
import { initialLocale } from "../pages/_app";

const injectScript = (): HTMLScriptElement => {
  const shouldloadConnectJsLocal = window.location.search
    .toLowerCase()
    .includes("localconnectjs");

  const script = document.createElement("script");
  script.src = shouldloadConnectJsLocal
    ? "http://localhost:3001/v0.1/connect.js"
    : "https://connect-js.stripe.com/v0.1/connect.js";

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
          const wrapper = (window as any).StripeConnect;
          resolve(wrapper);
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

const connectJsInstanceCache: Record<string, StripeConnectInstance> = {};

export const useConnectJSInit = (accountId: string) => {
  return useQuery<StripeConnectInstance, Error>(
    ["ConnectJSInit", accountId],
    async () => {
      if (connectJsInstanceCache[accountId]) {
        return connectJsInstanceCache[accountId];
      }

      console.log("Initializing ConectJS for account", accountId);

      const publishableKey = StripePublicKey;
      const stripeConnect = await loadConnectPrivate();
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

      const theme = localStorage.getItem("theme") || "Light";

      const initProps: IStripeConnectInitParams = {
        publishableKey: publishableKey,
        clientSecret: secret,
        appearance:
          theme === "Light" ? appearanceForLightMode : appearanceForDarkMode,
        uiConfig: {
          overlay: "dialog",
        },
        locale: initialLocale,
      };

      const instance = (stripeConnect as any).init({
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

      connectJsInstanceCache[accountId] = instance;
      return instance;
    },
  );
};
