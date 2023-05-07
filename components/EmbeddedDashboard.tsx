import {
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  IColumn,
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
import { useGetCharges } from "../hooks/useGetCharges";
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
import {
  DebugConfigElement,
  ExtendedStripeConnectInstance,
} from "./DebugConfigElement";
import { fetchClientSecret } from "../hooks/fetchClientSecret";
import { StripePublicKey } from "../config/ClientConfig";
import { getReadableAccountType } from "../utils/getReadableAccountType";
import { useGetCurrentAccount } from "../hooks/useGetCurrentAccount";

type Props = {
  account: Stripe.Account;
  platform: Stripe.Account;
  onTabChanged: (tab: string) => void;
  currentTab: string;
  onBackToMainAppClicked: () => void;
};

export const EmbeddedDashboardInternal: React.FC<Props> = (props) => {
  const {
    data: charges,
    isLoading: chargesIsLoading,
    error: chargesError,
  } = useGetCharges(props.account);
  const [chargeId, setChargeId] = React.useState<string | undefined>(undefined);
  const { isLoading, error, data } = useConnectJSInit(props.account.id);
  const {
    isLoading: isCurrentAccountLoading,
    isError: isCurrentAccountError,
    data: currentAccount,
  } = useGetCurrentAccount();

  const [connectElementOption, setConnectElementOption] = React.useState(
    "stripe-connect-payments",
  );

  if (error || chargesError || isCurrentAccountError) {
    return <Text>An error occurred</Text>;
  }

  if (
    isLoading ||
    chargesIsLoading ||
    !data ||
    isCurrentAccountLoading ||
    !currentAccount
  ) {
    return <Spinner label="Loading..." />;
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

  const copyEmbeddableScript = async () => {
    const newSecret = await fetchClientSecret(props.account.id);
    const injectableScript = `
document.body.appendChild(document.createElement('${connectElementOption}'));
const script = document.createElement('script')
script.src = 'https://connect-js.stripe.com/v0.1/connect.js';
document.head.appendChild(script)
window.StripeConnect = window.StripeConnect || {};
StripeConnect.onLoad = () => {
StripeConnect.init({
    clientSecret:'${newSecret}',
    publishableKey: '${StripePublicKey}',
});
};`;
    // Copy into clipboard
    navigator.clipboard.writeText(injectableScript);
  };

  return (
    <ConnectComponentsProvider connectInstance={data}>
      <Stack>
        <PrimaryButton onClick={props.onBackToMainAppClicked}>
          Back to main app
        </PrimaryButton>
        <Text
          styles={{
            root: {
              paddingBottom: "5px",
              paddingTop: "5px",
            },
          }}
        >
          Viewing connected account <em>{props.account.id}</em> (
          {getReadableAccountType(props.account)}) for platform{" "}
          <em>{currentAccount.id}</em>
        </Text>
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
                <Text>Payments (custom table)</Text>
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
            <PrimaryButton href={`https://go/o/${props.platform.id}`}>
              Login as CA
            </PrimaryButton>
            <StackItem>
              <Stack horizontal>
                <StackItem>
                  <PrimaryButton onClick={copyEmbeddableScript}>
                    Copy embeddable script
                  </PrimaryButton>
                  <Dropdown
                    selectedKey={connectElementOption}
                    onChange={(_ev, opt) =>
                      setConnectElementOption(
                        opt?.key?.toString() ?? "stripe-connect-payments",
                      )
                    }
                    options={[
                      {
                        key: "stripe-connect-payments",
                        text: "stripe-connect-payments",
                      },
                      {
                        key: "stripe-connect-payouts",
                        text: "stripe-connect-payouts",
                      },
                      {
                        key: "stripe-connect-account-management",
                        text: "stripe-connect-account-management",
                      },
                      {
                        key: "stripe-connect-account-onboarding",
                        text: "stripe-connect-account-onboarding",
                      },
                      {
                        key: "stripe-connect-debug-utils",
                        text: "stripe-connect-debug-utils",
                      },
                    ]}
                  />
                </StackItem>
              </Stack>
            </StackItem>
            <PrimaryButton
              onClick={async () => {
                const response = await fetch("/api/prefill-account", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    accountId: props.account.id,
                  }),
                });
                // TODO: refresh account?
              }}
            >
              Prefill account
            </PrimaryButton>
            <PrimaryButton
              onClick={async () => {
                const response = await fetch("/api/add-capabilities", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    accountId: props.account.id,
                  }),
                });
              }}
            >
              Add capabilities
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
            <DebugConfigElement
              connectInstance={data as ExtendedStripeConnectInstance}
            />
          </PivotItem>
          <PivotItem headerText="Pricing table" itemKey="Pricing table">
            <PricingTable />
          </PivotItem>
        </Pivot>
      </Stack>
    </ConnectComponentsProvider>
  );
};
