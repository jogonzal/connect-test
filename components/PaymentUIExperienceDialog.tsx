import { Dialog, Stack, StackItem, Text, TextField } from "@fluentui/react";
import * as React from "react";
import { ReactNode } from "react";
import { Stripe } from "stripe";

type Props = {
  account: Stripe.Account | undefined;
  onDismiss: () => void;
};

export const PaymentUIExperienceDialog: React.FC<Props> = (props) => {
  const currentAccountFullDetails = props.account;
  if (!currentAccountFullDetails) {
    return null;
  }

  return (
    <Dialog hidden={false} onDismiss={props.onDismiss}>
      <Stack>
        <StackItem>
          <Text variant="large">Account {currentAccountFullDetails.id}</Text>
        </StackItem>
        <StackItem>
          <TextField
            multiline
            rows={20}
            value={JSON.stringify(currentAccountFullDetails, null, 2)}
            width={800}
          />
        </StackItem>
      </Stack>
    </Dialog>
  );
};
