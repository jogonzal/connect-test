import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  Link,
  Pivot,
  PivotItem,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useConnectJSInit } from "../hooks/useConnectJsInit";
import { useGetAccount } from "../hooks/useGetAccount";
import { useGetCharges } from "../hooks/useGetCharges";
import { ExtractChargeFromStripeElements } from "./ExtractChargeFromStripeElements";
import { OnboardingExperienceExample } from "./OnboardingExperience";
import { PaymentDetailsUI } from "./PaymentDetailsUI";

export const EmbeddedDashboard = () => {
  const accountId = new URL(window.location.href).searchParams.get("account");
  const { data: account, isLoading, error } = useGetAccount(accountId);

  if (error) {
    return <Text>Failed to get account</Text>;
  }

  if (isLoading || !account) {
    return <Spinner label="Getting account..." />;
  }

  return <EmbeddedDashboardInternal account={account} />;
};

type Props = {
  account: Stripe.Account;
};

export const EmbeddedDashboardInternal: React.FC<Props> = (props) => {
  const {
    data: charges,
    isLoading: chargesIsLoading,
    error: chargesError,
  } = useGetCharges(props.account);
  const [chargeId, setChargeId] = React.useState<string | undefined>(undefined);
  const { isLoading, error } = useConnectJSInit(props.account.id);

  if (error || chargesError) {
    return <Text>An error occurred</Text>;
  }

  if (isLoading || chargesIsLoading) {
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
      <PaymentDetailsUI
        chargeId={chargeId}
        onPaymentDetailsHide={() => setChargeId(undefined)}
      ></PaymentDetailsUI>
    );
  };

  return (
    <Pivot>
      <PivotItem headerText="Payments">
        <stripe-payments-experience />
      </PivotItem>
      <PivotItem headerText="Payouts">
        <stripe-payouts-experience />
      </PivotItem>
      <PivotItem headerText="Payment details">
        {renderPaymentDetailUI()}
        <Stack>
          <StackItem>
            <Text variant="large">
              Viewing embedded dashboard for account {props.account.id}
            </Text>
          </StackItem>
          <StackItem>
            <Link href="/">Back to home - </Link>
            <Text>Payments</Text>
            {charges && (
              <DetailsList
                items={charges}
                columns={getColumns()}
                layoutMode={DetailsListLayoutMode.justified}
              />
            )}
          </StackItem>
        </Stack>
      </PivotItem>
      <PivotItem headerText="Embedded onboarding">
        <OnboardingExperienceExample />
      </PivotItem>
      <PivotItem headerText="Account management">
        <stripe-account-management-experience />
      </PivotItem>
      <PivotItem headerText="Isolation test">
        <ExtractChargeFromStripeElements />
        <stripe-payments-experience />
      </PivotItem>
    </Pivot>
  );
};
