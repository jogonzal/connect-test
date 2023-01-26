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
  { key: "UA7", text: "UA7" },
];

export const CreateAccountDialog: React.FC<Props> = (props) => {
  const {
    error: createError,
    isLoading: createLoading,
    data: createData,
    reset: resetCreate,
    mutateAsync: createAccountAsync,
  } = useCreateAccount();
  const [accountName, setAccountName] = React.useState("");
  const [accountType, setAccountType] = React.useState<IDropdownOption>(
    dropdownOptions[0],
  );
  const [prefill, setPrefill] = React.useState(false);
  const [email, setEmail] = React.useState("");

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
    const account = await createAccountAsync({
      accountName,
      accountType: accountType.key.toString(),
      email: email,
      prefill,
    });
    props.onAccountCreated(account);
  };

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
        <TextField
          label="Account name"
          onChange={onAccountNameChanged}
          value={accountName}
          placeholder="Account name"
        />
        <TextField
          label="Email"
          onChange={onEmailChanged}
          value={email}
          placeholder="Email"
        />
        <Dropdown
          selectedKey={accountType ? accountType.key : undefined}
          onChange={onSelectedAccountTypeChanged}
          placeholder="Select an option"
          options={dropdownOptions}
          label="Account type"
        />
        <Checkbox
          checked={prefill}
          onChange={(_ev, val) => setPrefill(val ?? false)}
          label="Prefill account"
        />
        <PrimaryButton onClick={onCreateAccountClicked}>
          Create account
        </PrimaryButton>
      </Stack>
    );
  };

  return (
    <Dialog hidden={false} minWidth={600} onDismiss={props.onDismiss}>
      {renderContent()}
    </Dialog>
  );
};
