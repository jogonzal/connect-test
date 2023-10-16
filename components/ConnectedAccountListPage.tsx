import {
  PrimaryButton,
  Text,
  Separator,
  Link,
  Stack,
  StackItem,
  IStackTokens,
  Spinner,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";
import { useGetAccounts } from "../hooks/useGetAccounts";
import { useGetCurrentAccount } from "../hooks/useGetCurrentAccount";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { serializeError } from "serialize-error";
import { ConnectedAccountList } from "./ConnectedAccountList";
import { useGetStarredAccounts } from "../hooks/useGetStarredAccounts";
import { SpecialAccountsGrid } from "./SpecialAccountsGrid";

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
    data: currentPlatform,
    isLoading: isCurrentPlatformLoading,
    error: isGetCurrentPlatformError,
    refetch: refetchCurrentPlatform,
  } = useGetCurrentAccount();

  const {
    data: starredAccounts,
    isLoading: isGetStarredAccountsLoading,
    error: isGetStarredAccountsError,
    refetch: refetchStarredAccounts,
  } = useGetStarredAccounts();

  const [showCreateAccountDialog, setShowCreateAccountDialog] =
    React.useState<boolean>(false);

  if (isCurrentPlatformLoading || currentPlatform === undefined) {
    return <Spinner label="Loading..." />;
  }

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

  if (isGetCurrentPlatformError) {
    return (
      <Text>
        Failed to load accounts!{" "}
        {JSON.stringify(
          serializeError(isGetAccountsError ?? isGetCurrentPlatformError),
        )}
      </Text>
    );
  }

  if (isGetStarredAccountsLoading || starredAccounts === undefined) {
    return <Spinner label="Loading..." />;
  }
  if (isGetStarredAccountsError) {
    return <Text>Failed to load starred accounts!</Text>;
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

      <Stack>
        <StackItem>
          <MessageBar messageBarType={MessageBarType.warning}>
            This app is deprecated and has moved to https://go/connect-test.
            Please use that going forward
          </MessageBar>
        </StackItem>
        <StackItem>
          <Stack>
            <StackItem style={{ paddingBottom: "10px" }}>
              <Stack>
                <StackItem>
                  <Text variant="xxLarge">
                    Connect test app (
                    <Link href="https://github.com/jogonzal/jorgeconnectplatform">
                      source
                    </Link>
                    ,{" "}
                    <Link href="https://trailhead.corp.stripe.com/docs/connect/connect-test-site#connect-test-site">
                      docs
                    </Link>
                    )
                  </Text>
                </StackItem>
                <Stack horizontal horizontalAlign="space-between">
                  <Stack verticalAlign="center">
                    <Text>
                      Using platform{" "}
                      <Link href={`https://go/o/${currentPlatform.id}`}>
                        {currentPlatform.id}
                      </Link>
                      {" ("}
                      <Link
                        href={`https://go/loginas/${currentPlatform.id}`}
                        target="_blank"
                      >
                        Login as
                      </Link>
                      {")"}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </StackItem>
            <StackItem>
              <SpecialAccountsGrid currentPlatform={currentPlatform} />
              <Separator />
            </StackItem>
            {starredAccounts.length > 0 && (
              <StackItem>
                <Text variant="mediumPlus">Starred accounts</Text>
                <ConnectedAccountList
                  displayStar={false}
                  accounts={starredAccounts}
                  onStarRefetch={refetchStarredAccounts}
                  starredAccounts={starredAccounts}
                />
                <Separator />
              </StackItem>
            )}
            <StackItem>
              {isGetAccountsError && <Text>Failed to load accounts!</Text>}
              <Stack horizontal horizontalAlign="space-between">
                <StackItem>
                  <Text variant="xLarge">All accounts</Text>
                </StackItem>
                <StackItem>
                  <PrimaryButton
                    onClick={() => setShowCreateAccountDialog(true)}
                  >
                    Create new connected account
                  </PrimaryButton>
                </StackItem>
              </Stack>
              <ConnectedAccountList
                displayStar={true}
                accounts={accounts?.data ?? []}
                onStarRefetch={refetchStarredAccounts}
                starredAccounts={starredAccounts ?? []}
              />
              {isGetAccountsLoading && <Spinner label="Loading..." />}
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
        <StackItem>
          {/* Space to account for dropdowns */}
          <div style={{ height: "30px" }} />
        </StackItem>
      </Stack>
    </>
  );
};
