import React from "react";

export interface IStripeConnectAppearance {
  colors: {
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
  // appearance: IStripeConnectAppearance;
  // uiConfig?: IStripeConnectUIConfig;
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
      ["stripe-payments-experience"]: CustomElement<{}>;
      ["stripe-payouts-experience"]: CustomElement<{}>;
      ["stripe-account-onboarding-experience"]: CustomElement<{
        ref: React.RefObject<HTMLElement>;
      }>;
      ["stripe-account-management-experience"]: CustomElement<{}>;
      ["stripe-instant-payouts-experience"]: CustomElement<{}>;
      ["stripe-payment-details-experience"]: CustomElement<{
        hidden: string | null;
        "charge-id": string | null;
        ref: React.RefObject<HTMLElement>;
      }>;
    }
  }
}
