import { LayoutDashboardIcon, MagnifierIcon, RouterIcon, ShieldCheck, StackIcon } from "nfx-ui/icons";
import { memo, useMemo } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { DataTable, PageHeader, Suspense } from "@/components";
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
      <div className={styles.stamps}>
        <div className={styles.stamp}>
          <div className={styles.stampPx}>
            <div className={styles.stampPy}>
              <div className={styles.stampStack}>
                <span className={styles.stampKey}>{t("dashboard.totalCerts")}</span>
                <span className={styles.stampVal}>{certificates.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.stamp}>
          <div className={styles.stampPx}>
            <div className={styles.stampPy}>
              <div className={styles.stampStack}>
                <span className={styles.stampKey}>{t("dashboard.expiringSoon")}</span>
                <span className={`${styles.stampVal} ${expiring.length ? styles.stampWarn : ""}`}>{expiring.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ledgerBlock}>
        <Text as="p" className={styles.ledgerTitle}>
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
      </div>
    </Flex>
  );
});

DashboardBody.displayName = "DashboardBody";

const DashboardPage = memo(() => {
  const { t } = useTranslation("common");
  const { t: tNav } = useTranslation("navigation");

  return (
    <PageFrame>
      <PageHeader
        icon={LayoutDashboardIcon}
        index={t("dashboard.index")}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Flex gap="2" wrap="wrap">
            <Button asChild variant="outline">
              <Link to={ROUTES.CERT_ADD}>{tNav("addCert")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.CERTS_OVERVIEW}>
                <ShieldCheck size={16} />
                {t("dashboard.certs")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.NAMECHEAP_OVERVIEW}>
                <RouterIcon size={16} />
                {t("dashboard.dns")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.FILE_FOLDER}>
                <StackIcon size={16} />
                {t("dashboard.files")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={ROUTES.ANALYSIS_TLS}>
                <MagnifierIcon size={16} />
                {t("dashboard.analysis")}
              </Link>
            </Button>
          </Flex>
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
