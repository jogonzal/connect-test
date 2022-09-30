import {
  PrimaryButton,
  TextField,
  Text,
  Separator,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  Link,
  Stack,
  StackItem,
  IStackTokens,
  Dialog,
  IDropdownOption,
  Dropdown,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { AccountDetailsDialog } from "./AccountDetailsDialog";
import { CheckoutExperienceDialog } from "./CheckoutExperienceDialog";
import { PaymentUIExperienceDialog } from "./PaymentUIExperienceDialog";

const dropdownOptions: IDropdownOption[] = [
  { key: "standard", text: "standard" },
  { key: "express", text: "express" },
];

export const App: React.FC = () => {
  const { data: accounts, isLoading, error, refetch } = useGetAccounts();
  const [accountName, setAccountName] = React.useState("");
  const [currentAccountFullDetails, setCurrentAccountFullDetails] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showCheckoutDialogForMerchant, setShowCheckoutDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showPaymentDialogForMerchant, setShowPaymentDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [accountType, setAccountType] = React.useState<IDropdownOption>(
    dropdownOptions[0],
  );

  const onSelectedAccountTypeChanged = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption,
  ): void => {
    setAccountType(item ?? dropdownOptions[0]);
  };

  const onCreateAccountClicked = async () => {
    const accountsResponse = await fetch("/api/create-connected-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: accountName,
        type: accountType.key,
      }),
    });
    await accountsResponse.json();
    refetch();
  };

  const onAccountNameChanged = (ev: any, val?: string) => {
    setAccountName(val ?? "");
  };

  const onboardAccount = async (row: Stripe.Account) => {
    const accountsResponse = await fetch("/api/create-account-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountId: row.id,
      }),
    });
    const accountLink: Stripe.Response<Stripe.AccountLink> =
      await accountsResponse.json();
    window.location.href = accountLink.url;
  };

  const viewAccountFullDetails = (row: Stripe.Account) => {
    setCurrentAccountFullDetails(row);
  };

  const paymentForMerchant = (row: Stripe.Account) => {
    setShowCheckoutDialogForMerchant(row);
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
        key: "type",
        name: "Account Type",
        minWidth: 100,
        onRender: (row: Stripe.Account) => row.type,
      },
      {
        key: "charges_enabled",
        name: "Charges enabled",
        minWidth: 300,
        onRender: (row: Stripe.Account) => {
          if (row.charges_enabled) {
            return (
              <>
                y{" "}
                <Link onClick={() => paymentForMerchant(row)}>
                  Create payment
                </Link>{" "}
                <Link onClick={() => onboardAccount(row)}>Onboard link</Link>
              </>
            );
          } else {
            return (
              <>
                reason: {row.requirements?.disabled_reason}{" "}
                <Link onClick={() => onboardAccount(row)}>Onboard link</Link>{" "}
              </>
            );
          }
        },
      },
      {
        key: "viewFull",
        name: "View details",
        minWidth: 100,
        onRender: (row: Stripe.Account) => {
          return <Link onClick={() => viewAccountFullDetails(row)}>View</Link>;
        },
      },

      {
        key: "viewDashboard",
        name: "Dashboard",
        minWidth: 100,
        onRender: (row: Stripe.Account) => {
          if (row.type !== "express") {
            return null;
          }

          const accountId = row.id;
          const url = `/api/create-dashboard-login-link?connectedAccountId=${accountId}`;
          return <Link href={url}>View</Link>;
        },
      },
    ];
  };

  const renderAccountDetailsDialog = () => {
    if (!currentAccountFullDetails) return;
    return (
      <AccountDetailsDialog
        account={currentAccountFullDetails}
        onDismiss={() => setCurrentAccountFullDetails(undefined)}
      />
    );
  };

  const stackTokens: IStackTokens = { maxWidth: 1000 };

  return (
    <>
      {renderAccountDetailsDialog()}
      <CheckoutExperienceDialog
        account={showCheckoutDialogForMerchant}
        onDismiss={() => setShowCheckoutDialogForMerchant(undefined)}
        onSuccessfulPayment={(account) => {
          setCurrentAccountFullDetails(account);
          setShowCheckoutDialogForMerchant(undefined);
        }}
      />
      <PaymentUIExperienceDialog
        account={showPaymentDialogForMerchant}
        onDismiss={() => setShowPaymentDialogForMerchant(undefined)}
      />

      <Stack horizontalAlign="center">
        <StackItem tokens={stackTokens}>
          <Stack>
            <StackItem>
              <Stack>
                <StackItem>
                  <Text variant="large">Merchant management test app</Text>
                </StackItem>
                <StackItem>
                  <Text>Total Accounts: {accounts && accounts.length}</Text>
                </StackItem>
              </Stack>
            </StackItem>
            <Separator />
            <Stack horizontal>
              <PrimaryButton onClick={onCreateAccountClicked}>
                Create account
              </PrimaryButton>
              <TextField
                onChange={onAccountNameChanged}
                value={accountName}
                placeholder="Account name"
              />
              <Dropdown
                selectedKey={accountType ? accountType.key : undefined}
                onChange={onSelectedAccountTypeChanged}
                placeholder="Select an option"
                options={dropdownOptions}
              />
            </Stack>
            <Separator />
            {accounts && (
              <DetailsList
                items={accounts}
                columns={getColumns()}
                layoutMode={DetailsListLayoutMode.justified}
              />
            )}
          </Stack>
        </StackItem>
      </Stack>
    </>
  );
};
