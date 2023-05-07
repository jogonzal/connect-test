import * as React from "react";
import { StripeConnectInstance } from "@stripe/connect-js";

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

  React.useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const currentElement = elementRef.current;
    const eventListener = (event: CustomEvent) => {
      setAppearance(event.detail.values.appearance);
      setAppearanceOrder(event.detail.appearanceOptionsOrder);
    };

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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - TS2769 - No overload matches this call.  Overload 1 of 2...
    currentElement.addEventListener("connectjsoptionsupdated", eventListener);
    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - TS2769 - No overload matches this call.  Overload 1 of 2...
      currentElement.removeEventListener(
        "connectjsoptionsupdated",
        eventListener,
      );
    };
  }, [connectInstance, elementRef, setAppearance, setAppearanceOrder]);

  return (
    <>
      <stripe-connect-debug-ui-config ref={elementRef} />
      <pre>{JSON.stringify(appearance, null, "\t")}</pre>
      <stripe-connect-debug-ui-preview />
    </>
  );
};
