import { RouterIcon, ShieldCheck, StackIcon, UserPlusIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Badge, Button, Grid, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { DataTable, EmptyState, PageHeader, StatCard } from "@/components";
import { useNamecheapCredentials } from "@/hooks/dns";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";

const NamecheapOverviewPage = memo(() => {
  const { t } = useTranslation("dns");
  const navigate = useNavigate();
  const query = useNamecheapCredentials();
  const rows = query.data?.items ?? [];
  const sandbox = rows.filter((row) => row.sandbox).length;

  const addButton = (
    <Button onClick={() => navigate(ROUTES.NAMECHEAP_NEW)}>
      <UserPlusIcon size={16} />
      {t("accounts.add")}
    </Button>
  );

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={t("accounts.title")} description={t("accounts.subtitle")} actions={addButton} />
      <Grid columns={{ initial: "1", sm: "3" }} gap="4">
        <StatCard icon={RouterIcon} label={t("accounts.title")} value={rows.length} tone="accent" />
        <StatCard icon={ShieldCheck} label={t("accounts.production")} value={rows.length - sandbox} tone="green" />
        <StatCard icon={StackIcon} label={t("accounts.sandbox")} value={sandbox} tone="amber" />
      </Grid>
      {!query.isLoading && rows.length === 0 ? (
        <EmptyState icon={RouterIcon} title={t("accounts.empty")} description={t("accounts.emptyHint")} action={addButton} />
      ) : (
        <DataTable
          emptyIcon={RouterIcon}
          empty={t("accounts.empty")}
          loading={query.isLoading}
          rows={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", row.id))}
          columns={[
            {
              key: "label",
              header: t("credential.label"),
              render: (row) => (
                <Text size="2" weight="medium">
                  {row.label || "—"}
                </Text>
              ),
            },
            { key: "apiUser", header: t("credential.apiUser"), mono: true },
            {
              key: "sandbox",
              header: t("credential.connection"),
              render: (row) => (
                <Badge variant="surface" radius="full" color={row.sandbox ? "amber" : "green"}>
                  {row.sandbox ? t("accounts.sandbox") : t("accounts.production")}
                </Badge>
              ),
            },
            { key: "clientIp", header: t("credential.clientIp"), mono: true },
            { key: "lastVerifiedAt", header: t("credential.verifiedAtShort"), mono: true, render: (row) => row.lastVerifiedAt ?? "—" },
          ]}
        />
      )}
    </PageFrame>
  );
});

NamecheapOverviewPage.displayName = "NamecheapOverviewPage";

export default NamecheapOverviewPage;
