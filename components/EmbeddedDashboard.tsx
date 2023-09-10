import {
  DefaultButton,
  Dropdown,
  IIconProps,
  IconButton,
  Link,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useConnectJSInit } from "../hooks/useConnectJsInit";
import { CustomersTab } from "./CustomersTab";
import { ExtractChargeFromStripeElements } from "./ExtractChargeFromStripeElements";
import { OnboardingExperienceExample } from "./OnboardingExperience";
import { PricingTable } from "./PricingTable";
import {
  ConnectComponentsProvider,
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
  "Account Onboarding",
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
    isLoading: isPlatformAccountLoading,
    isError: isPlatformAccountError,
    data: platformAccount,
  } = useGetCurrentAccount();
  const {
    data: starredAccounts,
    isLoading: isGetStarredAccountsLoading,
    error: isGetStarredAccountsError,
    refetch: refetchStarredAccounts,
  } = useGetStarredAccounts();

  const [showCreateTestDataDialog, setShowCreateTestDataDialog] =
    React.useState<Stripe.Account | undefined>(undefined);

  const [connectElementOption, setConnectElementOption] = React.useState(
    "stripe-connect-payments",
  );

  if (error || isPlatformAccountError) {
    return <Text>An error occurred</Text>;
  }

  if (
    isLoading ||
    !stripeConnect?.stripeConnectInstance ||
    isPlatformAccountLoading ||
    !platformAccount
  ) {
    return <Spinner label="Loading..." />;
  }

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
    const renderExpressLoginLink = () => {
      if (props.account.type === "express" || props.account.type === "custom") {
        const url = `/api/create-dashboard-login-link?connectedAccountId=${props.account.id}`;
        return (
          <>
            {" | "}
            <Link href={url}>Express login link</Link>
          </>
        );
      }
    };

    const renderStandardLoginLink = () => {
      const loginAsUrl = `https://go/loginas/${props.account.id}`;
      return (
        <>
          {" | "}
          <Link href={loginAsUrl} target="_blank">
            Standard dashboard LoginAs
          </Link>
        </>
      );
    };

    return (
      <>
        {renderExpressLoginLink()}
        {renderStandardLoginLink()}
      </>
    );
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
        {showCreateTestDataDialog && (
          <CreateTestDataDialog
            account={showCreateTestDataDialog}
            onDismiss={() => setShowCreateTestDataDialog(undefined)}
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
        return <CustomPaymentsTable account={props.account} />;
      case "Account Onboarding":
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

  const renderAccountOnboardedStatus = (account: Stripe.Account) => {
    return `Details submitted: ${account.details_submitted ? "Yes" : "No"} | `;
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
                <em>{platformAccount.id}</em>
                <Text> {renderStarAction()}</Text>
              </Text>
              <Text
                style={{
                  paddingBottom: "5px",
                }}
              >
                {renderAccountOnboardedStatus(props.account)}
                Charges enabled: {props.account.charges_enabled
                  ? "Yes"
                  : "No"}{" "}
                | Payouts enabled:{" "}
                {props.account.payouts_enabled ? "Yes" : "No"}{" "}
              </Text>
              <PrimaryButton
                onClick={() => setShowCreateTestDataDialog(props.account)}
                style={{
                  marginBottom: "5px",
                }}
              >
                Create test data (charges, payouts, account debits,
                interventions...)
              </PrimaryButton>
            </Stack>
          </StackItem>
          <StackItem align="center">
            <DefaultButton onClick={props.onBackToMainAppClicked}>
              Back to main app
            </DefaultButton>
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
          style={{
            marginBottom: "5px",
          }}
        />
        {renderCurrentPage(props.selectedComponent)}
      </Stack>
    </ConnectComponentsProvider>
  );
};
