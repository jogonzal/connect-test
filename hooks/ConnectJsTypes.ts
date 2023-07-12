import {
  useAttachEvent,
  useCreateComponent,
  useAttachAttribute,
} from "@stripe/react-connect-js";
import React from "react";

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
      ["stripe-pricing-table"]: CustomElement<{}>;
    }
  }
}

// Not yet shipped connect elements

export const ConnectNotificationBanner = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-notification-banner" as any,
  );
  return wrapper;
};

export const ConnectInstantPayouts = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-instant-payouts" as any,
  );
  return wrapper;
};

export const ConnectTransactions = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-transactions-list" as any,
  );
  return wrapper;
};

export const ConnectDebugUIPreview = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-debug-ui-preview" as any,
  );
  return wrapper;
};

export const ConnectDebugUtils = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-debug-utils" as any,
  );
  return wrapper;
};

export const ConnectAccountManagement = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-account-management" as any,
  );
  return wrapper;
};

export const ConnectPaymentMethodSettings = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-payment-method-settings" as any,
  );
  return wrapper;
};

export const ConnectAppSettings = ({ app }: { app: string }): JSX.Element => {
  const { wrapper, component } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-app-settings" as any,
  );

  useAttachAttribute(component, "app", app);

  return wrapper;
};

export const ConnectAppOnboarding = ({ app }: { app: string }): JSX.Element => {
  const { wrapper, component } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-app-onboarding" as any,
  );

  useAttachAttribute(component, "app", app);

  return wrapper;
};

export const ConnectCapitalOverview = (): JSX.Element => {
  const { wrapper } = useCreateComponent(
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    "stripe-connect-capital-overview" as any,
  );
  return wrapper;
};

export const ConnectAccountOnboarding = ({
  onOnboardingExited,
}: {
  onOnboardingExited: () => void;
}): JSX.Element | null => {
  const { wrapper, component: onboarding } = useCreateComponent(
    "stripe-connect-account-onboarding" as any,
  );

  useAttachEvent(onboarding, "onboardingexited" as any, onOnboardingExited); // Assuming an 'onboardingexited' event

  return wrapper;
};

export const ConnectDebugUIConfig = ({
  onConnectJSOptionsUpdated,
}: {
  onConnectJSOptionsUpdated: (event: any) => void;
}): JSX.Element | null => {
  const { wrapper, component: onboarding } = useCreateComponent(
    "stripe-connect-debug-ui-config" as any,
  );

  useAttachEvent(
    onboarding,
    "connectjsoptionsupdated" as any,
    onConnectJSOptionsUpdated as any,
  ); // Assuming an 'onboardingexited' event

  return wrapper;
};
