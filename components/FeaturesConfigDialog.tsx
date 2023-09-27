import {
  PrimaryButton,
  Stack,
  StackItem,
  Text,
  Dialog,
  IStackTokens,
  Checkbox,
  DefaultButton,
} from "@fluentui/react";
import * as React from "react";
import { defaultFeaturesConfig } from "../utils/featuresConfigUtils";
import type {
  FeaturesConfig,
  Component,
  Feature,
} from "../utils/featuresConfigUtils";
import { getFeaturesConfigInStorage } from "../clientsStorage/LocalStorageEntry";

type Props = {
  onDismiss: () => void;
  onSave: (featuresConfig: FeaturesConfig) => void;
  onReset: () => void;
};

function deepCopy(obj: Object) {
  return JSON.parse(JSON.stringify(obj));
}

export const FeaturesConfigDialog: React.FC<Props> = (props) => {
  const [featuresConfigState, setFeaturesConfigState] = React.useState(
    getFeaturesConfigInStorage() || deepCopy(defaultFeaturesConfig),
  );

  const renderContent = () => {
    const tokens: IStackTokens = {
      childrenGap: "15px",
    };

    return (
      <Stack tokens={tokens}>
        {Object.keys(featuresConfigState).map((c) => {
          const component = c as Component;
          return (
            <Stack tokens={tokens} key={component}>
              <StackItem>
                <Text variant="large">{component}</Text>
              </StackItem>
              {Object.keys(featuresConfigState[component]).map((f) => {
                const feature = f as Feature;
                return (
                  <StackItem key={feature}>
                    <Checkbox
                      checked={featuresConfigState[component][feature]}
                      onChange={(_ev, val) => {
                        featuresConfigState[component][feature] = val || false;
                        setFeaturesConfigState({ ...featuresConfigState });
                      }}
                      label={feature}
                    />
                  </StackItem>
                );
              })}
            </Stack>
          );
        })}
        <PrimaryButton
          onClick={() => {
            props.onSave(featuresConfigState);
          }}
        >
          Save
        </PrimaryButton>
        <DefaultButton
          onClick={() => {
            props.onReset();
          }}
        >
          Reset
        </DefaultButton>
      </Stack>
    );
  };

  return (
    <Dialog hidden={false} minWidth={600} onDismiss={props.onDismiss}>
      {renderContent()}
    </Dialog>
  );
};
