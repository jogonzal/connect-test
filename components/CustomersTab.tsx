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
import Stripe from "stripe";
import { useCreateCustomer } from "../hooks/useCreateCustomer";
import { useGetCustomers } from "../hooks/useGetCustomers";

export const CustomersTab = ({ accountId }: { accountId: string }) => {
  const {
    isLoading,
    error,
    data: customers,
    refetch: refetchCustomers,
  } = useGetCustomers(accountId);
  const [customerId, setCustomerId] = React.useState<string | undefined>(
    undefined,
  );
  const [showCustomerCreateDialog, setShowCustomerCreateDialog] =
    React.useState<boolean>(false);

  const [customerName, setCustomerName] = React.useState<string>("");
  const [customerDescription, setCustomerDescription] =
    React.useState<string>("");

  const {
    error: createCustomerError,
    isLoading: createCustomerLoading,
    data: createCustomerData,
    reset: createCustomerReset,
    mutateAsync: createCustomerAsync,
  } = useCreateCustomer(accountId, {
    name: customerName,
    description: customerDescription,
  });

  if (error) {
    return <Text>Error loading customers</Text>;
  }

  if (isLoading || customers === undefined) {
    return <Spinner />;
  }

  const renderCustomerDetailUI = () => {
    if (!customerId) return null;

    // TODO!
    return null;
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: "id",
        name: "id",
        minWidth: 100,
        onRender: (row: Stripe.Customer) => row.id,
      },
      {
        key: "name",
        name: "name",
        minWidth: 100,
        onRender: (row: Stripe.Customer) => row.name,
      },
      {
        key: "description",
        name: "description",
        minWidth: 100,
        onRender: (row: Stripe.Customer) => row.description,
      },
      {
        key: "balance",
        name: "balance",
        minWidth: 100,
        onRender: (row: Stripe.Customer) => row.balance,
      },
    ];
  };

  const renderCustomerCreateDialog = () => {
    if (!showCustomerCreateDialog) {
      return null;
    }

    const onCreateCustomer = async () => {
      try {
        await createCustomerAsync();
        setShowCustomerCreateDialog(false);
        refetchCustomers();
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <Dialog
        hidden={false}
        onDismiss={() => setShowCustomerCreateDialog(false)}
      >
        <Stack>
          <StackItem>
            <TextField
              label="Name"
              value={customerName}
              onChange={(_ev, val) => setCustomerName(val ?? "")}
            />
          </StackItem>
          <StackItem>
            <TextField
              label="Description"
              value={customerDescription}
              onChange={(_ev, val) => setCustomerDescription(val ?? "")}
            />
          </StackItem>
          {createCustomerLoading && <Spinner />}
          {createCustomerError && <Text>Error creating customer</Text>}
          <StackItem>
            <PrimaryButton onClick={onCreateCustomer}>
              Create customer
            </PrimaryButton>
          </StackItem>
        </Stack>
      </Dialog>
    );
  };

  return (
    <>
      {renderCustomerDetailUI()}
      {renderCustomerCreateDialog()}
      <Stack>
        <StackItem>
          <Text>Customers</Text>
          <PrimaryButton onClick={() => setShowCustomerCreateDialog(true)}>
            Create customer
          </PrimaryButton>
          <DetailsList
            items={customers.data}
            columns={getColumns()}
            layoutMode={DetailsListLayoutMode.justified}
          />
        </StackItem>
      </Stack>
    </>
  );
};
