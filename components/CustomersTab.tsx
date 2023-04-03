import { Spinner, Text } from "@fluentui/react";
import * as React from "react";
import { useGetCustomers } from "../hooks/useGetCustomers";

export const CustomersTab = ({ accountId }: { accountId: string }) => {
  const { isLoading, error, data } = useGetCustomers(accountId);

  if (error) {
    return <Text>Error loading customers</Text>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return <Text>Not implemented!</Text>;
};
