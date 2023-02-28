import React, { FormEvent } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  PaymentElement,
  AddressElement,
} from "@stripe/react-stripe-js";

import { PrimaryButton, Separator, Spinner, Text } from "@fluentui/react";

interface Props {
  paymentIntentSecret: string;
  onSuccessfulPayment: () => void;
  usePaymentUI: boolean;
}

export const CheckoutForm: React.FC<Props> = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [performingPayment, setPerformingPayment] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setPerformingPayment(true);

    const url = new URL(window.location.href);
    const returnUrl = `${url.protocol}//${url.host}/`;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: returnUrl,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setError(error.message);
    } else {
      setError("An unexpected error occurred.");
    }

    setPerformingPayment(false);
  };

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

  const renderError = () => {
    if (error) {
      return <Text>An error ocurred! {JSON.stringify(error)}</Text>;
    }
  };

  return (
    <>
      {renderSpinner()}
      {renderError()}
      {props.usePaymentUI ? (
        <form id="payment-form" onSubmit={handleSubmit}>
          <PaymentElement />
          <AddressElement options={{ mode: "shipping" }} />
          <div style={{ height: "200px" }} />
          <PrimaryButton id="submit" onClick={handleSubmit}>
            Submit
          </PrimaryButton>
        </form>
      ) : (
        <div style={{ display: performingPayment ? "none" : "block" }}>
          <CardElement />
          <Separator />
          <PrimaryButton onClick={onPerformPaymentClicked}>Pay</PrimaryButton>
        </div>
      )}
    </>
  );
};
