import * as React from "react";
import {
  Dialog,
  Link,
  PrimaryButton,
  Separator,
  Stack,
  StackItem,
  Toggle,
  Text,
} from "@fluentui/react";
import Stripe from "stripe";
import { useCreatePayout } from "../hooks/useCreatePayout";
import { useCreateTestCharge } from "../hooks/useCreateTestCharge";
import { useCreateAccountDebit } from "../hooks/useCreateAccountDebit";
import { useCreateTestIntervention } from "../hooks/useCreateTestIntervention";
import { CreateAdvancedChargeDialog } from "./CreateAdvancedChargeDialog";
import { CreateTestDataAction } from "./CreateTestDataAction";
import { usePrefillAccount } from "../hooks/usePrefillAccount";
import { useAddCapabilities } from "../hooks/useAddCapabilities";

type Props = {
  account: Stripe.Account;
  onDismiss: () => void;
};

export const CreateTestDataDialog: React.FC<Props> = ({
  account,
  onDismiss,
}) => {
  const createTestPayoutHook = useCreatePayout(account.id);

  const createTestChargeHook = useCreateTestCharge(
    account.id,
    "Test charge",
    false,
    false,
    10000,
    1000,
    false,
    "USD",
    false,
    false,
  );

  const createTestInterventionHook = useCreateTestIntervention(account.id);

  const [accountDebitCharge, setAccountDebitCharge] =
    React.useState<boolean>(false);
  const createAccountDebitHook = useCreateAccountDebit(
    account.id,
    accountDebitCharge ? "charge" : "transfer",
  );

  const prefillAccountHook = usePrefillAccount({ accountId: account.id });
  const addCapabilitiesHook = useAddCapabilities({ accountId: account.id });

  const [showAdvancedChargeCreateDialog, setShowAdvancedChargeCreateDialog] =
    React.useState<Stripe.Account | undefined>(undefined);

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

  const renderDialogs = () => {
    return (
      <>
        {showAdvancedChargeCreateDialog && (
          <CreateAdvancedChargeDialog
            account={showAdvancedChargeCreateDialog}
            onDismiss={() => setShowAdvancedChargeCreateDialog(undefined)}
          />
        )}
      </>
    );
  };

  return (
    <>
      {renderDialogs()}
      <Dialog hidden={false} onDismiss={onDismiss} minWidth={700}>
        <Stack
          tokens={{
            childrenGap: 50,
          }}
        >
          <StackItem>
            <Text variant="large">
              Use the options below to create test data for this account.
            </Text>
          </StackItem>
          <StackItem>
            <Separator>Charges, payouts, account debits</Separator>
            <CreateTestDataAction
              buttonText="Create test charge to add balance"
              hookData={createTestChargeHook}
            />
            <PrimaryButton
              onClick={() => setShowAdvancedChargeCreateDialog(account)}
            >
              Create test charge (advanced, using payment element or checkout)
            </PrimaryButton>
            <CreateTestDataAction
              buttonText="Create test payout"
              hookData={createTestPayoutHook}
            />
            <Stack horizontal verticalAlign="center">
              <StackItem>
                <Toggle
                  checked={accountDebitCharge}
                  onChange={() => setAccountDebitCharge(!accountDebitCharge)}
                />
              </StackItem>
              <StackItem>
                <CreateTestDataAction
                  buttonText={`Create account debit (via ${
                    accountDebitCharge ? "charge" : "transfer"
                  })`}
                  hookData={createAccountDebitHook}
                />
              </StackItem>
            </Stack>
          </StackItem>
          <StackItem>
            <Separator>Account metadata</Separator>
            <CreateTestDataAction
              buttonText="Create test risk intervention"
              hookData={createTestInterventionHook}
            />
            <div style={{ height: "5px" }} />
            <Link
              onClick={() =>
                onboardAccountHosted(account, "account_onboarding")
              }
            >
              Onboard (hosted)
            </Link>
            {" | "}
            <Link
              onClick={() => onboardAccountHosted(account, "account_update")}
            >
              Update (hosted)
            </Link>
            <CreateTestDataAction
              buttonText="Prefill account"
              hookData={prefillAccountHook}
            />
            <CreateTestDataAction
              buttonText="Add capabilities (card payments and transfers)"
              hookData={addCapabilitiesHook}
            />
          </StackItem>
        </Stack>
      </Dialog>
    </>
  );
};
