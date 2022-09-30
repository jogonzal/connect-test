import React, { FormEvent } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import { CardSection } from "./CardSection";
import { PrimaryButton, Separator, Spinner } from "@fluentui/react";

interface Props {
  paymentIntentSecret: string;
  onSuccessfulPayment: () => void;
}

export const CheckoutForm: React.FC<Props> = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [performingPayment, setPerformingPayment] = React.useState(false);

  const onPerformPaymentClicked = async () => {
    setPerformingPayment(true);
    try {
      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        console.log("Stripe JS or elements not loaded yet");
        return;
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        console.log("Card element not present");
        return;
      }

      const result = await stripe.confirmCardPayment(
        props.paymentIntentSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Jenny Rosen",
            },
          },
        },
      );

      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        console.log(result.error.message);
      } else {
        // The payment has been processed!
        if (result.paymentIntent.status === "succeeded") {
          // Show a success message to your customer
          // There's a risk of the customer closing the window before callback
          // execution. Set up a webhook or plugin to listen for the
          // payment_intent.succeeded event that handles any business critical
          // post-payment actions
          console.log("Successful payment!");
          props.onSuccessfulPayment();
        }
      }
    } catch (error) {
      console.log("Error occurred", error);
    } finally {
      setPerformingPayment(false);
    }
  };

  const renderSpinner = () => {
    if (performingPayment || !stripe) {
      return <Spinner />;
    }
  };

  return (
    <>
      {renderSpinner()}
      <div style={{ display: performingPayment ? "none" : "block" }}>
        <CardSection />
        <Separator />
        <PrimaryButton onClick={onPerformPaymentClicked}>Pay</PrimaryButton>
      </div>
    </>
  );
};
