import { Stack, StackItem, Text } from "@fluentui/react";
import * as React from "react";
import Stripe from "stripe";
import { specialAccountsData } from "./specialAccountList";
import { useRouter } from "next/router";
import { embeddedDashboardUrl } from "../utils/urls";

export const SpecialAccountsGrid = ({
  currentPlatform,
}: {
  currentPlatform: Stripe.Account;
}) => {
  const router = useRouter();

  if (currentPlatform.id !== "acct_1MZRIlLirQdaQn8E") {
    return null;
  }

  return (
    <Stack tokens={{ childrenGap: "10px" }}>
      <StackItem>
        <Text variant="xLarge">Canonical test accounts</Text>
      </StackItem>
      <StackItem>
        <Stack horizontal tokens={{ childrenGap: "12px" }} wrap>
          {Object.entries(specialAccountsData).map(([key, account]) => {
            return (
              <StackItem
                key={account.id}
                onClick={() => {
                  const url = embeddedDashboardUrl(account.id);
                  router.push(url + window.location.search);
                }}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                  width: "170px",
                }}
              >
                <Stack>
                  <StackItem>
                    <Text variant="mediumPlus">{key}</Text>
                  </StackItem>
                  <StackItem>
                    <Text>{account.id}</Text>
                  </StackItem>
                </Stack>
              </StackItem>
            );
          })}
        </Stack>
      </StackItem>
    </Stack>
  );
};
