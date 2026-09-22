import { EyeIcon, LockIcon, PenIcon, RefreshIcon, TrashIcon, TriangleAlertIcon, UserPlusIcon } from "nfx-ui/icons";
import { memo, useCallback, useState } from "react";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { safeMaybe } from "nfx-ui/utils";

import { DataTable, PageHeader, Suspense } from "@/components";
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

const CertList = memo(() => {
  const { t } = useTranslation("certCheck");
  const { data: certificates = [], hasNextPage, isFetchingNextPage, fetchNextPage } = useCertificateList({ staleTime: 1000 * 60 * 5 });
  const rows = certificates.filter((cert) => cert && cert.domain);

  return (
    <Flex direction="column" gap="3">
      <Text size="2" color="gray">
        {t("certificate.list")} · {rows.length}
      </Text>
      <DataTable
        emptyIcon={LockIcon}
        empty={t("certificate.empty")}
        rows={rows}
        rowKey={(cert) => cert.id || cert.domain}
        onRowClick={(cert) => {
          if (!cert.id) return;
          routerEventEmitter.navigate({ to: ROUTES.CERT_DETAIL.replace(":certificateId", encodeURIComponent(cert.id)) });
        }}
        columns={[
          { key: "domain", header: t("certificate.domain") },
          { key: "issuer", header: t("certificate.issuer"), render: (cert) => cert.issuer || "—" },
          { key: "notAfter", header: t("certificate.expiryDate"), render: (cert) => cert.notAfter || "—" },
          { key: "status", header: t("status.remaining"), render: (cert) => <CertExpiryCell cert={cert} /> },
          {
            key: "sans",
            header: t("certificate.sans"),
            render: (cert) => (cert.sans && cert.sans.length ? cert.sans.join(", ") : "—"),
          },
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
  const searchRows: CertificateInfo[] = searchMutation.data?.items ?? [];

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
          <Flex gap="2" wrap="wrap" align="center">
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
          </Flex>
        }
      />
      {appliedKeyword ? (
        <DataTable
          emptyIcon={LockIcon}
          empty={t("certificate.empty")}
          loading={searchMutation.isPending}
          rows={searchRows.filter((cert) => cert && cert.domain)}
          rowKey={(cert) => cert.id || cert.domain}
          columns={[
            { key: "domain", header: t("certificate.domain") },
            { key: "issuer", header: t("certificate.issuer"), render: (cert) => cert.issuer || "—" },
            { key: "notAfter", header: t("certificate.expiryDate"), render: (cert) => cert.notAfter || "—" },
            { key: "status", header: t("status.remaining"), render: (cert) => <CertExpiryCell cert={cert} /> },
            {
              key: "sans",
              header: t("certificate.sans"),
              render: (cert) => (cert.sans && cert.sans.length ? cert.sans.join(", ") : "—"),
            },
            { key: "actions", header: t("actions.view"), render: (cert) => <CertTableActions cert={cert} /> },
          ]}
        />
      ) : (
        <Suspense loadingText={t("actions.checking") ?? "Checking certificates..."}>
          <CertList />
        </Suspense>
      )}
    </PageFrame>
  );
});

CertsOverviewPage.displayName = "CertsOverviewPage";

export default CertsOverviewPage;
