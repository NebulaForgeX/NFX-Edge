import { ClockIcon, LayoutDashboardIcon, ShieldCheck, UserPlusIcon } from "nfx-ui/icons";
import { memo, useMemo } from "react";
import { Badge, Button, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { DataTable, PageHeader, StatCard, Suspense } from "@/components";
import { routerEventEmitter } from "@/events/router";
import { useCertificateList, useCertificateTime } from "@/hooks";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import type { CertificateInfo } from "@/types";

function ExpiringRowLabel({ cert }: { cert: CertificateInfo }) {
  const timeInfo = useCertificateTime(cert);
  return (
    <Badge color={timeInfo.color} variant="surface" radius="full">
      {timeInfo.label}
    </Badge>
  );
}

const DashboardBody = memo(() => {
  const { t } = useTranslation("common");
  const { data: certificates = [] } = useCertificateList({ staleTime: 1000 * 60 * 5 });
  const expiring = useMemo(
    () =>
      certificates
        .filter((cert) => cert && cert.domain && cert.daysRemaining !== undefined && cert.daysRemaining <= 30)
        .slice()
        .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0)),
    [certificates],
  );

  return (
    <Flex direction="column" gap="5">
      <Grid columns={{ initial: "1", sm: "2" }} gap="4" width="100%">
        <StatCard icon={ShieldCheck} label={t("dashboard.totalCerts")} value={certificates.length} tone="accent" />
        <StatCard icon={ClockIcon} label={t("dashboard.expiringSoon")} value={expiring.length} tone={expiring.length ? "amber" : "green"} />
      </Grid>

      <Flex direction="column" gap="3">
        <Flex align="center" justify="between" gap="3">
          <Heading as="h3" size="3" weight="bold">
            {t("dashboard.expiringTable")}
          </Heading>
          <Text size="2" color="gray">
            {expiring.length}
          </Text>
        </Flex>
        <DataTable
          emptyIcon={ShieldCheck}
          empty={t("dashboard.noExpiring")}
          rows={expiring}
          rowKey={(row) => row.id || row.domain}
          onRowClick={(row) => {
            if (!row.id) return;
            routerEventEmitter.navigate({ to: ROUTES.CERT_DETAIL.replace(":certificateId", encodeURIComponent(row.id)) });
          }}
          columns={[
            {
              key: "domain",
              header: t("dashboard.colDomain"),
              render: (row) => (
                <Text size="2" weight="medium">
                  {row.domain}
                </Text>
              ),
            },
            { key: "issuer", header: t("dashboard.colIssuer"), render: (row) => row.issuer || "—", mono: true },
            { key: "notAfter", header: t("dashboard.colExpiry"), render: (row) => row.notAfter || "—", mono: true },
            { key: "status", header: t("dashboard.colStatus"), render: (row) => <ExpiringRowLabel cert={row} /> },
          ]}
        />
      </Flex>
    </Flex>
  );
});

DashboardBody.displayName = "DashboardBody";

const DashboardPage = memo(() => {
  const { t } = useTranslation("common");

  return (
    <PageFrame>
      <PageHeader
        icon={LayoutDashboardIcon}
        index={t("dashboard.index")}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button asChild>
            <Link to={ROUTES.CERT_ADD}>
              <UserPlusIcon size={16} />
              {t("dashboard.addCert")}
            </Link>
          </Button>
        }
      />
      <Suspense>
        <DashboardBody />
      </Suspense>
    </PageFrame>
  );
});

DashboardPage.displayName = "DashboardPage";
export default DashboardPage;
