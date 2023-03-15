import * as React from "react";
import { Text } from "@fluentui/react";

export const PricingTable: React.FC = () => {
  return (
    <div>
      <Text>This is a pricing table</Text>
      <Text>These values are for the platform acct_1MZRIlLirQdaQn8E</Text>
      <stripe-pricing-table
        pricing-table-id="prctbl_1MlnHALirQdaQn8EuWRVy0ll"
        publishable-key="pk_test_51MZRIlLirQdaQn8EJpw9mcVeXokTGaiV1ylz5AVQtcA0zAkoM9fLFN81yQeHYBLkCiID1Bj0sL1Ngzsq9ksRmbBN00O3VsIUdQ"
      ></stripe-pricing-table>
    </div>
  );
};
