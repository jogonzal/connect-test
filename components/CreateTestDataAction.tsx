import {
  FontIcon,
  PrimaryButton,
  Spinner,
  Stack,
  StackItem,
  Text,
} from "@fluentui/react";
import * as React from "react";

type Props<T = void> = {
  buttonText: string;
  hookData: {
    error: Error | null;
    isLoading: boolean;
    isSuccess: boolean;
    reset: () => void;
    mutateAsync: (params: T) => void;
  };
  params?: T;
};

export function CreateTestDataAction<T>({
  buttonText: buttonName,
  hookData,
  params,
}: Props<T>) {
  const { error, isLoading, isSuccess, reset, mutateAsync } = hookData;

  return (
    <Stack>
      <StackItem>
        <Stack horizontal verticalAlign="center">
          <StackItem>
            <PrimaryButton
              onClick={() => mutateAsync(params as T)}
              disabled={isLoading}
              style={{ marginRight: "4px" }}
            >
              {buttonName}
              {isLoading && <Spinner style={{ marginLeft: "4px" }} />}
            </PrimaryButton>
          </StackItem>
          <StackItem>
            {isSuccess && <FontIcon iconName="BoxCheckmarkSolid" />}
          </StackItem>
        </Stack>
      </StackItem>
      <StackItem>
        {error && (
          <Text style={{ color: "red", marginBottom: "5px" }}>
            {error?.message}
          </Text>
        )}
      </StackItem>
    </Stack>
  );
}
