import { ClockIcon, EyeIcon, LockIcon, MagnifierIcon, PenIcon, RefreshIcon, ShieldCheck, TrashIcon, TriangleAlertIcon, UserPlusIcon } from "nfx-ui/icons";
import { Suspense as ReactSuspense, memo, useCallback, useState } from "react";
import { Badge, Button, Flex, Grid, IconButton, Text, TextField, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { safeMaybe } from "nfx-ui/utils";

import { ActionBar, DataTable, PageHeader, StatCard, Suspense } from "@/components";
import { CertificateStatusEnum } from "@/enums";
import { routerEventEmitter } from "@/events/router";
import { useActionCertificateItem } from "@/features/certificate";
import { useCertificateList, useCertificateTime, useInvalidateCache, useSearchCertificate } from "@/hooks";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";
import { showError, showSuccess, showTooltipModal } from "@/stores/modal";
import type { CertificateInfo } from "@/types";
import { getCommandMessage } from "@/utils";


const CertExpiryCell = memo(({ cert }: { cert: CertificateInfo }) => {
  const timeInfo = useCertificateTime(cert);
  return (
    <Badge color={timeInfo.color} variant="surface" radius="full">
      {timeInfo.label}
    </Badge>
  );
});
CertExpiryCell.displayName = "CertExpiryCell";

const CertTableActions = memo(({ cert }: { cert: CertificateInfo }) => {
  const { t } = useTranslation("certCheck");
  const { handleEdit, handleView, handleDelete } = useActionCertificateItem();

  return (
    <Flex gap="1" wrap="wrap" onClick={(e) => e.stopPropagation()}>
      <Tooltip content={t("actions.view")}>
        <IconButton size="1" variant="ghost" color="gray" aria-label={t("actions.view")} onClick={handleView(cert)}>
          <EyeIcon size={14} />
        </IconButton>
      </Tooltip>
      <Tooltip content={t("actions.edit")}>
        <IconButton size="1" variant="ghost" color="gray" aria-label={t("actions.edit")} onClick={handleEdit(cert)}>
          <PenIcon size={14} />
        </IconButton>
      </Tooltip>
      {cert.lastErrorMessage ? (
        <Tooltip content={t("certificate.lastError")}>
          <IconButton
            size="1"
            variant="ghost"
            color="amber"
            aria-label={t("certificate.lastError")}
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
          </IconButton>
        </Tooltip>
      ) : null}
      {cert.status !== CertificateStatusEnum.PROCESS ? (
        <Tooltip content={t("actions.delete")}>
          <IconButton size="1" variant="ghost" color="red" aria-label={t("actions.delete")} onClick={handleDelete(cert)}>
            <TrashIcon size={14} />
          </IconButton>
        </Tooltip>
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
  const expired = rows.filter((cert) => !cert.isValid || (cert.daysRemaining !== undefined && cert.daysRemaining <= 0)).length;
  const expiring = rows.filter((cert) => cert.daysRemaining !== undefined && cert.daysRemaining > 0 && cert.daysRemaining <= 30).length;

  return (
    <Grid columns={{ initial: "1", sm: "3" }} gap="4">
      <StatCard icon={ShieldCheck} label={t("certificate.list")} value={rows.length} tone="accent" />
      <StatCard icon={ClockIcon} label={t("status.expiringSoon")} value={expiring} tone="amber" />
      <StatCard icon={TriangleAlertIcon} label={t("status.expired")} value={expired} tone="red" />
    </Grid>
  );
});
CertSummary.displayName = "CertSummary";

function useCertColumns() {
  const { t } = useTranslation("certCheck");
  return [
    {
      key: "domain",
      header: t("certificate.domain"),
      render: (cert: CertificateInfo) => (
        <Text size="2" weight="medium">
          {cert.domain}
        </Text>
      ),
    },
    { key: "issuer", header: t("certificate.issuer"), render: (cert: CertificateInfo) => cert.issuer || "—" },
    { key: "notAfter", header: t("certificate.expiryDate"), mono: true, render: (cert: CertificateInfo) => cert.notAfter || "—" },
    { key: "status", header: t("status.remaining"), render: (cert: CertificateInfo) => <CertExpiryCell cert={cert} /> },
    { key: "actions", header: t("actions.view"), render: (cert: CertificateInfo) => <CertTableActions cert={cert} /> },
  ];
}

const CertList = memo(() => {
  const { t } = useTranslation("certCheck");
  const columns = useCertColumns();
  const { data: certificates = [], hasNextPage, isFetchingNextPage, fetchNextPage } = useCertificateList({ staleTime: 1000 * 60 * 5 });
  const rows = certificates.filter((cert) => cert && cert.domain);

  return (
    <Flex direction="column" gap="4">
      <CertSummary />
      <DataTable
        emptyIcon={LockIcon}
        empty={t("certificate.empty")}
        emptyAction={<Button onClick={() => routerEventEmitter.navigate({ to: ROUTES.CERT_ADD })}>{t("actions.add")}</Button>}
        rows={rows}
        rowKey={(cert) => cert.id || cert.domain}
        onRowClick={openCert}
        columns={columns}
      />
      {hasNextPage ? (
        <Flex justify="center">
          <Button variant="outline" color="gray" loading={isFetchingNextPage} onClick={() => void fetchNextPage()}>
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
  const columns = useCertColumns();
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
      <PageHeader
        icon={LockIcon}
        index={t("index")}
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button onClick={() => navigate(ROUTES.CERT_ADD)}>
            <UserPlusIcon size={16} />
            {t("actions.add")}
          </Button>
        }
      />
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
        >
          <TextField.Slot>
            <MagnifierIcon size={14} />
          </TextField.Slot>
        </TextField.Root>
        <Button variant="outline" color="gray" onClick={() => void handleSearch()} loading={searchMutation.isPending}>
          {t("actions.search")}
        </Button>
        <Button variant="outline" color="gray" onClick={() => void handleRefresh()} loading={invalidateCacheMutation.isPending}>
          <RefreshIcon size={16} />
          {t("actions.refresh")}
        </Button>
      </ActionBar>
      {appliedKeyword ? (
        <DataTable
          emptyIcon={LockIcon}
          empty={t("certificate.empty")}
          emptyAction={<Button onClick={() => navigate(ROUTES.CERT_ADD)}>{t("actions.add")}</Button>}
          loading={searchMutation.isPending}
          rows={searchRows}
          rowKey={(cert) => cert.id || cert.domain}
          onRowClick={openCert}
          columns={columns}
        />
      ) : (
        <Suspense loadingText={t("actions.checking")}>
          <CertList />
        </Suspense>
      )}
    </PageFrame>
  );
});

CertsOverviewPage.displayName = "CertsOverviewPage";

export default CertsOverviewPage;
