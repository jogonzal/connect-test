import {
  DetailsList,
  DetailsListLayoutMode,
  Dialog,
  Dropdown,
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
import { StripePublicKey } from "../config/ClientConfig";
import { fetchClientSecret } from "../hooks/fetchClientSecret";
import { useGetAccount } from "../hooks/useGetAccount";
import { embeddedDashboardUrl } from "../utils/urls";

type Props = {
  account?: Stripe.Account;
  onDismiss: () => void;
};

export const AccountDetailsDialog: React.FC<Props> = (props) => {
  const account = props.account;
  const obtainedAccount = useGetAccount(props.account?.id ?? "");
  const [connectElementOption, setConnectElementOption] = React.useState(
    "stripe-connect-payments",
  );

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

    const copyEmbeddableScript = async () => {
      const newSecret = await fetchClientSecret(account.id);
      const injectableScript = `
document.body.appendChild(document.createElement('${connectElementOption}'));
const script = document.createElement('script')
script.src = 'https://connect-js.stripe.com/v0.1/connect.js';
document.head.appendChild(script)
window.StripeConnect = window.StripeConnect || {};
StripeConnect.onLoad = () => {
  StripeConnect.init({
      clientSecret:'${newSecret}',
      publishableKey: '${StripePublicKey}',
  });
};`;
      // Copy into clipboard
      navigator.clipboard.writeText(injectableScript);
    };

    return (
      <Stack>
        <StackItem>
          <Text variant="large">Account {account.id}</Text>
        </StackItem>
        <PrimaryButton href={embeddedDashboardUrl(account.id)}>
          Embedded dashboard
        </PrimaryButton>
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
        <PrimaryButton
          onClick={async () => {
            const response = await fetch("/api/prefill-account", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                accountId: account.id,
              }),
            });
            obtainedAccount.refetch();
          }}
        >
          Prefill account
        </PrimaryButton>
        {account.type === "express" && (
          <PrimaryButton
            onClick={async () => {
              const response = await fetch("/api/express-login-link", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  accountId: account.id,
                }),
              });
              const json = await response.json();
              console.log(json.url);
            }}
          >
            Express login link
          </PrimaryButton>
        )}
        <StackItem>
          <Stack horizontal>
            <StackItem>
              <PrimaryButton onClick={copyEmbeddableScript}>
                Copy embeddable script
              </PrimaryButton>
              <Dropdown
                selectedKey={connectElementOption}
                onChange={(_ev, opt) =>
                  setConnectElementOption(
                    opt?.key?.toString() ?? "stripe-connect-payments",
                  )
                }
                options={[
                  {
                    key: "stripe-connect-payments",
                    text: "stripe-connect-payments",
                  },
                  {
                    key: "stripe-connect-payouts",
                    text: "stripe-connect-payouts",
                  },
                  {
                    key: "stripe-connect-account-management",
                    text: "stripe-connect-account-management",
                  },
                  {
                    key: "stripe-connect-account-onboarding",
                    text: "stripe-connect-account-onboarding",
                  },
                  {
                    key: "stripe-connect-debug-utils",
                    text: "stripe-connect-debug-utils",
                  },
                ]}
              />
            </StackItem>
          </Stack>
        </StackItem>
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
