import * as React from "react";
import { StripeConnectInstance } from "@stripe/connect-js";
import { ConnectDebugUIConfig } from "../hooks/ConnectJsTypes";

export type ExtendedStripeConnectInstance = StripeConnectInstance & {
  getCurrentConnectJSOptions: () =>
    | { appearance: Record<string, string> }
    | undefined;
  getConnectJSAppearanceOrder: () => string[] | undefined;
};

type Props = {
  connectInstance: ExtendedStripeConnectInstance;
};

/**
 * This is a wrapper for the component that shows the theming options for connect embedded UIs
 */
export const DebugConfigElement: React.FC<Props> = ({ connectInstance }) => {
  const [appearance, setAppearance] = React.useState<Record<string, string>>(
    {},
  );
  const [appearanceOrder, setAppearanceOrder] = React.useState<string[]>([]);
  const elementRef = React.useRef<HTMLElement>(null);

  const onConnectJSOptionsUpdated = (event: any) => {
    setAppearance(event.detail.values.appearance);
    setAppearanceOrder(event.detail.appearanceOptionsOrder);
  };

  React.useEffect(() => {
    // Ensure we have the initial values coming from the element
    // (this helps ensure initial state is consistent in scenarios where they were changed in a different page on the same session)
    const initialUpdateValues = connectInstance?.getCurrentConnectJSOptions();
    if (initialUpdateValues) {
      setAppearance(initialUpdateValues.appearance || {});
    }
    const initialAppearanceOrder =
      connectInstance?.getConnectJSAppearanceOrder();
    if (initialAppearanceOrder) {
      setAppearanceOrder(initialAppearanceOrder || []);
    }
  }, [connectInstance, elementRef, setAppearance, setAppearanceOrder]);

  return (
    <>
      <ConnectDebugUIConfig
        onConnectJSOptionsUpdated={onConnectJSOptionsUpdated}
      />
      <pre>{JSON.stringify(appearance, null, "\t")}</pre>
    </>
  );
};
