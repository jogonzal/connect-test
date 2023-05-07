import {
  IColumn,
  PrimaryButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Link,
  IconButton,
  IIconProps,
} from "@fluentui/react";
import { useRouter } from "next/router";
import * as React from "react";
import Stripe from "stripe";
import { db } from "../clientsStorage/StarredAccountsDatabase";
import { getReadableAccountType } from "../utils/getReadableAccountType";
import { embeddedDashboardUrl } from "../utils/urls";
import { AccountDetailsDialog } from "./AccountDetailsDialog";
import { CreatePaymentDialog } from "./CreatePaymentDialog";
import { CreateTestDataDialog } from "./CreateTestDataDialog";
import { PaymentUIExperienceDialog } from "./PaymentUIExperienceDialog";

const deleteIcon: IIconProps = { iconName: "Delete" };
const starIcon: IIconProps = { iconName: "FavoriteStar" };

export const ConnectedAccountList: React.FC<{
  accounts: Stripe.Account[];
  displayStar: boolean;
  onStarRefetch: () => void;
  starredAccounts: Stripe.Account[];
}> = ({ accounts, displayStar, onStarRefetch, starredAccounts }) => {
  const router = useRouter();

  const [currentAccountFullDetails, setCurrentAccountFullDetails] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showCheckoutDialogForMerchant, setShowCheckoutDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showPaymentDialogForMerchant, setShowPaymentDialogForMerchant] =
    React.useState<Stripe.Account | undefined>(undefined);
  const [showTestDataDialog, setShowTestDataDialog] = React.useState<
    Stripe.Account | undefined
  >(undefined);

  const starOrDelete = async (row: Stripe.Account) => {
    if (displayStar) {
      await db.starredAccounts.add(row);
    } else {
      await db.starredAccounts.delete(row.id);
    }
    onStarRefetch();
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
    if (!accountsResponse.ok) {
      throw new Error(`Unexpected response code ${accountsResponse.status}`);
    }
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
                  Payment
                </Link>
                {" | "}
                <Link onClick={() => setShowTestDataDialog(row)}>Test</Link>
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
        minWidth: 150,
        onRender: (row: Stripe.Account) => {
          const toRender = [];
          const accountId = row.id;
          const url = embeddedDashboardUrl(accountId);
          toRender.push(
            <Link
              onClick={() => {
                router.push(url);
              }}
            >
              Embed
            </Link>,
          );

          if (row.type === "express") {
            const url = `/api/create-dashboard-login-link?connectedAccountId=${accountId}`;
            toRender.push(
              <>
                {" | "}
                <Link href={url}>Express</Link>
              </>,
            );
          }

          const loginAsUrl = `https://go/loginas/${accountId}`;
          toRender.push(
            <>
              {" | "}
              <Link href={loginAsUrl} target="_blank">
                LoginAs
              </Link>
            </>,
          );

          return toRender;
        },
      },
      {
        key: "star",
        name: "",
        minWidth: 40,
        onRender: (row: Stripe.Account) => {
          const alreadyFavorited =
            displayStar && starredAccounts.find((x) => x.id === row.id);

          return (
            <>
              <IconButton
                iconProps={displayStar ? starIcon : deleteIcon}
                onClick={() => starOrDelete(row)}
                disabled={!!alreadyFavorited}
              />
            </>
          );
        },
      },
    ];
  };

  return (
    <>
      {/* Render dialogs */}
      <AccountDetailsDialog
        account={currentAccountFullDetails}
        onDismiss={() => setCurrentAccountFullDetails(undefined)}
      />
      {showCheckoutDialogForMerchant && (
        <CreatePaymentDialog
          account={showCheckoutDialogForMerchant}
          onDismiss={() => setShowCheckoutDialogForMerchant(undefined)}
          onSuccessfulPayment={(account) => {
            console.log("Successful payment", account);
            setCurrentAccountFullDetails(account);
            setShowCheckoutDialogForMerchant(undefined);
          }}
        />
      )}
      <PaymentUIExperienceDialog
        account={showPaymentDialogForMerchant}
        onDismiss={() => setShowPaymentDialogForMerchant(undefined)}
      />
      {showTestDataDialog && (
        <CreateTestDataDialog
          account={showTestDataDialog}
          onDismiss={() => setShowTestDataDialog(undefined)}
        />
      )}
      <DetailsList
        items={accounts}
        columns={getColumns()}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
      />
    </>
  );
};
