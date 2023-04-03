import { useQuery } from "react-query";
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "./fetchClientSecret";

export const useConnectJSInit = (accountId: string) => {
  return useQuery<void, Error>("ConnectJSInit", async () => {
    const publishableKey = StripePublicKey;
    const secret = await fetchClientSecret(accountId);

    window.StripeConnect ||= {};
    window.StripeConnect.onLoad = () => {
      window.StripeConnect!.init!({
        publishableKey: publishableKey,
        clientSecret: secret,
        appearance: {
          colors: { primary: "var(--jorge-color)" },
        },
      });
    };
  });
};
