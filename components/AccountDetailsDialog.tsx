import {
  Dialog,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextField,
} from "@fluentui/react";
import { useRouter } from "next/router";
import * as React from "react";
import { Stripe } from "stripe";
import { useGetAccount } from "../hooks/useGetAccount";
import { embeddedDashboardUrl } from "../utils/urls";

type Props = {
  account: Stripe.Account;
  onDismiss: () => void;
};

export const AccountDetailsDialog: React.FC<Props> = (props) => {
  const account = props.account;
  const obtainedAccount = useGetAccount(props.account.id);
  const router = useRouter();

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
      <Stack>
        <StackItem>
          <Text variant="large">Account {account.id}</Text>
        </StackItem>
        <PrimaryButton
          onClick={() => {
            router.push(embeddedDashboardUrl(account.id));
          }}
        >
          Account dashboard
        </PrimaryButton>
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
