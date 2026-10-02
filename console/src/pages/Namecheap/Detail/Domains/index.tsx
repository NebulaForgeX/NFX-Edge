import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, DataTable, EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { useNamecheapCredential, useNamecheapDomains } from "@/hooks/dns";
import { ROUTES } from "@/navigations";

import styles from "./s.module.css";

const NamecheapDomainsPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential(credentialId);
  const domainsQuery = useNamecheapDomains(credentialId);
  const domains = domainsQuery.data?.items ?? [];
  const flagged = (value: string | undefined) => {
    const next = (value ?? "").toLowerCase();
    return next === "true" || next === "yes";
  };
  const expired = domains.filter((domain) => flagged(domain.isExpired)).length;
  const locked = domains.filter((domain) => flagged(domain.isLocked)).length;

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={t("domains.title")}
        description={credentialQuery.data ? `${credentialQuery.data.apiUser} · ${t("domains.pageHint")}` : t("domains.pageHint")}
      />
      <ActionBar
        status={
          <Text size="2" color="gray">
            {t("domains.title")} · {domains.length}
          </Text>
        }
      >
        <Button onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS_BULK.replace(":credentialId", credentialId))}>{t("bulk.open")}</Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
          {t("accounts.back")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 14rem" }} gap="6" align="start">
      {domainsQuery.isLoading ? (
        <EmptyState icon={RouterIcon} title={t("loading")} />
      ) : domainsQuery.isError ? (
        <EmptyState icon={RouterIcon} title={t("domains.loadError")} description={getApiError(domainsQuery.error)?.message} />
      ) : domains.length === 0 ? (
        <EmptyState
          icon={RouterIcon}
          title={t("empty.domains")}
          action={
            <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
              {t("accounts.back")}
            </Button>
          }
        />
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
      <Section size="1" py="4" className={styles.side}>
        <Container size="2" px="4" width="100%">
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">{t("domains.title")}</Text>
              <Text size="7" className={styles.count}>{domains.length}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">{t("domains.expired")}</Text>
              <Text size="4" className={styles.count}>{expired}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">{t("domains.locked")}</Text>
              <Text size="4" className={styles.count}>{locked}</Text>
            </Flex>
          </Flex>
        </Container>
      </Section>
      </Grid>
    </PageFrame>
  );
});

NamecheapDomainsPage.displayName = "NamecheapDomainsPage";

export default NamecheapDomainsPage;
