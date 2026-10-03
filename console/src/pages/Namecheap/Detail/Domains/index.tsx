import { ArrowNarrowLeftIcon, LockIcon, StackIcon, TriangleAlertIcon, WorldIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Grid, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { ActionBar, DataTable, EmptyState, PageHeader, StatCard } from "@/components";
import FlagBadge from "@/features/dns/FlagBadge";
import { isNamecheapFlag } from "@/features/dns/flag";
import { useNamecheapCredential, useNamecheapDomains } from "@/hooks/dns";
import { PageFrame } from "@/layouts";
import { ROUTES } from "@/navigations";

const NamecheapDomainsPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential(credentialId);
  const domainsQuery = useNamecheapDomains(credentialId);
  const domains = domainsQuery.data?.items ?? [];
  const expired = domains.filter((domain) => isNamecheapFlag(domain.isExpired)).length;
  const locked = domains.filter((domain) => isNamecheapFlag(domain.isLocked)).length;
  const backToAccount = () => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId));
  const backButton = (
    <Button variant="outline" color="gray" onClick={backToAccount}>
      <ArrowNarrowLeftIcon size={16} />
      {t("accounts.back")}
    </Button>
  );

  return (
    <PageFrame>
      <PageHeader
        icon={WorldIcon}
        index={t("index")}
        title={t("domains.title")}
        description={credentialQuery.data ? `${credentialQuery.data.apiUser} · ${t("domains.pageHint")}` : t("domains.pageHint")}
        actions={
          <Button onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS_BULK.replace(":credentialId", credentialId))}>
            <StackIcon size={16} />
            {t("bulk.open")}
          </Button>
        }
      />
      <ActionBar
        status={
          <Text size="2" color="gray">
            {t("domains.title")} · {domains.length}
          </Text>
        }
      >
        {backButton}
      </ActionBar>
      <Grid columns={{ initial: "1", sm: "3" }} gap="4">
        <StatCard icon={WorldIcon} label={t("domains.title")} value={domains.length} tone="accent" />
        <StatCard icon={TriangleAlertIcon} label={t("domains.expired")} value={expired} tone="red" />
        <StatCard icon={LockIcon} label={t("domains.locked")} value={locked} tone="gray" />
      </Grid>
      {domainsQuery.isError ? (
        <EmptyState icon={TriangleAlertIcon} title={t("domains.loadError")} description={getApiError(domainsQuery.error)?.message} action={backButton} />
      ) : (
        <DataTable
          emptyIcon={WorldIcon}
          empty={t("empty.domains")}
          emptyAction={backButton}
          loading={domainsQuery.isLoading}
          rows={domains}
          rowKey={(d) => d.name}
          onRowClick={(d) => navigate(ROUTES.NAMECHEAP_DOMAIN.replace(":credentialId", credentialId).replace(":domain", encodeURIComponent(d.name)))}
          columns={[
            {
              key: "name",
              header: t("domains.name"),
              render: (d) => (
                <Text size="2" weight="medium">
                  {d.name}
                </Text>
              ),
            },
            { key: "created", header: t("domains.created"), mono: true, render: (d) => d.created ?? "—" },
            { key: "expires", header: t("domains.expires"), mono: true, render: (d) => d.expires ?? "—" },
            { key: "isExpired", header: t("domains.expired"), render: (d) => <FlagBadge value={d.isExpired} yes={t("yes")} no={t("no")} onColor="red" /> },
            { key: "isLocked", header: t("domains.locked"), render: (d) => <FlagBadge value={d.isLocked} yes={t("yes")} no={t("no")} onColor="amber" /> },
            { key: "autoRenew", header: t("domains.autoRenew"), render: (d) => <FlagBadge value={d.autoRenew} yes={t("yes")} no={t("no")} /> },
            { key: "isOurDns", header: t("domains.dns"), render: (d) => <FlagBadge value={d.isOurDns} yes={t("yes")} no={t("no")} /> },
          ]}
        />
      )}
    </PageFrame>
  );
});

NamecheapDomainsPage.displayName = "NamecheapDomainsPage";

export default NamecheapDomainsPage;
