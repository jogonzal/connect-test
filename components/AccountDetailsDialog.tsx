import {
  DetailsList,
  DetailsListLayoutMode,
  Dialog,
  IColumn,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextField,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useConnectJSInit } from "../hooks/useConnectJsInit";
import { useGetCharges } from "../hooks/useGetCharges";

type Props = {
  account: Stripe.Account;
  onDismiss: () => void;
};

export const AccountDetailsDialog: React.FC<Props> = (props) => {
  const { isLoading, error } = useConnectJSInit(props.account.id);

  if (error) {
    return <Text>An error occurred</Text>;
  }

  if (isLoading) {
    return <Spinner label="Loading charges..." />;
  }

  const getColumns = (): IColumn[] => {
    return [
      {
        key: "id",
        name: "id",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => row.id,
      },
      {
        key: "status",
        name: "status",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => row.status,
      },
      {
        key: "amount",
        name: "amount",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => row.amount,
      },
      {
        key: "currency",
        name: "currency",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => row.currency,
      },
      {
        key: "app_fees",
        name: "app_fees",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => row.application_fee_amount,
      },
    ];
  };

  return (
    <>
      <Dialog hidden={false} onDismiss={props.onDismiss} minWidth={800}>
        <Stack>
          <StackItem>
            <Text variant="large">Account {props.account.id}</Text>
          </StackItem>
          <StackItem>
            <TextField
              multiline
              rows={20}
              value={JSON.stringify(props.account, null, 2)}
              width={800}
            />
          </StackItem>
        </Stack>
      </Dialog>
    </>
  );
};
