import { initializeIcons } from "@fluentui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { EmbeddedDashboard } from "../components/EmbeddedDashboard";

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
        <title>Embedded test page</title>
        <link rel="icon" href="/favicon.ico" />
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        <script
          async
          src="https://connect-js.stripe.com/v0.1/connect.js"
        ></script>
      </Head>

      <QueryClientProvider client={queryClient}>
        <EmbeddedDashboard />
      </QueryClientProvider>
    </div>
  );
};

// Only run in client
if (typeof window !== "undefined") {
  initializeIcons();
}

export default Home;
