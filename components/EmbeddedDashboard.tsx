import {
  DetailsList,
  DetailsListLayoutMode,
  Dropdown,
  IColumn,
  IIconProps,
  IconButton,
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
import { useGetCharges } from "../hooks/useGetCharges";
import { CustomersTab } from "./CustomersTab";
import { ExtractChargeFromStripeElements } from "./ExtractChargeFromStripeElements";
import { OnboardingExperienceExample } from "./OnboardingExperience";
import { PricingTable } from "./PricingTable";
import {
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
import { CreatePaymentDialog } from "./CreatePaymentDialog";
import { PaymentUIExperienceDialog } from "./PaymentUIExperienceDialog";
import { CreateTestDataDialog } from "./CreateTestDataDialog";
import {
  ConnectAccountManagement,
  ConnectAppOnboarding,
  ConnectAppSettings,
  ConnectCapitalOverview,
  ConnectDebugUIPreview,
  ConnectDebugUtils,
  ConnectInstantPayouts,
  ConnectNotificationBanner,
  ConnectPaymentMethodSettings,
  ConnectTransactions,
} from "../hooks/ConnectJsTypes";
import { assertNever } from "./assertNever";
import { useGetStarredAccounts } from "../hooks/useGetStarredAccounts";
import { db } from "../clientsStorage/Database";
import { useCreateTestIntervention } from "../hooks/useCreateTestIntervention";
import { CustomPaymentsTable } from "./CustomPaymentsTable";

const starIcon: IIconProps = { iconName: "FavoriteStar" };
const starFilledIcon: IIconProps = { iconName: "FavoriteStarFill" };

type Props = {
  account: Stripe.Account;
  platform: Stripe.Account;
  onSelectedComponentChanged: (tab: string) => void;
  selectedComponent: ComponentPage;
  onBackToMainAppClicked: () => void;
};

const componentPageList = [
  "Payments",
  "Transactions",
  "Payouts",
  "Apps",
  "Capital",
  "LPM",
  "Payment Details",
  "Onboarding",
  "Account management",
  "Test",
  "Debug",
  "Theming",
] as const;
export type ComponentPage = typeof componentPageList[number];

export const EmbeddedDashboardInternal: React.FC<Props> = (props) => {
  const {
    isLoading,
    error,
    data: stripeConnect,
  } = useConnectJSInit(props.account.id);
  const {
    isLoading: isCurrentAccountLoading,
    isError: isCurrentAccountError,
    data: currentAccount,
  } = useGetCurrentAccount();
  const {
    data: starredAccounts,
    isLoading: isGetStarredAccountsLoading,
    error: isGetStarredAccountsError,
    refetch: refetchStarredAccounts,
  } = useGetStarredAccounts();
  const {
    isLoading: isCreateTestInterventionLoading,
    isError: isCreateTestInterventionError,
    mutate: createTestIntervention,
  } = useCreateTestIntervention(props.account.id);

  const [showCheckoutDialogForMerchant, setShowCheckoutDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showPaymentDialogForMerchant, setShowPaymentDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showCreateTestDataDialog, setShgowCreateTestDataDialog] =
    React.useState<Stripe.Account | undefined>(undefined);

  const [connectElementOption, setConnectElementOption] = React.useState(
    "stripe-connect-payments",
  );

  if (error || isCurrentAccountError) {
    return <Text>An error occurred</Text>;
  }

  if (
    isLoading ||
    !stripeConnect?.stripeConnectInstance ||
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

  const renderAccountLoginLinks = () => {
    const toRender = [];
    if (props.account.type === "express") {
      const url = `/api/create-dashboard-login-link?connectedAccountId=${props.account.id}`;
      toRender.push(
        <>
          {" | "}
          <Link href={url}>Express login link</Link>
        </>,
      );
    }

    const loginAsUrl = `https://go/loginas/${props.account.id}`;
    toRender.push(
      <>
        {" | "}
        <Link href={loginAsUrl} target="_blank">
          Standard dash LoginAs
        </Link>
      </>,
    );

    return toRender;
  };

  const onboardAccountHosted = async (
    row: Stripe.Account,
    type: Stripe.AccountLinkCreateParams.Type,
  ) => {
    const accountsResponse = await fetch("/api/create-account-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: row.id,
        type: type,
      }),
    });
    if (!accountsResponse.ok) {
      throw new Error(`Unexpected response code ${accountsResponse.status}`);
    }
    const accountLink: Stripe.Response<Stripe.AccountLink> =
      await accountsResponse.json();
    window.open(accountLink.url);
  };

  const renderActions = () => {
    if (props.account.charges_enabled) {
      return (
        <>
          <Link onClick={() => setShowCheckoutDialogForMerchant(props.account)}>
            Create payment (card element, checkout, payment element)
          </Link>
          {" | "}
          <Link onClick={() => setShgowCreateTestDataDialog(props.account)}>
            Create test data (payout, payment, account debit)
          </Link>
          {" | "}
          <Link
            onClick={() =>
              onboardAccountHosted(props.account, "account_onboarding")
            }
          >
            Onboard (hosted)
          </Link>
          {" | "}
          <Link
            onClick={() =>
              onboardAccountHosted(props.account, "account_update")
            }
          >
            Update (hosted)
          </Link>
          {" | "}
          <Link onClick={() => createTestIntervention()}>
            Create test intervention
          </Link>
        </>
      );
    } else {
      return (
        <>
          DisabledReason: {props.account.requirements?.disabled_reason}
          {" | "}
          <Link
            onClick={() =>
              onboardAccountHosted(props.account, "account_onboarding")
            }
          >
            Onboard (hosted)
          </Link>{" "}
        </>
      );
    }
  };

  const logoutEmbedded = () => {
    if (!stripeConnect) {
      throw new Error("Embedded components are not defined");
    }

    stripeConnect.stripeConnectInstance.logout();
  };

  const renderDialogs = () => {
    return (
      <>
        {showCheckoutDialogForMerchant && (
          <CreatePaymentDialog
            account={showCheckoutDialogForMerchant}
            onDismiss={() => setShowCheckoutDialogForMerchant(undefined)}
          />
        )}
        {showPaymentDialogForMerchant && (
          <PaymentUIExperienceDialog
            account={showPaymentDialogForMerchant}
            onDismiss={() => setShowPaymentDialogForMerchant(undefined)}
          />
        )}
        {showCreateTestDataDialog && (
          <CreateTestDataDialog
            account={showCreateTestDataDialog}
            onDismiss={() => setShgowCreateTestDataDialog(undefined)}
          />
        )}
      </>
    );
  };

  const renderCurrentPage = (currentPage: ComponentPage) => {
    switch (currentPage) {
      case "Payments":
        return <ConnectPayments />;
      case "Transactions":
        return <ConnectTransactions />;
      case "Payouts":
        return (
          <>
            <ConnectInstantPayouts />
            <ConnectPayouts />
          </>
        );
      case "Apps":
        return (
          <>
            <ConnectAppOnboarding app="com.example.accounting-demo-app" />
            <ConnectAppSettings app="com.example.accounting-demo-app" />
          </>
        );
      case "Capital":
        return <ConnectCapitalOverview />;
      case "LPM":
        return <ConnectPaymentMethodSettings />;
      case "Payment Details":
        return <CustomPaymentsTable account={currentAccount} />;
      case "Onboarding":
        return <OnboardingExperienceExample />;
      case "Account management":
        return (
          <>
            {" "}
            <ConnectNotificationBanner />
            <ConnectAccountManagement />
          </>
        );
      case "Test":
        return (
          <>
            {" "}
            <Text>Testing extracting information from Connect elements</Text>
            <ExtractChargeFromStripeElements />
            <ConnectPayments />
            <Text>Testing Pricing table</Text>
            <PricingTable />
            <p>This is not a real connect element:</p>
            <CustomersTab accountId={props.account.id} />
          </>
        );
      case "Debug":
        return (
          <>
            <PrimaryButton onClick={logoutEmbedded}>
              Logout of connect embedded components
            </PrimaryButton>
            <ConnectDebugUtils />
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
          </>
        );
      case "Theming":
        return (
          <div style={{ backgroundColor: "white" }}>
            <DebugConfigElement
              connectInstance={
                stripeConnect.stripeConnectInstance as ExtendedStripeConnectInstance
              }
            />
            <ConnectDebugUIPreview />
          </div>
        );
      default:
        assertNever(currentPage);
        return <ConnectPayments />;
    }
  };
  const alreadyFavorited = starredAccounts?.find(
    (x) => x.id === props.account.id,
  );

  const starOrDelete = async (row: Stripe.Account) => {
    if (!alreadyFavorited) {
      await db.starredAccounts.add(row);
    } else {
      await db.starredAccounts.delete(row.id);
    }
    refetchStarredAccounts();
  };

  const renderStarAction = () => {
    return (
      <>
        <IconButton
          style={{ height: "16px", width: "16px" }}
          iconProps={alreadyFavorited ? starFilledIcon : starIcon}
          onClick={() => starOrDelete(props.account)}
        />
      </>
    );
  };

  return (
    <ConnectComponentsProvider
      connectInstance={stripeConnect.stripeConnectInstance}
    >
      <Stack>
        {renderDialogs()}
        <Stack horizontalAlign="space-between" horizontal>
          <StackItem align="start">
            <Stack>
              <Text
                styles={{
                  root: {
                    paddingBottom: "5px",
                    paddingTop: "5px",
                  },
                }}
              >
                Viewing connected account <em>{props.account.id}</em> ( type:{" "}
                {getReadableAccountType(props.account)},{" "}
                {renderAccountLoginLinks()}) for platform{" "}
                <em>{currentAccount.id}</em>
                <Text> {renderStarAction()}</Text>
              </Text>
              <Text>{renderActions()}</Text>
            </Stack>
          </StackItem>
          <StackItem align="center">
            <PrimaryButton onClick={props.onBackToMainAppClicked}>
              Back to main app
            </PrimaryButton>
          </StackItem>
        </Stack>
        <Dropdown
          selectedKey={props.selectedComponent}
          onChange={(ev, val) =>
            props.onSelectedComponentChanged((val?.key as string) ?? "USD")
          }
          options={componentPageList.map((p) => ({
            key: p,
            text: p,
          }))}
        />
        {renderCurrentPage(props.selectedComponent)}
      </Stack>
    </ConnectComponentsProvider>
  );
};
