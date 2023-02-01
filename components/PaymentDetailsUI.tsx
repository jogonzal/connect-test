import * as React from "react";

export type Props = {
  chargeId: string | undefined;
  onPaymentDetailsHide: () => void;
};

export const PaymentDetailsUI: React.FC<Props> = ({
  chargeId,
  onPaymentDetailsHide,
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!elementRef.current) {
      return;
    }
    const currentElement = elementRef.current;
    const handleHiddenEvent = (_event: Event) => {
      // eslint-disable-next-line no-console
      console.log("Element has been hidden");
      onPaymentDetailsHide();
    };

    console.log("Added event listener");

    currentElement.addEventListener("close", handleHiddenEvent);
    return () => {
      currentElement.removeEventListener("close", handleHiddenEvent);
    };
  }, [elementRef, onPaymentDetailsHide]);

  return (
    <stripe-connect-payment-details charge-id={chargeId} ref={elementRef} />
  );
};
