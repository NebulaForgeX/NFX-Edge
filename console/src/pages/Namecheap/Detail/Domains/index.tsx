import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { DataTable, EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { useNamecheapCredential, useNamecheapDomains } from "@/hooks/dns";
import { ROUTES } from "@/navigations";

const NamecheapDomainsPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential(credentialId);
  const domainsQuery = useNamecheapDomains(credentialId);
  const domains = domainsQuery.data?.items ?? [];

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={t("domains.title")}
        description={credentialQuery.data ? `${credentialQuery.data.apiUser} · ${t("domains.pageHint")}` : t("domains.pageHint")}
        actions={
          <Flex gap="2" wrap="wrap">
            <Button onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS_BULK.replace(":credentialId", credentialId))}>{t("bulk.open")}</Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
              {t("accounts.back")}
            </Button>
          </Flex>
        }
      />
      {domainsQuery.isLoading ? (
        <EmptyState icon={RouterIcon} title={t("loading")} />
      ) : domainsQuery.isError ? (
        <EmptyState icon={RouterIcon} title={t("domains.loadError")} description={getApiError(domainsQuery.error)?.message} />
      ) : domains.length === 0 ? (
        <EmptyState icon={RouterIcon} title={t("empty.domains")} />
      ) : (
        <DataTable
          emptyIcon={RouterIcon}
          empty={t("empty.domains")}
          rows={domains}
          rowKey={(d) => d.name}
          onRowClick={(d) =>
            navigate(ROUTES.NAMECHEAP_DOMAIN.replace(":credentialId", credentialId).replace(":domain", encodeURIComponent(d.name)))
          }
          columns={[
            { key: "name", header: t("domains.name") },
            { key: "created", header: t("domains.created"), render: (d) => d.created ?? "—" },
            { key: "expires", header: t("domains.expires"), render: (d) => d.expires ?? "—" },
            { key: "isExpired", header: t("domains.expired"), render: (d) => d.isExpired ?? "—" },
            { key: "isLocked", header: t("domains.locked"), render: (d) => d.isLocked ?? "—" },
            { key: "autoRenew", header: t("domains.autoRenew"), render: (d) => d.autoRenew ?? "—" },
            { key: "isOurDns", header: t("domains.dns"), render: (d) => d.isOurDns ?? "—" },
          ]}
        />
      )}
    </PageFrame>
  );
});

NamecheapDomainsPage.displayName = "NamecheapDomainsPage";

export default NamecheapDomainsPage;
