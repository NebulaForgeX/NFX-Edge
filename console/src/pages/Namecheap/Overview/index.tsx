import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { DataTable, EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useNamecheapCredentials } from "@/hooks/dns";
import { ROUTES } from "@/navigations";

const NamecheapOverviewPage = memo(() => {
  const { t } = useTranslation("dns");
  const navigate = useNavigate();
  const query = useNamecheapCredentials();
  const rows = query.data?.items ?? [];

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={t("accounts.title")}
        description={t("accounts.subtitle")}
        actions={<Button onClick={() => navigate(ROUTES.NAMECHEAP_NEW)}>{t("accounts.add")}</Button>}
      />
      {query.isLoading ? (
        <EmptyState icon={RouterIcon} title={t("loading")} />
      ) : rows.length === 0 ? (
        <Flex direction="column" gap="3" align="start">
          <EmptyState icon={RouterIcon} title={t("accounts.empty")} description={t("accounts.emptyHint")} />
          <Button onClick={() => navigate(ROUTES.NAMECHEAP_NEW)}>{t("accounts.add")}</Button>
        </Flex>
      ) : (
        <DataTable
          emptyIcon={RouterIcon}
          empty={t("accounts.empty")}
          rows={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", row.id))}
          columns={[
            { key: "label", header: t("credential.label"), render: (row) => row.label || "—" },
            { key: "apiUser", header: t("credential.apiUser") },
            { key: "sandbox", header: t("credential.sandbox"), render: (row) => (row.sandbox ? t("yes") : t("no")) },
            { key: "clientIp", header: t("credential.clientIp"), mono: true },
            { key: "lastVerifiedAt", header: t("credential.verifiedAtShort"), render: (row) => row.lastVerifiedAt ?? "—" },
          ]}
        />
      )}
    </PageFrame>
  );
});

NamecheapOverviewPage.displayName = "NamecheapOverviewPage";

export default NamecheapOverviewPage;
