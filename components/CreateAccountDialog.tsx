import {
  PrimaryButton,
  TextField,
  Text,
  Stack,
  IDropdownOption,
  Dropdown,
  Spinner,
  Dialog,
  IStackTokens,
  Checkbox,
  Separator,
  TooltipHost,
} from "@fluentui/react";
import * as React from "react";
import Stripe from "stripe";
import { useCreateAccount } from "../hooks/useCreateAccount";

type Props = {
  onAccountCreated: (account: Stripe.Account) => void;
  onDismiss: () => void;
};

const dropdownOptions: IDropdownOption[] = [
  { key: "standard", text: "standard" },
  { key: "express", text: "express" },
  { key: "custom", text: "custom" },
  { key: "UA1", text: "UA1" },
  { key: "UA2", text: "UA2" },
  { key: "UA3", text: "UA3" },
  // Not implemented yet
  // { key: "UA6", text: "UA6" },
  { key: "UA7", text: "UA7" },
];

export const CreateAccountDialog: React.FC<Props> = (props) => {
  const [accountName, setAccountName] = React.useState("");
  const [accountType, setAccountType] = React.useState<IDropdownOption>(
    dropdownOptions[0],
  );
  const [prefill, setPrefill] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const {
    error: createError,
    isLoading: createLoading,
    data: createData,
    reset: resetCreate,
    mutateAsync: createAccountAsync,
  } = useCreateAccount({
    accountName,
    accountType: accountType.key.toString(),
    email: email,
    prefill,
  });

  const onSelectedAccountTypeChanged = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption,
  ): void => {
    setAccountType(item ?? dropdownOptions[0]);
  };

  const onAccountNameChanged = (ev: any, val?: string) => {
    setAccountName(val ?? "");
  };

  const onEmailChanged = (ev: any, val?: string) => {
    setEmail(val ?? "");
  };

  const onCreateAccountClicked = async () => {
    const account = await createAccountAsync();
    props.onAccountCreated(account);
  };

  const clientId = process.env.NEXT_PUBLIC_stripe_client_id;
  const currentUrl = new URL(window.location.href);
  const redirectUrl = `${currentUrl.protocol}//${currentUrl.host}/oauthredirect`;
  const getStandardOAuthUrl = () => {
    if (!clientId) {
      console.log("No client id configured, so OAuth create will be disabled");
      return null;
    }

    return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(
      redirectUrl,
    )}`;
  };
  const standardOauthUrl = getStandardOAuthUrl();

  const getExpressOAuthUrl = () => {
    if (!clientId) {
      console.log("No client id configured, so OAuth create will be disabled");
      return null;
    }

    return `https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(
      redirectUrl,
    )}`;
  };
  const expressOAuthUrl = getExpressOAuthUrl();

  const renderContent = () => {
    if (createError) {
      return <Text>An error ocurred when creating the account.</Text>;
    }

    if (createLoading) {
      return <Spinner label="Creating an account..." />;
    }

    if (createData) {
      return (
        <>
          <pre>{JSON.stringify(createData, null, "\t")}</pre>
          <PrimaryButton onClick={resetCreate}>Ok</PrimaryButton>
        </>
      );
    }

    const tokens: IStackTokens = {
      childrenGap: "15px",
    };
    return (
      <Stack tokens={tokens}>
        <TooltipHost
          content={"The nickname the account will have in this app."}
        >
          <TextField
            label="Account nickname"
            onChange={onAccountNameChanged}
            value={accountName}
            placeholder="Account nickname"
          />
        </TooltipHost>
        <TooltipHost
          content={
            "The email registered on the account - it can be any test email like username+test@stripe.com"
          }
        >
          <TextField
            label="Email"
            onChange={onEmailChanged}
            value={email}
            placeholder="Email"
          />
        </TooltipHost>
        <TooltipHost
          content={
            "The account configuration. Each account has different implications in terms of loss liability, dashboard access, pricing config, and onboarding ownership."
          }
        >
          <Dropdown
            selectedKey={accountType ? accountType.key : undefined}
            onChange={onSelectedAccountTypeChanged}
            placeholder="Select an option"
            options={dropdownOptions}
            label="Account type"
          />
        </TooltipHost>
        <TooltipHost
          content={
            "Whether you want to prefill the account - prefilling implies entering information on the account before onboarding. This will result in the onboarding experience being more streamlined and simulates what we encourage platforms to do."
          }
        >
          <Checkbox
            checked={prefill}
            onChange={(_ev, val) => setPrefill(val ?? false)}
            label="Prefill account"
          />
        </TooltipHost>

        {prefill && (
          <Text>
            If you are prompted to verify information, FirstName: Jenny,
            LastName: Rosen, SSN: 1234, DOB: 01/01/1901
          </Text>
        )}
        <TooltipHost
          content={
            "Creating an account via the API is the best/most recommended method for platforms - it is the only method that allows for prefilling and generally will be easier to implement securely than oauth."
          }
        >
          <PrimaryButton onClick={onCreateAccountClicked}>
            Create account via API
          </PrimaryButton>
        </TooltipHost>

        <Separator />

        {standardOauthUrl && (
          <TooltipHost
            content={
              "Standard Oauth is a different process by which platforms can create standard accounts. It involves an oauth redirect, and will allow users to reuse existing accounts, and may result in the creation of a non CBSP account."
            }
          >
            <PrimaryButton href={standardOauthUrl}>
              Standard OAuth
            </PrimaryButton>{" "}
          </TooltipHost>
        )}
        {expressOAuthUrl && (
          <TooltipHost
            content={
              "Express Oauth is a different process by which platforms can create express accounts. It involves an oauth redirect, however will always result in the creation of a new express account (never a non CBSP account)."
            }
          >
            <PrimaryButton href={expressOAuthUrl}>Express OAuth</PrimaryButton>{" "}
          </TooltipHost>
        )}
      </Stack>
    );
  };

  return (
    <Dialog hidden={false} minWidth={600} onDismiss={props.onDismiss}>
      {renderContent()}
    </Dialog>
  );
};
