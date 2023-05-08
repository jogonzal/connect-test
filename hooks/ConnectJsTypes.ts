import React, { DOMAttributes } from "react";

export type CustomElement<T> = Partial<
  T &
    React.DOMAttributes<T> & {
      children?: React.ReactNode | undefined;
      ref: React.RefObject<HTMLElement>;
    }
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      ["stripe-connect-debug-utils"]: CustomElement<{}>;
      ["stripe-connect-transactions"]: CustomElement<{}>;
      ["stripe-connect-debug-ui-config"]: CustomElement<{}>;
      ["stripe-connect-debug-ui-preview"]: CustomElement<{}>;
      ["stripe-pricing-table"]: CustomElement<{}>;
    }
  }
}
