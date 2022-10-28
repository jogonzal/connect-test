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
  Spinner,
  SelectionMode,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useCreateAccount } from "../hooks/useCreateAccount";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { AccountDetailsDialog } from "./AccountDetailsDialog";
import { CheckoutExperienceDialog } from "./CheckoutExperienceDialog";
import { PaymentUIExperienceDialog } from "./PaymentUIExperienceDialog";

const dropdownOptions: IDropdownOption[] = [
  { key: "standard", text: "standard" },
  { key: "express", text: "express" },
  { key: "custom", text: "custom" },
];

export const App: React.FC = () => {
  const { data: accounts, isLoading, error, refetch } = useGetAccounts();
  const {
    error: createError,
    isLoading: createLoading,
    data: createData,
    reset: resetCreate,
    mutateAsync: createAccountAsync,
  } = useCreateAccount();
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
    await createAccountAsync({
      accountName,
      accountType: accountType.key.toString(),
    });
    await refetch();
  };

  const onAccountNameChanged = (ev: any, val?: string) => {
    setAccountName(val ?? "");
  };

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
        minWidth: 140,
        onRender: (row: Stripe.Account) => row?.id,
      },
      {
        key: "type",
        name: "Account Type",
        minWidth: 100,
        onRender: (row: Stripe.Account) => row.type,
      },
      {
        key: "charges_enabled",
        name: "Action",
        minWidth: 300,
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
          const url = `/embeddedDashboard?account=${accountId}`;
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

  if (error) {
    return <Text>Failed to load accounts!</Text>;
  }

  if (!accounts) {
    return <Spinner label="Loading accounts..." />;
  }

  if (createError) {
    return <Text>An error ocurred when creating the account.</Text>;
  }

  if (createLoading) {
    return <Spinner label="Creating an account..." />;
  }

  if (createData) {
    return (
      <>
        <pre>{JSON.stringify(createData, null, "\t")}</pre>
        <PrimaryButton onClick={resetCreate}>Ok</PrimaryButton>
      </>
    );
  }

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
                  <Text>Total Accounts: {accounts.length}</Text>
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
                selectionMode={SelectionMode.none}
              />
            )}
          </Stack>
        </StackItem>
      </Stack>
    </>
  );
};
