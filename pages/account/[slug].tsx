import { useRouter } from "next/router";
import * as React from "react";
import { Text } from "@fluentui/react";

export const AccountDetailPage: React.FC = () => {
  const router = useRouter();
  const accountId = router.query.slug;

  if (typeof accountId !== "string") {
    return <Text>Invalid account ID</Text>;
  }

  return <Text>Account detail page {accountId}</Text>;
};

export default AccountDetailPage;
