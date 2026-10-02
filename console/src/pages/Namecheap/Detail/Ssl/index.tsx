import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Container, Flex, Grid, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { ActionBar, DataTable, EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { useNamecheapSsl } from "@/hooks/dns";
import { ROUTES } from "@/navigations";

import styles from "./s.module.css";

const NamecheapSslPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const sslQuery = useNamecheapSsl(credentialId);
  const rows = sslQuery.data?.items ?? [];
  const expired = rows.filter((row) => {
    const next = (row.isExpired ?? "").toLowerCase();
    return next === "true" || next === "yes";
  }).length;

  return (
    <PageFrame>
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={t("ssl.title")}
        description={t("ssl.subtitle")}
      />
      <ActionBar
        status={
          <Text size="2" color="gray">
            {t("ssl.title")} · {rows.length}
          </Text>
        }
      >
        <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
          {t("accounts.back")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 14rem" }} gap="6" align="start">
      {sslQuery.isLoading ? (
        <EmptyState icon={RouterIcon} title={t("loading")} />
      ) : sslQuery.isError ? (
        <EmptyState icon={RouterIcon} title={t("ssl.loadError")} description={getApiError(sslQuery.error)?.message} />
      ) : (
        <DataTable
          emptyIcon={RouterIcon}
          empty={t("ssl.empty")}
          emptyAction={
            <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DETAIL.replace(":credentialId", credentialId))}>
              {t("accounts.back")}
            </Button>
          }
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
      <Section size="1" py="4" className={styles.side}>
        <Container size="2" px="4" width="100%">
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">{t("ssl.title")}</Text>
              <Text size="7" className={styles.count}>{rows.length}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="1" color="gray">{t("ssl.expired")}</Text>
              <Text size="4" className={styles.count}>{expired}</Text>
            </Flex>
          </Flex>
        </Container>
      </Section>
      </Grid>
    </PageFrame>
  );
});

NamecheapSslPage.displayName = "NamecheapSslPage";

export default NamecheapSslPage;
