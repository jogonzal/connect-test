import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";
import { StripeConnectInstance, loadConnect } from "@stripe/connect-js";

export const useConnectJSInit = (accountId: string) => {
  return useQuery<StripeConnectInstance, Error>("ConnectJSInit", async () => {
    const publishableKey = StripePublicKey;
    const stripeConnect = await loadConnect();
    const secret = await fetchClientSecret(accountId);

    return stripeConnect!.initialize({
      publishableKey: publishableKey,
      clientSecret: secret,
      appearance: {
        colorPrimary: "#00FF00",
      },
      uiConfig: {
        overlay: "drawer",
      },
    });
  });
};
