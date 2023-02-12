import {
  PrimaryButton,
  Text,
  Separator,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  Link,
  Stack,
  StackItem,
  IStackTokens,
  Spinner,
  SelectionMode,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { getReadableAccountType } from "../utils/getReadableAccountType";
import { embeddedDashboardUrl } from "../utils/urls";
import { AccountDetailsDialog } from "./AccountDetailsDialog";
import { CheckoutExperienceDialog } from "./CheckoutExperienceDialog";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { PaymentUIExperienceDialog } from "./PaymentUIExperienceDialog";

export const App: React.FC = () => {
  const [startingAfterStack, setStartingAfterStack] = React.useState<string[]>(
    [],
  );
  const {
    data: accounts,
    isLoading: isGetAccountsLoading,
    error: isGetAccountsError,
    refetch: refetchGetAccounts,
  } = useGetAccounts(startingAfterStack[startingAfterStack.length - 1]);
  const [currentAccountFullDetails, setCurrentAccountFullDetails] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showCheckoutDialogForMerchant, setShowCheckoutDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showPaymentDialogForMerchant, setShowPaymentDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showCreateAccountDialog, setShowCreateAccountDialog] =
    React.useState<boolean>(false);

  const onboardAccount = async (
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
    const accountLink: Stripe.Response<Stripe.AccountLink> =
      await accountsResponse.json();
    window.open(accountLink.url);
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: "name",
        name: "Account Name",
        minWidth: 100,
        onRender: (row: Stripe.Account) => row?.business_profile?.name,
      },
      {
        key: "id",
        name: "ID",
        minWidth: 160,
        onRender: (row: Stripe.Account) => row?.id,
      },
      {
        key: "type",
        name: "Account Type",
        minWidth: 100,
        onRender: (row: Stripe.Account) => getReadableAccountType(row),
      },
      {
        key: "charges_enabled",
        name: "Action",
        minWidth: 340,
        onRender: (row: Stripe.Account) => {
          if (row.charges_enabled) {
            return (
              <>
                <Link onClick={() => setShowCheckoutDialogForMerchant(row)}>
                  Create payment
                </Link>
                {" | "}
                <Link onClick={() => onboardAccount(row, "account_onboarding")}>
                  Onboard
                </Link>
                {" | "}
                <Link onClick={() => onboardAccount(row, "account_update")}>
                  Update
                </Link>
              </>
            );
          } else {
            return (
              <>
                DisabledReason: {row.requirements?.disabled_reason}
                {" | "}
                <Link onClick={() => onboardAccount(row, "account_onboarding")}>
                  Onboard
                </Link>{" "}
              </>
            );
          }
        },
      },
      {
        key: "viewAccount",
        name: "View account",
        minWidth: 80,
        onRender: (row: Stripe.Account) => {
          return (
            <Link onClick={() => setCurrentAccountFullDetails(row)}>
              View account
            </Link>
          );
        },
      },

      {
        key: "viewDashboard",
        name: "Dashboard",
        minWidth: 120,
        onRender: (row: Stripe.Account) => {
          const toRender = [];
          const accountId = row.id;
          const url = embeddedDashboardUrl(accountId);
          toRender.push(<Link href={url}>Embedded</Link>);

          if (row.type === "express") {
            const url = `/api/create-dashboard-login-link?connectedAccountId=${accountId}`;
            toRender.push(
              <>
                {" | "}
                <Link href={url}>Express</Link>
              </>,
            );
          }

          return toRender;
        },
      },
    ];
  };

  const stackTokens: IStackTokens = { maxWidth: 1000 };

  const onPreviousClicked = () => {
    const newList = [...startingAfterStack];
    newList.pop();
    setStartingAfterStack(newList);
  };

  const onNextClicked = () => {
    if (!accounts || !accounts.data) {
      return;
    }
    const newList = [...startingAfterStack];
    newList.push(accounts.data[accounts.data.length - 1].id);
    setStartingAfterStack(newList);
  };

  if (isGetAccountsError) {
    return <Text>Failed to load accounts!</Text>;
  }

  if (isGetAccountsLoading || accounts === undefined) {
    return <Spinner label="Loading accounts..." />;
  }

  const renderAccountList = () => {
    return (
      <>
        {accounts && (
          <DetailsList
            items={accounts.data}
            columns={getColumns()}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        )}
        <StackItem>
          <Stack horizontal>
            <PrimaryButton
              disabled={startingAfterStack.length == 0}
              onClick={onPreviousClicked}
            >
              Previous
            </PrimaryButton>
            <PrimaryButton
              disabled={!accounts.has_more}
              onClick={onNextClicked}
            >
              Next
            </PrimaryButton>
          </Stack>
        </StackItem>
      </>
    );
  };

  return (
    <>
      {/* Render dialogs */}
      <AccountDetailsDialog
        account={currentAccountFullDetails}
        onDismiss={() => setCurrentAccountFullDetails(undefined)}
      />
      {showCheckoutDialogForMerchant && (
        <CheckoutExperienceDialog
          account={showCheckoutDialogForMerchant}
          onDismiss={() => setShowCheckoutDialogForMerchant(undefined)}
          onSuccessfulPayment={(account) => {
            setCurrentAccountFullDetails(account);
            setShowCheckoutDialogForMerchant(undefined);
          }}
        />
      )}
      <PaymentUIExperienceDialog
        account={showPaymentDialogForMerchant}
        onDismiss={() => setShowPaymentDialogForMerchant(undefined)}
      />
      {showCreateAccountDialog && (
        <CreateAccountDialog
          onAccountCreated={(account: Stripe.Account) => {
            setShowCreateAccountDialog(false);
            setCurrentAccountFullDetails(account);
            refetchGetAccounts();
          }}
          onDismiss={() => {
            setShowCreateAccountDialog(false);
          }}
        />
      )}

      <Stack horizontalAlign="center">
        <StackItem tokens={stackTokens}>
          <Stack>
            <StackItem>
              <Stack>
                <StackItem>
                  <Text variant="large">Jorgea's connect test app</Text>
                </StackItem>
                <StackItem>
                  <PrimaryButton
                    onClick={() => setShowCreateAccountDialog(true)}
                  >
                    Create account
                  </PrimaryButton>
                </StackItem>
              </Stack>
            </StackItem>
            <Separator />
            {renderAccountList()}
          </Stack>
        </StackItem>
      </Stack>
    </>
  );
};
