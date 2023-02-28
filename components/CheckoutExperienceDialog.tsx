import {
  Checkbox,
  Dialog,
  PrimaryButton,
  Separator,
  Stack,
  StackItem,
  Text,
  TextField,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { PaymentsUIClientSecret } from "./PaymentsUIClientSecret";

type Props = {
  account: Stripe.Account;
  onDismiss: () => void;
  onSuccessfulPayment: (account: Stripe.Account) => void;
};

export const CheckoutExperienceDialog: React.FC<Props> = (props) => {
  const [productName, setProductName] = React.useState("Test product");
  const [amount, setAmount] = React.useState(1000);
  const [applicationFee, setApplicationFee] = React.useState(100);
  const [paymentUI, setPaymentUI] = React.useState<boolean>(false);
  const [destinationCharge, setDestinationCharge] =
    React.useState<boolean>(false);
  const [useTransferAmount, setUseTransferAmount] =
    React.useState<boolean>(false);
  const [paymentsUIClientSecret, setPaymentsUIClientSecret] = React.useState<
    string | undefined
  >(undefined);

  const currentAccountFullDetails = props.account;

  const onCheckoutClicked = () => {
    const params: Record<string, string> = {
      productName,
      amount: amount.toString(),
      applicationFee: applicationFee.toString(),
      destinationCharge: destinationCharge.toString(),
      connectedAccountId: currentAccountFullDetails.id,
      useTransferAmount: (destinationCharge && useTransferAmount).toString(),
    };

    window.location.href =
      "/api/checkout-session?" + new URLSearchParams(params).toString();
  };

  const onPaymentUIClicked = async () => {
    setPaymentUI(true);
    const paymentIntentResponse = await fetch("/api/create-payment-intent", {
      method: "post",
      body: JSON.stringify({
        amount,
        productName,
        applicationFee,
        connectedAccountId: currentAccountFullDetails.id,
        destinationCharge: destinationCharge,
        useTransferAmount: destinationCharge && useTransferAmount,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const clientSecret: string = await paymentIntentResponse.text();
    setPaymentsUIClientSecret(clientSecret);
  };

  const onCardUIClicked = async () => {
    const paymentIntentResponse = await fetch("/api/create-payment-intent", {
      method: "post",
      body: JSON.stringify({
        amount,
        productName,
        applicationFee,
        connectedAccountId: currentAccountFullDetails.id,
        destinationCharge: destinationCharge,
        useTransferAmount: destinationCharge && useTransferAmount,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const clientSecret: string = await paymentIntentResponse.text();
    setPaymentsUIClientSecret(clientSecret);
  };

  const renderDialogContent = () => {
    if (paymentsUIClientSecret) {
      return (
        <Stack>
          <StackItem>
            <Text variant="large">Payment elements</Text>
          </StackItem>
          <Separator />
          <StackItem>
            <PaymentsUIClientSecret
              destinationCharge={destinationCharge}
              secret={paymentsUIClientSecret}
              account={currentAccountFullDetails}
              onSuccessfulPayment={() =>
                props.onSuccessfulPayment(currentAccountFullDetails)
              }
              usePaymentUI={paymentUI}
            />
          </StackItem>
        </Stack>
      );
    }

    return (
      <Stack>
        <StackItem>
          <Text variant="large">Account {currentAccountFullDetails.id}</Text>
        </StackItem>
        <StackItem>
          <Stack>
            <TextField
              label="Product name"
              value={productName}
              onChange={(ev, s) => setProductName(s ?? "")}
            />
            <TextField
              label="Amount"
              value={amount.toString()}
              onChange={(ev, s) => setAmount(parseInt(s ?? "0"))}
            />
            <TextField
              label="App fee"
              value={applicationFee.toString()}
              onChange={(ev, s) => setApplicationFee(parseInt(s ?? "0"))}
            />
            <Checkbox
              label="Destination charge"
              checked={destinationCharge}
              onChange={(ev, s) => setDestinationCharge(!!s)}
            />
            {destinationCharge && (
              <Checkbox
                label="Use transfer amount"
                checked={useTransferAmount}
                onChange={(ev, s) => setUseTransferAmount(!!s)}
              />
            )}
          </Stack>
        </StackItem>
        <StackItem>
          <PrimaryButton onClick={onCheckoutClicked}>Checkout</PrimaryButton>
          <PrimaryButton onClick={onPaymentUIClicked}>
            Payment Element
          </PrimaryButton>
          <PrimaryButton onClick={onCardUIClicked}>Card Element</PrimaryButton>
        </StackItem>
      </Stack>
    );
  };

  return (
    <Dialog
      hidden={false}
      onDismiss={() => {
        setPaymentsUIClientSecret(undefined);
        props.onDismiss();
      }}
      minWidth={800}
    >
      {renderDialogContent()}
    </Dialog>
  );
};
