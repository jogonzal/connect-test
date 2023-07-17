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
// import { FormattedMessage } from "react-intl";

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

  const renderSpecialAccountsSection = () => {
    if (currentAccount?.id !== "acct_1MZRIlLirQdaQn8E") {
      return null;
    }

    // Special accounts related to platform acct_1MZRIlLirQdaQn8E
    const specialAccounts = [
      /*Standard CBSP:*/ "acct_1NBR5cQ55yzNh0Wh",
      /*Standard Non-CBSP:*/ "acct_1NTYufAm9SMRj986",
      /*Express:*/ "acct_1MhgrJPu4nAj1Tce",
      /*Custom:*/ "acct_1N9FIXQ26HdRlxHg",
      /*UA1:*/ "acct_1NUwRpPwYwgmBZjm",
      /*UA2:*/ "acct_1N61ByQ7NMZInEnp",
      /*UA3:*/ "acct_1NUwSMPxxtPxBTFe",
      /*UA7:*/ "acct_1NUwSoPqPnXR0qy5",
    ];

    // TODO: Fetch these accounts from the API and display them
    return null;
  };

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
                  <Text variant="large">Connect test app</Text>
                </StackItem>
                <Stack horizontal horizontalAlign="space-between">
                  <Stack verticalAlign="center">
                    <Text>
                      Current platform {currentAccount.id}{" "}
                      <Link
                        href={`https://go/loginas/${currentAccount.id}`}
                        target="_blank"
                      >
                        Login as
                        {/* <FormattedMessage
                          defaultMessage="Login as"
                          id="ConnectedAccountListPage.LoginAsLink"
                          description="The link to login as from the connected account list page"
                        /> */}
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
            <StackItem>{renderSpecialAccountsSection()}</StackItem>
            {isGetStarredAccountsLoading && <Spinner label="Loading..." />}
            {isGetStarredAccountsError && (
              <Text>Failed to load starred accounts!</Text>
            )}
            {starredAccounts && starredAccounts.length > 0 && (
              <>
                <Separator />
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
            {isGetAccountsError && <Text>Failed to load accounts!</Text>}
            <>
              <Text variant="mediumPlus">All accounts</Text>
              <ConnectedAccountList
                displayStar={true}
                accounts={accounts?.data ?? []}
                onStarRefetch={refetchStarredAccounts}
                starredAccounts={starredAccounts ?? []}
              />
              {isGetAccountsLoading && <Spinner label="Loading..." />}
            </>
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
