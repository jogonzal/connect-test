import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";
import {
  StripeConnectInstance,
  loadConnect,
  IStripeConnectInitParams,
} from "@stripe/connect-js";

export const useConnectJSInit = (accountId: string) => {
  return useQuery<StripeConnectInstance, Error>("ConnectJSInit", async () => {
    const publishableKey = StripePublicKey;
    const stripeConnect = await loadConnect();
    const secret = await fetchClientSecret(accountId);

    const initProps: IStripeConnectInitParams = {
      publishableKey: publishableKey,
      clientSecret: secret,
      appearance: {},
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
        },
      },
    } as any);
  });
};
