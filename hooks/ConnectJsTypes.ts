import React from "react";

export interface IStripeConnectAppearance {
  colors?: {
    primary?: string;
    textLink?: string;
  };
}

export interface IStripeConnectUIConfig {
  overlay?: string;
}

export interface IStripeConnectInit {
  publishableKey: string;
  clientSecret: string;
  appearance?: IStripeConnectAppearance;
  uiConfig?: IStripeConnectUIConfig;
}

interface IStripeConnect {
  onLoad?: () => void;
  init?: (params: IStripeConnectInit) => void;
}

declare global {
  interface Window {
    StripeConnect?: IStripeConnect;
    StripeRcCommitHash?: string;
  }
}

export type CustomElement<T> = Partial<
  T & React.DOMAttributes<T> & { children?: React.ReactNode | undefined }
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      ["stripe-connect-payments"]: CustomElement<{}>;
      ["stripe-pricing-table"]: CustomElement<{}>;
      ["stripe-connect-payouts"]: CustomElement<{}>;
      ["stripe-connect-account-onboarding"]: CustomElement<{
        ref: React.RefObject<HTMLElement>;
      }>;
      ["stripe-connect-account-management"]: CustomElement<{}>;
      ["stripe-connect-instant-payouts"]: CustomElement<{}>;
      ["stripe-connect-debug-utils"]: CustomElement<{}>;
      ["stripe-connect-payment-details"]: CustomElement<{
        hidden: string | null;
        "charge-id": string | null;
        ref: React.RefObject<HTMLElement>;
      }>;
      ["stripe-connect-debug-ui-config"]: CustomElement<{}>;
      ["stripe-connect-debug-ui-preview"]: CustomElement<{}>;
    }
  }
}
