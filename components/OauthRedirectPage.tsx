import * as React from "react";
import { Link, Spinner, Text } from "@fluentui/react";
import { useRedeemCode } from "../hooks/useRedeemCode";
import { useRouter } from "next/router";

export const OauthRedirectPage: React.FC = () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const error_description = url.searchParams.get("error");
  const router = useRouter();

  const { data, isLoading, error: apiError } = useRedeemCode(code);

  if (error) {
    return (
      <Text>
        There was an error during redirect! {error} {error_description}
      </Text>
    );
  }

  if (apiError) {
    return <Text>There was an error redeeming {JSON.stringify(apiError)}</Text>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Text>
      Successfully connected to account {data?.stripe_user_id}.{" "}
      <Link
        onClick={() => {
          router.push("./" + window.location.search);
        }}
      >
        Click here to go back to the main page
      </Link>
      <Text>Full data:</Text>
      <pre>{JSON.stringify(data, null, "\t")}</pre>
    </Text>
  );
};
