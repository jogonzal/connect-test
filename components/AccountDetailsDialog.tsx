import {
  DetailsList,
  DetailsListLayoutMode,
  Dialog,
  IColumn,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextField,
} from "@fluentui/react";
import * as React from "react";
import { Stripe } from "stripe";

type Props = {
  account?: Stripe.Account;
  onDismiss: () => void;
};

export const AccountDetailsDialog: React.FC<Props> = (props) => {
  const account = props.account;
  if (!account) {
    return null;
  }

  return (
    <>
      <Dialog hidden={false} onDismiss={props.onDismiss} minWidth={800}>
        <Stack>
          <StackItem>
            <Text variant="large">Account {account.id}</Text>
          </StackItem>
          <PrimaryButton
            onClick={async () => {
              const response = await fetch("/api/add-capabilities", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accountId: account.id,
                }),
              });
            }}
          >
            Add capabilities
          </PrimaryButton>
          <StackItem>
            <TextField
              multiline
              rows={20}
              value={JSON.stringify(account, null, 2)}
              width={800}
            />
          </StackItem>
        </Stack>
      </Dialog>
    </>
  );
};
