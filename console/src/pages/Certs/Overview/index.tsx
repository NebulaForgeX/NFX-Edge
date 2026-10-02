import { EyeIcon, LockIcon, PenIcon, RefreshIcon, TrashIcon, TriangleAlertIcon, UserPlusIcon } from "nfx-ui/icons";
import { Suspense as ReactSuspense, memo, useCallback, useState } from "react";
import { Button, Container, Flex, Grid, Section, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { safeMaybe } from "nfx-ui/utils";

import { ActionBar, DataTable, PageHeader, Suspense } from "@/components";
import { CertificateStatusEnum } from "@/enums";
import { routerEventEmitter } from "@/events/router";
import { useActionCertificateItem } from "@/features/certificate";
import { useCertificateList, useCertificateTime, useInvalidateCache, useSearchCertificate } from "@/hooks";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { showError, showSuccess, showTooltipModal } from "@/stores/modal";
import type { CertificateInfo } from "@/types";
import { getCommandMessage } from "@/utils";

import styles from "./s.module.css";

const CertExpiryCell = memo(({ cert }: { cert: CertificateInfo }) => {
  const timeInfo = useCertificateTime(cert);
  return <Text size="2">{timeInfo.label}</Text>;
});
CertExpiryCell.displayName = "CertExpiryCell";

const CertTableActions = memo(({ cert }: { cert: CertificateInfo }) => {
  const { handleEdit, handleView, handleDelete } = useActionCertificateItem();

  return (
    <Flex gap="2" wrap="wrap" onClick={(e) => e.stopPropagation()}>
      <Button size="1" variant="outline" onClick={handleView(cert)}>
        <EyeIcon size={14} />
      </Button>
      <Button size="1" variant="outline" onClick={handleEdit(cert)}>
        <PenIcon size={14} />
      </Button>
      {cert.lastErrorMessage ? (
        <Button
          size="1"
          variant="outline"
          color="red"
          onClick={() => {
            showTooltipModal({
              message: cert.lastErrorMessage ?? "",
              errorTime: safeMaybe(cert.lastErrorTime),
              position: {
                x: window.innerWidth / 2 - 175,
                y: window.innerHeight / 2 - 120,
              },
            });
          }}
        >
          <TriangleAlertIcon size={14} />
        </Button>
      ) : null}
      {cert.status !== CertificateStatusEnum.PROCESS ? (
        <Button size="1" variant="outline" color="red" onClick={handleDelete(cert)}>
          <TrashIcon size={14} />
        </Button>
      ) : null}
    </Flex>
  );
});
CertTableActions.displayName = "CertTableActions";

function openCert(cert: CertificateInfo) {
  if (!cert.id) return;
  routerEventEmitter.navigate({ to: ROUTES.CERT_DETAIL.replace(":certificateId", encodeURIComponent(cert.id)) });
}

const CertCount = memo(() => {
  const { t } = useTranslation("certCheck");
  const { data: certificates = [] } = useCertificateList({ staleTime: 1000 * 60 * 5 });
  const count = certificates.filter((cert) => cert && cert.domain).length;
  return (
    <Text size="2" color="gray">
      {t("certificate.list")} · {count}
    </Text>
  );
});
CertCount.displayName = "CertCount";

const CertSummary = memo(() => {
  const { t } = useTranslation("certCheck");
  const { data: certificates = [] } = useCertificateList({ staleTime: 1000 * 60 * 5 });
  const rows = certificates.filter((cert) => cert && cert.domain);
  const expiring = rows.filter((cert) => cert.daysRemaining !== undefined && cert.daysRemaining <= 30).length;

  return (
    <Section size="1" py="4" className={styles.side}>
      <Container size="2" px="4" width="100%">
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              {t("certificate.list")}
            </Text>
            <Text size="7" className={styles.count}>
              {rows.length}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">
              {t("status.expiringSoon")}
            </Text>
            <Text size="4" className={styles.count}>
              {expiring}
            </Text>
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
});
CertSummary.displayName = "CertSummary";

const CertList = memo(() => {
  const { t } = useTranslation("certCheck");
  const { data: certificates = [], hasNextPage, isFetchingNextPage, fetchNextPage } = useCertificateList({ staleTime: 1000 * 60 * 5 });
  const rows = certificates.filter((cert) => cert && cert.domain);

  return (
    <Flex direction="column" gap="3">
      <DataTable
        emptyIcon={LockIcon}
        empty={t("certificate.empty")}
        emptyAction={
          <Button size="2" onClick={() => routerEventEmitter.navigate({ to: ROUTES.CERT_ADD })}>
            {t("actions.add")}
          </Button>
        }
        rows={rows}
        rowKey={(cert) => cert.id || cert.domain}
        onRowClick={openCert}
        columns={[
          { key: "domain", header: t("certificate.domain") },
          { key: "issuer", header: t("certificate.issuer"), render: (cert) => cert.issuer || "—" },
          { key: "notAfter", header: t("certificate.expiryDate"), render: (cert) => cert.notAfter || "—" },
          { key: "status", header: t("status.remaining"), render: (cert) => <CertExpiryCell cert={cert} /> },
          { key: "actions", header: t("actions.view"), render: (cert) => <CertTableActions cert={cert} /> },
        ]}
      />
      {hasNextPage ? (
        <Flex>
          <Button variant="outline" loading={isFetchingNextPage} onClick={() => void fetchNextPage()}>
            {t("actions.loadingMore")}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  );
});
CertList.displayName = "CertList";

const CertsOverviewPage = memo(() => {
  const { t } = useTranslation("certCheck");
  const navigate = useNavigate();
  const invalidateCacheMutation = useInvalidateCache();
  const searchMutation = useSearchCertificate();
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const searchRows: CertificateInfo[] = (searchMutation.data?.items ?? []).filter((cert) => cert && cert.domain);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await invalidateCacheMutation.mutateAsync();
      if (result.success) {
        showSuccess(getCommandMessage(result.message, t("refresh.success")));
      } else {
        showError(getCommandMessage(result.message, t("refresh.error")));
      }
    } catch {
      // useInvalidateCache onError already surfaces Axios / API errors
    }
  }, [invalidateCacheMutation, t]);

  const handleSearch = useCallback(async () => {
    const next = keyword.trim();
    setAppliedKeyword(next);
    if (!next) {
      searchMutation.reset();
      return;
    }
    await searchMutation.mutateAsync({ keyword: next, offset: 0, limit: 100 });
  }, [keyword, searchMutation]);

  return (
    <PageFrame>
      <PageHeader icon={LockIcon} index={t("index")} title={t("title")} description={t("subtitle")} />
      <ActionBar
        status={
          appliedKeyword ? (
            <Text size="2" color="gray">
              {t("certificate.list")} · {searchRows.length}
            </Text>
          ) : (
            <ReactSuspense
              fallback={
                <Text size="2" color="gray">
                  {t("certificate.list")}
                </Text>
              }
            >
              <CertCount />
            </ReactSuspense>
          )
        }
      >
        <TextField.Root
          size="2"
          value={keyword}
          placeholder={t("actions.searchPlaceholder")}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSearch();
          }}
        />
        <Button variant="outline" onClick={() => void handleSearch()} loading={searchMutation.isPending}>
          {t("actions.search")}
        </Button>
        <Button variant="outline" onClick={() => void handleRefresh()} disabled={invalidateCacheMutation.isPending}>
          <RefreshIcon size={16} />
          {invalidateCacheMutation.isPending ? t("actions.refreshing") : t("actions.refresh")}
        </Button>
        <Button onClick={() => navigate(ROUTES.CERT_ADD)}>
          <UserPlusIcon size={16} />
          {t("actions.add")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 16rem" }} gap="6" align="start">
        {appliedKeyword ? (
          <DataTable
            emptyIcon={LockIcon}
            empty={t("certificate.empty")}
            loading={searchMutation.isPending}
            rows={searchRows}
            rowKey={(cert) => cert.id || cert.domain}
            onRowClick={openCert}
            columns={[
              { key: "domain", header: t("certificate.domain") },
              { key: "issuer", header: t("certificate.issuer"), render: (cert) => cert.issuer || "—" },
              { key: "notAfter", header: t("certificate.expiryDate"), render: (cert) => cert.notAfter || "—" },
              { key: "status", header: t("status.remaining"), render: (cert) => <CertExpiryCell cert={cert} /> },
              { key: "actions", header: t("actions.view"), render: (cert) => <CertTableActions cert={cert} /> },
            ]}
          />
        ) : (
          <Suspense loadingText={t("actions.checking") ?? "Checking certificates..."}>
            <CertList />
          </Suspense>
        )}
        <CertSummary />
      </Grid>
    </PageFrame>
  );
});

CertsOverviewPage.displayName = "CertsOverviewPage";

export default CertsOverviewPage;
