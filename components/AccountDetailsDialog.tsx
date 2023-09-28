import {
  DefaultButton,
  Dialog,
  Link,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextField,
  TooltipHost,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useGetAccount } from "../hooks/useGetAccount";

type Props = {
  account: Stripe.Account;
  isConnectedAccount: boolean;
  onDismiss: () => void;
};

export const AccountDetailsDialog: React.FC<Props> = (props) => {
  const account = props.account;
  const obtainedAccount = useGetAccount(props.account.id);

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

  if (!account) {
    return null;
  }

  const renderDialogContent = () => {
    if (obtainedAccount.error) {
      return <Text>Ran into error!</Text>;
    }

    if (obtainedAccount.isLoading || obtainedAccount.isFetching) {
      return <Spinner />;
    }

    return (
      <Stack tokens={{ childrenGap: "10px" }}>
        <StackItem>
          <Text variant="large">
            Viewing metadata for account <em>{account.id}</em>
          </Text>
        </StackItem>
        <Stack horizontal tokens={{ childrenGap: "10px" }}>
          <StackItem>
            <TooltipHost content="You can login to the standard dashboard with any account">
              <DefaultButton
                href={`https://go/loginas/${props.account.id}`}
                target="_blank"
              >
                &quot;Login as&quot; standard dashboard
              </DefaultButton>
            </TooltipHost>
          </StackItem>
          <StackItem>
            <TooltipHost content="You can only generate login links for express accounts, however custom accounts can (sometimes) log in to express directly via https://connect.stripe.com">
              <DefaultButton
                disabled={props.account.type !== "express"}
                href={`/api/create-dashboard-login-link?connectedAccountId=${props.account.id}`}
                target="_blank"
              >
                &quot;Login link&quot; to express dashboard
              </DefaultButton>
            </TooltipHost>
          </StackItem>
        </Stack>
        {props.isConnectedAccount && (
          <StackItem>
            <div style={{ height: "5px" }} />
            <TooltipHost content="Account links are what a platform would use to onboard an account via hosted">
              <Text>
                Hosted account links:{" "}
                <Link
                  onClick={() =>
                    onboardAccountHosted(account, "account_onboarding")
                  }
                >
                  Onboard
                </Link>
                {" | "}
                <Link
                  onClick={() =>
                    onboardAccountHosted(account, "account_update")
                  }
                >
                  Update
                </Link>
              </Text>
            </TooltipHost>
          </StackItem>
        )}
        <StackItem>
          <TextField
            multiline
            rows={20}
            value={JSON.stringify(obtainedAccount, null, 2)}
            width={800}
          />
        </StackItem>
      </Stack>
    );
  };

  return (
    <>
      <Dialog hidden={false} onDismiss={props.onDismiss} minWidth={800}>
        {renderDialogContent()}
      </Dialog>
    </>
  );
};
