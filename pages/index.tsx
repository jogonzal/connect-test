import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "../components/App";

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
    <div>
      <Head>
        <title>Connect test platform</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </div>
  );
};

export default Home;
