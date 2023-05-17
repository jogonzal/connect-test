import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";
import {
  StripeConnectInstance,
  loadConnect,
  IStripeConnectInitParams,
  AppearanceOptions,
} from "@stripe/connect-js/pure";

export const useConnectJSInit = (accountId: string) => {
  return useQuery<StripeConnectInstance, Error>("ConnectJSInit", async () => {
    const publishableKey = StripePublicKey;
    const stripeConnect = await loadConnect();
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
    } as any;

    const theme = localStorage.getItem("theme") || "Light";

    const initProps: IStripeConnectInitParams = {
      publishableKey: publishableKey,
      clientSecret: secret,
      appearance:
        theme === "Light" ? appearanceForLightMode : appearanceForDarkMode,
      uiConfig: {
        overlay: "drawer",
      },
    };

    return stripeConnect.initialize({
      ...initProps,
      // Overriding these flags so it is easier to test
      metaOptions: {
        flagOverrides: {
          enable_embedded_theming_demo: true,
          enable_uiconfig_copy_link: true,
          enable_developer_ids: true,
          // Until I am enabled
          enable_balance_transactions_component: true,
        },
      },
    } as any);
  });
};
