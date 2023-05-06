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
import { useGetCurrentAccount } from "../hooks/useGetCurrentAccount";
import { CustomersTab } from "./CustomersTab";
import { ExtractChargeFromStripeElements } from "./ExtractChargeFromStripeElements";
import { OnboardingExperienceExample } from "./OnboardingExperience";
import { PricingTable } from "./PricingTable";
import {
  ConnectAccountManagement,
  ConnectComponentsProvider,
  ConnectPaymentDetails,
  ConnectPayments,
  ConnectPayouts,
} from "@stripe/react-connect-js";
import { DebugConfigElement } from "./DebugConfigElement";

export const EmbeddedDashboard = () => {
  const initialTab =
    new URL(window.location.href).hash.replaceAll("#", "") ?? "Payments";
  const accountId = new URL(window.location.href).searchParams.get("account");

  const { data: account, isLoading, error } = useGetAccount(accountId);
  const {
    data: platform,
    isLoading: isPlatformLoading,
    error: isPlatformError,
  } = useGetCurrentAccount();

  const [currentTab, setCurrentTab] = React.useState<string>(initialTab);

  if (error || isPlatformError) {
    return <Text>Failed to get account</Text>;
  }

  if (isLoading || !account || isPlatformLoading || !platform) {
    return <Spinner label="Getting account..." />;
  }

  return (
    <EmbeddedDashboardInternal
      currentTab={currentTab}
      account={account}
      platform={platform}
      onTabChanged={(tab: string) => {
        setCurrentTab(tab);
        window.location.hash = tab;
      }}
    />
  );
};

type Props = {
  account: Stripe.Account;
  platform: Stripe.Account;
  onTabChanged: (tab: string) => void;
  currentTab: string;
};

export const EmbeddedDashboardInternal: React.FC<Props> = (props) => {
  const {
    data: charges,
    isLoading: chargesIsLoading,
    error: chargesError,
  } = useGetCharges(props.account);
  const [chargeId, setChargeId] = React.useState<string | undefined>(undefined);
  const { isLoading, error, data } = useConnectJSInit(props.account.id);

  if (error || chargesError) {
    return <Text>An error occurred</Text>;
  }

  if (isLoading || chargesIsLoading || !data) {
    return <Spinner label="Loading charges..." />;
  }

  const loginAsExpress = async () => {
    const response = await fetch("/api/express-login-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: props.account.id,
      }),
    });
    if (!response.ok) {
      throw new Error(`Unexpected response code ${response.status}`);
    }
    const json = await response.json();
    window.open(json.url);
  };

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
      <ConnectPaymentDetails
        chargeId={chargeId}
        visible={!!chargeId}
        onClose={() => setChargeId(undefined)}
      />
    );
  };

  return (
    <ConnectComponentsProvider connectInstance={data}>
      <Stack>
        <PrimaryButton href="/">Back to main app</PrimaryButton>
        <Pivot
          onLinkClick={(a, b) => {
            props.onTabChanged(a?.props.itemKey ?? "");
          }}
          selectedKey={props.currentTab}
          defaultSelectedKey="Payments"
        >
          <PivotItem headerText="Payments" itemKey="Payments">
            <ConnectPayments />
          </PivotItem>
          <PivotItem headerText="Payouts" itemKey="Payouts">
            <ConnectPayouts />
          </PivotItem>
          <PivotItem headerText="Payment details" itemKey="Payment details">
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
          <PivotItem
            headerText="Embedded onboarding"
            itemKey="Embedded onboarding"
          >
            <OnboardingExperienceExample />
          </PivotItem>
          <PivotItem
            headerText="Account management"
            itemKey="Account management"
          >
            <ConnectAccountManagement />
          </PivotItem>
          <PivotItem headerText="Isolation test" itemKey="Isolation test">
            <ExtractChargeFromStripeElements />
            <ConnectPayments />
          </PivotItem>
          <PivotItem headerText="Customers" itemKey="Customers">
            <CustomersTab accountId={props.account.id} />
          </PivotItem>
          <PivotItem headerText="Debug" itemKey="Debug">
            <stripe-connect-debug-utils />
            <PrimaryButton onClick={loginAsExpress}>
              Login to express
            </PrimaryButton>
            <PrimaryButton href={`https://go/o/${props.account.id}`}>
              Login as CA
            </PrimaryButton>
            <PrimaryButton href={`https://go/o/${props.platform.id}`}>
              Login as CA
            </PrimaryButton>
          </PivotItem>
          <PivotItem headerText="Theming" itemKey="Theming">
            <div
              style={{
                backgroundColor: "var(--jorgecolor)",
              }}
            >
              {'This div has background color "var(--jorgecolor)"'}
            </div>
            <stripe-connect-debug-ui-config />
            <DebugConfigElement />
          </PivotItem>
          <PivotItem headerText="Pricing table" itemKey="Pricing table">
            <PricingTable />
          </PivotItem>
        </Pivot>
      </Stack>
    </ConnectComponentsProvider>
  );
};
