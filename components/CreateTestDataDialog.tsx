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
import { useCreateAccountDebit } from "../hooks/useCreateAccountDebit";

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
  } = useCreateTestCharge(
    account.id,
    "Test charge",
    false,
    false,
    10000,
    1000,
    false,
    "USD",
  );

  const {
    error: createDebitError,
    isLoading: createDebitLoading,
    data: createDebitData,
    reset: createDebitReset,
    mutateAsync: createDebitAsync,
  } = useCreateAccountDebit(account.id);

  const onCreateTestPayout = async () => {
    createPayoutAsync();
  };

  const onCreateTestCharge = async () => {
    createTestChargeAsync();
  };

  const onCreateAccountDebitViaCharge = async () => {
    createDebitAsync({ method: "charge" });
  };

  const onCreateAccountDebitViaTransfer = async () => {
    createDebitAsync({ method: "transfer" });
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
            <Text>Error! {JSON.stringify(createChargeError)}</Text>
          )}
          <PrimaryButton onClick={onCreateAccountDebitViaCharge}>
            Create account debit (via charge)
          </PrimaryButton>
          <PrimaryButton onClick={onCreateAccountDebitViaTransfer}>
            Create account debit (via transfer)
          </PrimaryButton>
          {createDebitLoading ?? <Spinner />}
          {createDebitData && <Text>Created!</Text>}
          {createDebitError && (
            <Text>Error! {JSON.stringify(createDebitError)}</Text>
          )}
        </StackItem>
      </Stack>
    </Dialog>
  );
};
