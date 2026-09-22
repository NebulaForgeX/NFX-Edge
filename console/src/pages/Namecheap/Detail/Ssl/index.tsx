import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { DataTable, EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { useNamecheapSsl } from "@/hooks/dns";
import { ROUTES } from "@/navigations";

const NamecheapSslPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const sslQuery = useNamecheapSsl(credentialId);
  const rows = sslQuery.data?.items ?? [];

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={t("ssl.title")}
        description={t("ssl.subtitle")}
        actions={
          <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
            {t("accounts.back")}
          </Button>
        }
      />
      {sslQuery.isLoading ? (
        <EmptyState icon={RouterIcon} title={t("loading")} />
      ) : sslQuery.isError ? (
        <EmptyState icon={RouterIcon} title={t("ssl.loadError")} description={getApiError(sslQuery.error)?.message} />
      ) : (
        <DataTable
          emptyIcon={RouterIcon}
          empty={t("ssl.empty")}
          rows={rows}
          rowKey={(row) => row.certificateId || `${row.hostName}-${row.expireDate}`}
          columns={[
            { key: "hostName", header: t("ssl.host") },
            { key: "sslType", header: t("ssl.type") },
            { key: "status", header: t("ssl.status") },
            { key: "purchaseDate", header: t("ssl.purchased") },
            { key: "expireDate", header: t("ssl.expires") },
            { key: "isExpired", header: t("ssl.expired") },
          ]}
        />
      )}
    </PageFrame>
  );
});

NamecheapSslPage.displayName = "NamecheapSslPage";

export default NamecheapSslPage;
