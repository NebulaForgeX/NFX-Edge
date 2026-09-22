import { RouterIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Flex, Text, Box } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { EmptyState, PageHeader } from "@/components";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { useDeleteNamecheapCredential, useNamecheapBalances, useNamecheapCredential, useVerifyNamecheapCredential } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { showConfirm } from "@/stores/modal";

import styles from "./s.module.css";

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
      <PageHeader
        icon={RouterIcon}
        index={t("index")}
        title={credential.label || credential.apiUser}
        description={t("accounts.detailHint")}
        actions={
          <Flex gap="2" wrap="wrap">
            <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_EDIT.replace(":credentialId", credentialId))}>
              {t("credential.edit")}
            </Button>
            <Button variant="outline" onClick={() => void verify.mutateAsync(credentialId)} disabled={verify.isPending}>
              {t("credential.verify")}
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
        }
      />
      <Flex direction="column" width="100%">
        <Box className={styles.hairline}>
          <Box py="5">
            <Flex direction="column" gap="3">
              <Text className={styles.kicker}>{t("credential.title")}</Text>
              <Text className={styles.meta}>
                {credential.apiUser} · {credential.clientIp} · {credential.sandbox ? t("credential.sandbox") : t("credential.production")}
              </Text>
              {credential.lastVerifiedAt ? <Text className={styles.rowOk}>{t("credential.verifiedAt", { at: credential.lastVerifiedAt })}</Text> : null}
              {credential.lastErrorMessage ? (
                <Box className={styles.errFrame}>
                  <Box px="3">
                    <Box py="2">{credential.lastErrorMessage}</Box>
                  </Box>
                </Box>
              ) : null}
            </Flex>
          </Box>
        </Box>
        <Box className={styles.hairline}>
          <Box py="5">
            <Flex direction="column" gap="3">
              <Text className={styles.kicker}>{t("balances.title")}</Text>
              {balancesQuery.isError ? (
                <Text className={styles.hint}>{getApiError(balancesQuery.error)?.message}</Text>
              ) : (
                <Flex direction="column" gap="1">
                  <Text className={styles.meta}>
                    {t("balances.available")}: {balances?.availableBalance ?? "—"} {balances?.currency ?? ""}
                  </Text>
                  <Text className={styles.meta}>
                    {t("balances.account")}: {balances?.accountBalance ?? "—"}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>
        </Box>
        <Box className={styles.hairline}>
          <Box py="5">
            <Flex wrap="wrap" gap="2">
              <Button onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS.replace(":credentialId", credentialId))}>{t("domains.title")}</Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_DOMAINS_BULK.replace(":credentialId", credentialId))}>
                {t("bulk.open")}
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.NAMECHEAP_SSL.replace(":credentialId", credentialId))}>
                {t("ssl.title")}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </PageFrame>
  );
});

NamecheapDetailPage.displayName = "NamecheapDetailPage";

export default NamecheapDetailPage;
