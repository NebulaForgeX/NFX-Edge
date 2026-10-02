import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Box, Button, Container, Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { useDeleteNamecheapCredential, useNamecheapBalances, useNamecheapCredential, useVerifyNamecheapCredential } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { showConfirm } from "@/stores/modal";

import styles from "./s.module.css";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" gap="1" minWidth="0">
      <Text size="1" color="gray">
        {label}
      </Text>
      <Text size="2">{value}</Text>
    </Flex>
  );
}

const NamecheapDetailPage = memo(() => {
  const { t } = useTranslation("dns");
  const { credentialId = "" } = useParams();
  const navigate = useNavigate();
  const credentialQuery = useNamecheapCredential(credentialId);
  const balancesQuery = useNamecheapBalances(credentialId);
  const verify = useVerifyNamecheapCredential();
  const remove = useDeleteNamecheapCredential();
  const credential = credentialQuery.data;
  const balances = balancesQuery.data;

  if (credentialQuery.isLoading) {
    return (
      <PageFrame>
        <EmptyState icon={RouterIcon} title={t("loading")} />
      </PageFrame>
    );
  }
  if (!credential) {
    return (
      <PageFrame>
        <EmptyState icon={RouterIcon} title={t("accounts.missing")} description={getApiError(credentialQuery.error)?.message} />
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={credential.label || credential.apiUser} description={t("accounts.detailHint")} />
      <Grid columns={{ initial: "1", md: "minmax(0, 1fr) 18rem" }} gap="5" width="100%" align="start">
        <Box className={styles.panel}>
          <Container width="100%" maxWidth="100%" px="5">
            <Section py="5">
              <Flex direction="column" gap="5">
                <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                  <Field label={t("credential.label")} value={credential.label || "—"} />
                  <Field label={t("credential.apiUser")} value={credential.apiUser} />
                  <Field label={t("credential.clientIp")} value={credential.clientIp} />
                  <Field label={t("credential.sandbox")} value={credential.sandbox ? t("credential.sandbox") : t("credential.production")} />
                  <Field label={t("credential.verifiedAtShort")} value={credential.lastVerifiedAt || "—"} />
                  <Field label={t("balances.account")} value={balances?.accountBalance ?? "—"} />
                </Grid>
                {credential.lastErrorMessage ? (
                  <Box className={styles.errFrame}>
                    <Container width="100%" maxWidth="100%" px="3">
                      <Section py="2">{credential.lastErrorMessage}</Section>
                    </Container>
                  </Box>
                ) : null}
                {balancesQuery.isError ? (
                  <Text size="2" color="red">
                    {getApiError(balancesQuery.error)?.message}
                  </Text>
                ) : (
                  <Flex direction="column" gap="2">
                    <Text size="1" color="gray">
                      {t("balances.available")}
                    </Text>
                    <Flex align="baseline" gap="3" wrap="wrap">
                      <Heading size="8" className={styles.balance}>
                        {balances?.availableBalance ?? "—"}
                      </Heading>
                      <Text size="4" color="gray">
                        {balances?.currency ?? ""}
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Section>
          </Container>
        </Box>
        <Box className={styles.panel}>
          <Container width="100%" maxWidth="100%" px="4">
            <Section py="4">
              <Flex direction="column" gap="2">
                <Button variant="outline" onClick={() => void verify.mutateAsync(credentialId)} disabled={verify.isPending}>
                  {t("credential.verify")}
                </Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_EDIT.replace(":credentialId", credentialId))}>
                  {t("credential.edit")}
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  onClick={() =>
                    showConfirm({
                      title: t("credential.confirmDeleteTitle"),
                      message: t("credential.confirmDeleteMessage"),
                      confirmText: t("credential.delete"),
                      cancelText: t("credential.cancel"),
                      onConfirm: () => {
                        void remove.mutateAsync(credentialId).then(() => navigate(ROUTES.NAMECHEAP_OVERVIEW));
                      },
                    })
                  }
                >
                  {t("credential.delete")}
                </Button>
              </Flex>
            </Section>
          </Container>
          <Section py="0" className={styles.sideRule}>
            <Container width="100%" maxWidth="100%" px="4">
              <Section py="4">
                <Flex direction="column" gap="2">
                  <Button onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS.replace(":credentialId", credentialId))}>{t("domains.title")}</Button>
                  <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS_BULK.replace(":credentialId", credentialId))}>
                    {t("bulk.open")}
                  </Button>
                  <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_SSL.replace(":credentialId", credentialId))}>
                    {t("ssl.title")}
                  </Button>
                </Flex>
              </Section>
            </Container>
          </Section>
        </Box>
      </Grid>
    </PageFrame>
  );
});

NamecheapDetailPage.displayName = "NamecheapDetailPage";

export default NamecheapDetailPage;
