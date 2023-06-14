import { useRouter } from "next/router";
import * as React from "react";
import { Spinner, Text } from "@fluentui/react";
import { useGetAccount } from "../../hooks/useGetAccount";
import { useGetCurrentAccount } from "../../hooks/useGetCurrentAccount";
import { EmbeddedDashboardInternal } from "../../components/EmbeddedDashboard";

export const AccountDetailPage: React.FC = () => {
  const router = useRouter();
  const slug = router.query.slug;

  if (typeof slug !== "object" || !Array.isArray(slug)) {
    return <Text>Invalid URL</Text>;
  }

  const accountId = slug[0];
  const activeTab = slug[1] ?? "payments";

  return (
    <AccountDetailPageInternal accountId={accountId} activeTab={activeTab} />
  );
};

const AccountDetailPageInternal: React.FC<{
  accountId: string;
  activeTab: string;
}> = ({ accountId, activeTab }) => {
  const router = useRouter();
  const { data: account, isLoading, error } = useGetAccount(accountId);
  const {
    data: platform,
    isLoading: isPlatformLoading,
    error: isPlatformError,
  } = useGetCurrentAccount();

  if (error || isPlatformError) {
    return <Text>Failed to get account</Text>;
  }

  if (isLoading || !account || isPlatformLoading || !platform) {
    return <Spinner label="Getting account..." />;
  }

  return (
    <EmbeddedDashboardInternal
      account={account}
      platform={platform}
      onTabChanged={(tab) => {
        router.push(`/account/${accountId}/${tab}` + window.location.search);
      }}
      currentTab={activeTab}
      onBackToMainAppClicked={() => {
        router.push("/" + window.location.search);
      }}
    />
  );
};

export default AccountDetailPage;
