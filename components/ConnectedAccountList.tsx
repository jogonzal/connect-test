import {
  IColumn,
  PrimaryButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  Link,
  IconButton,
  IIconProps,
  ActionButton,
} from "@fluentui/react";
import { useRouter } from "next/router";
import * as React from "react";
import Stripe from "stripe";
import { db } from "../clientsStorage/Database";
import { getReadableAccountType } from "../utils/getReadableAccountType";
import { embeddedDashboardUrl } from "../utils/urls";
import { AccountDetailsDialog } from "./AccountDetailsDialog";

const deleteIcon: IIconProps = { iconName: "Delete" };
const starIcon: IIconProps = { iconName: "FavoriteStar" };
const dashboardIcon: IIconProps = { iconName: "ViewDashboard" };

export const ConnectedAccountList: React.FC<{
  accounts: Stripe.Account[];
  displayStar: boolean;
  onStarRefetch: () => void;
  starredAccounts: Stripe.Account[];
  hideAccountTypeColumn?: boolean;
}> = ({
  accounts,
  displayStar,
  onStarRefetch,
  starredAccounts,
  hideAccountTypeColumn,
}) => {
  const router = useRouter();

  const [currentAccountFullDetails, setCurrentAccountFullDetails] =
    React.useState<Stripe.Account | undefined>(undefined);

  const starOrDelete = async (row: Stripe.Account) => {
    if (displayStar) {
      await db.starredAccounts.add(row);
    } else {
      await db.starredAccounts.delete(row.id);
    }
    onStarRefetch();
  };

  const getColumns = (): IColumn[] => {
    const columns: IColumn[] = [
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
        key: "viewAccount",
        name: "Account",
        minWidth: 60,
        onRender: (row: Stripe.Account) => {
          return (
            <Link onClick={() => setCurrentAccountFullDetails(row)}>
              Account
            </Link>
          );
        },
      },
      {
        key: "viewDashboard",
        name: "Dashboard",
        minWidth: 80,
        onRender: (row: Stripe.Account) => {
          const toRender = [];
          const accountId = row.id;
          const url = embeddedDashboardUrl(accountId);
          toRender.push(
            <ActionButton
              style={{ height: "16px", width: "16px" }}
              onClick={() => {
                router.push(url + window.location.search);
              }}
              iconProps={dashboardIcon}
            >
              Open
            </ActionButton>,
          );

          return toRender;
        },
      },
      {
        key: "star",
        name: "Star",
        minWidth: 40,
        onRender: (row: Stripe.Account) => {
          const alreadyFavorited =
            displayStar && starredAccounts.find((x) => x.id === row.id);

          return (
            <>
              <IconButton
                style={{ height: "16px", width: "16px" }}
                iconProps={displayStar ? starIcon : deleteIcon}
                onClick={() => starOrDelete(row)}
                disabled={!!alreadyFavorited}
              />
            </>
          );
        },
      },
    ];

    if (!hideAccountTypeColumn) {
      columns.splice(2, 0, {
        key: "type",
        name: "Account Type",
        minWidth: 100,
        onRender: (row: Stripe.Account) => getReadableAccountType(row),
      });
    }

    return columns;
  };

  return (
    <>
      {/* Render dialogs */}
      {currentAccountFullDetails && (
        <AccountDetailsDialog
          account={currentAccountFullDetails}
          onDismiss={() => setCurrentAccountFullDetails(undefined)}
        />
      )}
      <DetailsList
        items={accounts}
        columns={getColumns()}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        getKey={(item) => item.id}
      />
    </>
  );
};
