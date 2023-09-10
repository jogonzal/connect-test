import {
  Spinner,
  IColumn,
  PrimaryButton,
  Stack,
  StackItem,
  DetailsList,
  DetailsListLayoutMode,
  Text,
} from "@fluentui/react";
import { ConnectPaymentDetails } from "@stripe/react-connect-js";
import * as React from "react";
import Stripe from "stripe";
import { useGetCharges } from "../hooks/useGetCharges";
import { CreateTestDataAction } from "./CreateTestDataAction";
import { useEditPaymentIntent } from "../hooks/useEditPaymentIntent";

const EditPaymentIntentButton = ({
  id,
  accountId,
}: {
  id: string;
  accountId: string;
}) => {
  const editPaymentIntentHook = useEditPaymentIntent(accountId, id);

  return (
    <CreateTestDataAction buttonText="Edit" hookData={editPaymentIntentHook} />
  );
};

export const CustomPaymentsTable = ({
  account,
}: {
  account: Stripe.Account;
}) => {
  const {
    data: charges,
    isLoading: chargesIsLoading,
    error: chargesError,
  } = useGetCharges(account);
  const [chargeId, setChargeId] = React.useState<string | undefined>(undefined);

  if (chargesError) {
    return <Text>An error occurred</Text>;
  }

  if (chargesIsLoading) {
    return <Spinner label="Loading..." />;
  }

  console.log("Got charges", charges);

  const getColumns = (): IColumn[] => {
    return [
      {
        key: "id",
        name: "id",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => row.id,
      },
      {
        key: "description",
        name: "description",
        minWidth: 150,
        onRender: (row: Stripe.PaymentIntent) => row.description,
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
      {
        key: "edit_description_destionation",
        name: "Edit description",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => (
          <EditPaymentIntentButton id={row.id} accountId={account.id} />
        ),
      },
      {
        key: "view_details",
        name: "details",
        minWidth: 100,
        onRender: (row: Stripe.PaymentIntent) => (
          <>
            <PrimaryButton onClick={() => setChargeId(row.id)}>
              Detail
            </PrimaryButton>
          </>
        ),
      },
    ];
  };

  const renderPaymentDetailUI = () => {
    if (!chargeId) return null;

    return (
      <ConnectPaymentDetails
        chargeId={chargeId}
        visible={!!chargeId}
        onClose={() => setChargeId(undefined)}
      />
    );
  };

  return (
    <>
      {renderPaymentDetailUI()}
      <Stack>
        <StackItem>
          <Text>Payments (custom table)</Text>
          {charges && (
            <DetailsList
              items={charges.data}
              columns={getColumns()}
              layoutMode={DetailsListLayoutMode.justified}
            />
          )}
        </StackItem>
      </Stack>
    </>
  );
};
