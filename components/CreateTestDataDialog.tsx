import * as React from "react";
import {
  Dialog,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
} from "@fluentui/react";
import Stripe from "stripe";
import { useCreatePayout } from "../hooks/useCreatePayout";
import { useCreateTestCharge } from "../hooks/useCreateTestCharge";

type Props = {
  account: Stripe.Account;
  onDismiss: () => void;
};

export const CreateTestDataDialog: React.FC<Props> = ({
  account,
  onDismiss,
}) => {
  const {
    error: createPayoutError,
    isLoading: createPayoutLoading,
    data: createPayoutData,
    reset: createPayoutReset,
    mutateAsync: createPayoutAsync,
  } = useCreatePayout(account.id);

  const {
    error: createChargeError,
    isLoading: createChargeLoading,
    data: createChargeData,
    reset: createChargeReset,
    mutateAsync: createTestChargeAsync,
  } = useCreateTestCharge(account.id);

  const onCreateTestPayout = async () => {
    createPayoutAsync();
  };

  const onCreateTestCharge = async () => {
    createTestChargeAsync();
  };

  return (
    <Dialog hidden={false} onDismiss={onDismiss}>
      <Stack>
        <StackItem>
          <PrimaryButton onClick={onCreateTestCharge}>
            Create test charge to add balance
          </PrimaryButton>
          {createPayoutLoading ?? <Spinner />}
          {createPayoutData && <Text>Created!</Text>}
          {createPayoutError && (
            <Text>Error! {JSON.stringify(createPayoutError)}</Text>
          )}
          <PrimaryButton onClick={onCreateTestPayout}>
            Create test payout
          </PrimaryButton>
          {createChargeLoading ?? <Spinner />}
          {createChargeData && <Text>Created!</Text>}
          {createChargeError && (
            <Text>Error! {JSON.stringify(createPayoutError)}</Text>
          )}
        </StackItem>
      </Stack>
    </Dialog>
  );
};
