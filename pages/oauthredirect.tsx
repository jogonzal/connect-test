import { initializeIcons } from "@fluentui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { OauthRedirectPage } from "../components/OauthRedirectPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const Home: NextPage = () => {
  return (
    <div
      style={{
        fontFamily:
          '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      <Head>
        <title>Oauth redirect page</title>
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      </Head>

      <QueryClientProvider client={queryClient}>
        <OauthRedirectPage />
      </QueryClientProvider>
    </div>
  );
};

// Only run in client
if (typeof window !== "undefined") {
  initializeIcons();
}

export default Home;
