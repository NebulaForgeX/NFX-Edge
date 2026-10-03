import { ArrowNarrowLeftIcon, ShieldCheck, TriangleAlertIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Badge, Button, Grid, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { ActionBar, DataTable, EmptyState, PageHeader, StatCard } from "@/components";
import FlagBadge from "@/features/dns/FlagBadge";
import { isNamecheapFlag } from "@/features/dns/flag";
import { useNamecheapSsl } from "@/hooks/dns";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";

const NamecheapSslPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const sslQuery = useNamecheapSsl(credentialId);
  const rows = sslQuery.data?.items ?? [];
  const expired = rows.filter((row) => isNamecheapFlag(row.isExpired)).length;
  const backButton = (
    <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
      <ArrowNarrowLeftIcon size={16} />
      {t("accounts.back")}
    </Button>
  );

  return (
    <PageFrame>
      <PageHeader icon={ShieldCheck} index={t("index")} title={t("ssl.title")} description={t("ssl.subtitle")} />
      <ActionBar
        status={
          <Text size="2" color="gray">
            {t("ssl.title")} · {rows.length}
          </Text>
        }
      >
        {backButton}
      </ActionBar>
      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        <StatCard icon={ShieldCheck} label={t("ssl.title")} value={rows.length} tone="accent" />
        <StatCard icon={TriangleAlertIcon} label={t("ssl.expired")} value={expired} tone="red" />
      </Grid>
      {sslQuery.isError ? (
        <EmptyState icon={TriangleAlertIcon} title={t("ssl.loadError")} description={getApiError(sslQuery.error)?.message} action={backButton} />
      ) : (
        <DataTable
          emptyIcon={ShieldCheck}
          empty={t("ssl.empty")}
          emptyAction={backButton}
          loading={sslQuery.isLoading}
          rows={rows}
          rowKey={(row) => row.certificateId || `${row.hostName}-${row.expireDate}`}
          columns={[
            {
              key: "hostName",
              header: t("ssl.host"),
              render: (row) => (
                <Text size="2" weight="medium">
                  {row.hostName || "—"}
                </Text>
              ),
            },
            { key: "sslType", header: t("ssl.type") },
            {
              key: "status",
              header: t("ssl.status"),
              render: (row) =>
                row.status ? (
                  <Badge variant="surface" radius="full" color="gray">
                    {row.status}
                  </Badge>
                ) : (
                  "—"
                ),
            },
            { key: "purchaseDate", header: t("ssl.purchased"), mono: true },
            { key: "expireDate", header: t("ssl.expires"), mono: true },
            { key: "isExpired", header: t("ssl.expired"), render: (row) => <FlagBadge value={row.isExpired} yes={t("yes")} no={t("no")} onColor="red" /> },
          ]}
        />
      )}
    </PageFrame>
  );
});

NamecheapSslPage.displayName = "NamecheapSslPage";

export default NamecheapSslPage;
