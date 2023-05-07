import {
  PrimaryButton,
  Text,
  Separator,
  Link,
  Stack,
  StackItem,
  IStackTokens,
  Spinner,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { useGetCurrentAccount } from "../hooks/useGetCurrentAccount";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { serializeError } from "serialize-error";
import { ConnectedAccountList } from "./ConnectedAccountList";
import { useGetStarredAccounts } from "../hooks/useGetStarredAccounts";

export const ConnectedAccountListPage: React.FC = () => {
  const [startingAfterStack, setStartingAfterStack] = React.useState<string[]>(
    [],
  );
  const {
    data: accounts,
    isLoading: isGetAccountsLoading,
    error: isGetAccountsError,
    refetch: refetchGetAccounts,
  } = useGetAccounts(startingAfterStack[startingAfterStack.length - 1]);

  const {
    data: currentAccount,
    isLoading: isCurrentAccountLoading,
    error: isGetCurrentAccountError,
    refetch: refetchCurrentAccount,
  } = useGetCurrentAccount();

  const {
    data: starredAccounts,
    isLoading: isGetStarredAccountsLoading,
    error: isGetStarredAccountsError,
    refetch: refetchStarredAccounts,
  } = useGetStarredAccounts();

  const [showCreateAccountDialog, setShowCreateAccountDialog] =
    React.useState<boolean>(false);

  if (isCurrentAccountLoading || currentAccount === undefined) {
    return <Spinner label="Loading..." />;
  }

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

  if (isGetCurrentAccountError) {
    return (
      <Text>
        Failed to load accounts!{" "}
        {JSON.stringify(
          serializeError(isGetAccountsError ?? isGetCurrentAccountError),
        )}
      </Text>
    );
  }

  return (
    <>
      {/* Render dialogs */}
      {showCreateAccountDialog && (
        <CreateAccountDialog
          onAccountCreated={(account: Stripe.Account) => {
            setShowCreateAccountDialog(false);
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
                  <Text variant="large">Jorgea&apos;s connect test app</Text>
                </StackItem>
                <Stack horizontal horizontalAlign="space-between">
                  <Stack verticalAlign="center">
                    <Text>
                      Current platform {currentAccount.id}{" "}
                      <Link
                        href={`https://go/loginas/${currentAccount.id}`}
                        target="_blank"
                      >
                        LoginAs
                      </Link>
                    </Text>
                  </Stack>
                  <Stack>
                    <PrimaryButton
                      onClick={() => setShowCreateAccountDialog(true)}
                    >
                      Create account
                    </PrimaryButton>
                  </Stack>
                </Stack>
              </Stack>
            </StackItem>
            <Separator />
            {isGetStarredAccountsLoading && <Spinner label="Loading..." />}
            {isGetStarredAccountsError && (
              <Text>Failed to load starred accounts!</Text>
            )}
            {starredAccounts && starredAccounts.length > 0 && (
              <>
                <Text variant="mediumPlus">Starred accounts</Text>
                <ConnectedAccountList
                  displayStar={false}
                  accounts={starredAccounts}
                  onStarRefetch={refetchStarredAccounts}
                  starredAccounts={starredAccounts}
                />
              </>
            )}
            <Separator />
            {isGetAccountsLoading && <Spinner label="Loading..." />}
            {isGetAccountsError && <Text>Failed to load accounts!</Text>}
            {accounts && starredAccounts !== undefined && (
              <>
                <Text variant="mediumPlus">All accounts</Text>
                <ConnectedAccountList
                  displayStar={true}
                  accounts={accounts.data}
                  onStarRefetch={refetchStarredAccounts}
                  starredAccounts={starredAccounts}
                />
              </>
            )}
            <StackItem>
              <Stack horizontal>
                <PrimaryButton
                  disabled={!accounts || startingAfterStack.length == 0}
                  onClick={onPreviousClicked}
                >
                  Previous
                </PrimaryButton>
                <PrimaryButton
                  disabled={!accounts || !accounts.has_more}
                  onClick={onNextClicked}
                >
                  Next
                </PrimaryButton>
              </Stack>
            </StackItem>
          </Stack>
        </StackItem>
      </Stack>
    </>
  );
};
