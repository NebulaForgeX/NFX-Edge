import { LayoutDashboardIcon, ShieldCheck } from "nfx-ui/icons";
import { memo, useMemo } from "react";
import { Box, Button, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, DataTable, PageHeader, Suspense } from "@/components";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useCertificateList, useCertificateTime } from "@/hooks";
import { ROUTES } from "@/navigations";
import { routerEventEmitter } from "@/events/router";
import type { CertificateInfo } from "@/types";

import styles from "./s.module.css";

function ExpiringRowLabel({ cert }: { cert: CertificateInfo }) {
  const timeInfo = useCertificateTime(cert);
  return <Text size="2">{timeInfo.label}</Text>;
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
        <Box className={styles.stamp}>
          <Container width="100%" maxWidth="100%" px="4">
            <Section py="4">
              <Flex direction="column" gap="2">
                <span className={styles.stampKey}>{t("dashboard.totalCerts")}</span>
                <span className={styles.stampVal}>{certificates.length}</span>
              </Flex>
            </Section>
          </Container>
        </Box>
        <Box className={styles.stamp}>
          <Container width="100%" maxWidth="100%" px="4">
            <Section py="4">
              <Flex direction="column" gap="2">
                <span className={styles.stampKey}>{t("dashboard.expiringSoon")}</span>
                <span className={styles.stampWarn}>{expiring.length}</span>
              </Flex>
            </Section>
          </Container>
        </Box>
      </Grid>

      <Flex direction="column" gap="3">
        <Text as="p" className={styles.ledgerTitleText}>
          {t("dashboard.expiringTable")}
        </Text>
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
            { key: "domain", header: t("dashboard.colDomain") },
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
      <PageHeader icon={LayoutDashboardIcon} index={t("dashboard.index")} title={t("title")} description={t("subtitle")} />
      <ActionBar>
        <Button asChild>
          <Link to={ROUTES.CERT_ADD}>{t("dashboard.addCert")}</Link>
        </Button>
      </ActionBar>
      <Suspense>
        <DashboardBody />
      </Suspense>
    </PageFrame>
  );
});

DashboardPage.displayName = "DashboardPage";
export default DashboardPage;
