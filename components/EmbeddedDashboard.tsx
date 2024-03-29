import {
  DefaultButton,
  Dropdown,
  IIconProps,
  IconButton,
  Link,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useConnectJSInit } from "../hooks/useConnectJsInit";
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
  ConnectCapitalOffer,
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
import { AccountDetailsDialog } from "./AccountDetailsDialog";
import { serializeError } from "serialize-error";
import { getFeaturesConfigInStorage } from "../clientsStorage/LocalStorageEntry";

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
  "Capital Offer",
  "Capital Overview",
  "LPM",
  "Payment Details",
  "Account Onboarding",
  "Account management",
  "Theming",
  "Pricing table",
  "Debug",
] as const;
export type ComponentPage = typeof componentPageList[number];

const componentPageDisplayName: Partial<Record<ComponentPage, string>> = {
  Theming: "Debug: Theming",
  "Pricing table": "Debug: Pricing table",
};

export const EmbeddedDashboardInternal: React.FC<Props> = (props) => {
  const {
    isLoading,
    error: connectJsInitError,
    data: stripeConnect,
  } = useConnectJSInit(props.account.id);
  const {
    isLoading: isPlatformAccountLoading,
    error: platformAccountError,
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
  const [currentAccountFullDetails, setCurrentAccountFullDetails] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [
    currentAccountIsConnectedAccount,
    setCurrentAccountIsConnectedAccount,
  ] = React.useState<boolean>(false);

  const [connectElementOption, setConnectElementOption] = React.useState(
    "stripe-connect-payments",
  );

  if (connectJsInitError || platformAccountError) {
    return (
      <Text>
        An error occurred{" "}
        {JSON.stringify(
          serializeError(connectJsInitError ?? platformAccountError),
        )}
      </Text>
    );
  }

  if (
    isLoading ||
    !stripeConnect?.stripeConnectInstance ||
    isPlatformAccountLoading ||
    !platformAccount
  ) {
    return <Spinner label="Loading..." />;
  }

  const readableAccountType = getReadableAccountType(props.account);

  const copyEmbeddableScript = async () => {
    const newSecret = await fetchClientSecret(
      props.account.id,
      getFeaturesConfigInStorage(),
    );
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

  const logoutEmbedded = () => {
    if (!stripeConnect) {
      throw new Error("Embedded components are not defined");
    }

    stripeConnect.stripeConnectInstance.logout();
  };

  const renderDialogs = () => {
    return (
      <>
        {/* Render dialogs */}
        {currentAccountFullDetails && (
          <AccountDetailsDialog
            isConnectedAccount={currentAccountIsConnectedAccount}
            account={currentAccountFullDetails}
            onDismiss={() => setCurrentAccountFullDetails(undefined)}
          />
        )}
        {showCreateTestDataDialog && (
          <CreateTestDataDialog
            account={showCreateTestDataDialog}
            onDismiss={() => setShowCreateTestDataDialog(undefined)}
          />
        )}
      </>
    );
  };

  const renderDashboardLinks = () => {
    const hasAccessToStandard =
      props.account.controller?.dashboard?.type === "full";
    const hasAccessToExpress =
      props.account.controller?.dashboard?.type === "express";

    // Technically checking dashboard type should work, but it doesn't as `controller` is not returned for non CBSP accounts
    if (
      hasAccessToStandard ||
      readableAccountType === "UA1" ||
      readableAccountType === "UA2" ||
      readableAccountType === "standard" ||
      readableAccountType === "standard CBSP" ||
      readableAccountType === "standard nonCBSP"
    ) {
      return (
        <MessageBar>
          This account has access to the Stripe standard dashboard.
          <Link
            href={`https://go/loginas/${props.account.id}`}
            target="_blank"
            underline
          >
            Click here to open the standard dashboard for this account
          </Link>
        </MessageBar>
      );
    }

    if (
      hasAccessToExpress
      //  readableAccountType === "UA4" || readableAccountType === "express"
    ) {
      return (
        <MessageBar>
          This account has access to the express dashboard.
          <Link
            href={`/api/create-dashboard-login-link?connectedAccountId=${props.account.id}`}
            target="_blank"
            underline
          >
            Click here to open the express dashboard for this account
          </Link>
        </MessageBar>
      );
    }

    return null;
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
      case "Capital Offer":
        return (
          <Stack tokens={{ childrenGap: "5px" }}>
            <StackItem>
              <Text>
                If there is no offer for this account, then the component will
                render blank (expected behavior)
              </Text>
            </StackItem>
            <StackItem>
              <ConnectCapitalOffer />
            </StackItem>
          </Stack>
        );
      case "Capital Overview":
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
      case "Pricing table":
        return (
          <>
            <Text>Testing Pricing table</Text>
            <PricingTable />
          </>
        );
      case "Debug":
        return (
          <Stack tokens={{ childrenGap: "5px" }}>
            <StackItem>
              <PrimaryButton onClick={logoutEmbedded}>
                Logout of connect embedded components
              </PrimaryButton>
            </StackItem>
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
          </Stack>
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
      <Stack tokens={{ childrenGap: "5px" }}>
        {renderDialogs()}
        <StackItem>
          <MessageBar messageBarType={MessageBarType.warning}>
            This app is deprecated and has moved to https://go/connect-test.
            Please use that going forward
          </MessageBar>
        </StackItem>
        <Stack horizontalAlign="space-between" horizontal>
          <StackItem align="start">
            <Stack tokens={{ childrenGap: "5px" }}>
              <StackItem>
                <Text variant="xLarge">
                  Viewing connected account{" "}
                  <em>
                    <Link
                      onClick={() => {
                        setCurrentAccountFullDetails(props.account);
                        setCurrentAccountIsConnectedAccount(true);
                      }}
                    >
                      {props.account.id}{" "}
                    </Link>
                    (type: {readableAccountType}, country:{" "}
                    {props.account.country})
                  </em>{" "}
                  for platform{" "}
                  <Link
                    onClick={() => {
                      setCurrentAccountFullDetails(platformAccount);
                      setCurrentAccountIsConnectedAccount(false);
                    }}
                  >
                    <em>{platformAccount.id}</em>
                  </Link>
                  <Text> {renderStarAction()}</Text>
                </Text>
              </StackItem>
              <Stack
                horizontal
                tokens={{ childrenGap: "5px" }}
                verticalAlign="center"
              >
                <StackItem>
                  <Text>
                    {renderAccountOnboardedStatus(props.account)}
                    Charges enabled:{" "}
                    {props.account.charges_enabled ? "Yes" : "No"} | Payouts
                    enabled: {props.account.payouts_enabled ? "Yes" : "No"}{" "}
                  </Text>
                </StackItem>
                <StackItem>
                  <DefaultButton
                    onClick={() => setShowCreateTestDataDialog(props.account)}
                    style={{
                      marginBottom: "5px",
                    }}
                  >
                    Create test data
                  </DefaultButton>
                </StackItem>
              </Stack>
            </Stack>
          </StackItem>
          <StackItem align="center">
            <DefaultButton onClick={props.onBackToMainAppClicked}>
              Back
            </DefaultButton>
          </StackItem>
        </Stack>
        {renderDashboardLinks()}
        <StackItem>
          <Dropdown
            selectedKey={props.selectedComponent}
            onChange={(ev, val) =>
              props.onSelectedComponentChanged((val?.key as string) ?? "USD")
            }
            options={componentPageList.map((p) => ({
              key: p,
              text: componentPageDisplayName[p] ?? p,
            }))}
          />
        </StackItem>
        <StackItem>{renderCurrentPage(props.selectedComponent)}</StackItem>
      </Stack>
    </ConnectComponentsProvider>
  );
};
