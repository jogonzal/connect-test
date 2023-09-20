import {
  Checkbox,
  Dialog,
  Dropdown,
  PrimaryButton,
  Separator,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextField,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { PaymentsUIClientSecret } from "./PaymentsUIClientSecret";
import { useCreateTestCharge } from "../hooks/useCreateTestCharge";
import { CreateTestDataAction } from "./CreateTestDataAction";

type Props = {
  account: Stripe.Account;
  onDismiss: () => void;
};

export const CreateAdvancedChargeDialog: React.FC<Props> = (props) => {
  const [productName, setProductName] = React.useState("Test product");
  const [amount, setAmount] = React.useState(1000);
  const [applicationFee, setApplicationFee] = React.useState(100);
  const [paymentUI, setPaymentUI] = React.useState<boolean>(false);
  const [destinationCharge, setDestinationCharge] =
    React.useState<boolean>(false);
  const [useTransferAmount, setUseTransferAmount] =
    React.useState<boolean>(false);
  const [useOBO, setUseOBO] = React.useState<boolean>(false);
  const [paymentsUIClientSecret, setPaymentsUIClientSecret] = React.useState<
    string | undefined
  >(undefined);

  const [currency, setCurrency] = React.useState<string>("USD");

  const [successfulPayment, setSuccessfulPayment] =
    React.useState<boolean>(false);

  const [disputed, setDisputed] = React.useState<boolean>(false);
  const [uncaptured, setUncaptured] = React.useState<boolean>(false);

  const createTestChargeHook = useCreateTestCharge(
    props.account.id,
    productName,
    destinationCharge,
    useTransferAmount,
    amount,
    applicationFee,
    useOBO,
    currency,
    disputed,
    uncaptured,
  );

  const currentAccountFullDetails = props.account;

  const onCheckoutClicked = () => {
    const params: Record<string, string> = {
      productName,
      amount: amount.toString(),
      applicationFee: applicationFee.toString(),
      destinationCharge: destinationCharge.toString(),
      connectedAccountId: currentAccountFullDetails.id,
      useTransferAmount: (destinationCharge && useTransferAmount).toString(),
      useOBO: (destinationCharge && useOBO).toString(),
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
        useOBO: destinationCharge && useOBO,
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
        useOBO: destinationCharge && useOBO,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const clientSecret: string = await paymentIntentResponse.text();
    setPaymentsUIClientSecret(clientSecret);
  };

  const renderDialogContent = () => {
    if (successfulPayment) {
      return (
        <Stack>
          <StackItem>
            <Text variant="large">Payment successful!</Text>
          </StackItem>
          <PrimaryButton onClick={props.onDismiss}>Close</PrimaryButton>
        </Stack>
      );
    }

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
              onSuccessfulPayment={() => {
                setSuccessfulPayment(true);
              }}
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
              label="Description"
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
              label="Disputed (only works for 'Create via API')"
              checked={disputed}
              onChange={(ev, s) => setDisputed(!!s)}
            />
            <Checkbox
              label="Uncaptured (only works for 'Create via API')"
              checked={uncaptured}
              onChange={(ev, s) => setUncaptured(!!s)}
            />
            <Checkbox
              label="Destination charge"
              checked={destinationCharge}
              onChange={(ev, s) => setDestinationCharge(!!s)}
            />
            {destinationCharge && (
              <>
                <Checkbox
                  label="Use transfer amount"
                  checked={useTransferAmount}
                  onChange={(ev, s) => setUseTransferAmount(!!s)}
                />
                <Checkbox
                  label="OBO"
                  checked={useOBO}
                  onChange={(ev, s) => setUseOBO(!!s)}
                />
              </>
            )}
            <Dropdown
              selectedKey={currency}
              onChange={(ev, val) => setCurrency((val?.key as string) ?? "USD")}
              placeholder="USD"
              options={[
                {
                  key: "USD",
                  text: "USD",
                },
                {
                  key: "EUR",
                  text: "EUR",
                },
                {
                  key: "GBP",
                  text: "GBP",
                },
                {
                  key: "MXN",
                  text: "MXN",
                },
              ]}
              label="Currency"
            />
          </Stack>
        </StackItem>
        <StackItem>
          <PrimaryButton onClick={onCheckoutClicked}>Checkout</PrimaryButton>
          <PrimaryButton onClick={onPaymentUIClicked}>
            Payment Element
          </PrimaryButton>
          <PrimaryButton onClick={onCardUIClicked}>Card Element</PrimaryButton>
          <CreateTestDataAction
            buttonText="Create via API"
            hookData={createTestChargeHook}
          />
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
