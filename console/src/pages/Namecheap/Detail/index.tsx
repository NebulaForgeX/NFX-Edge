import { ArrowNarrowLeftIcon, CurrencyDollarIcon, PenIcon, RefreshIcon, RouterIcon, ShieldCheck, StackIcon, TrashIcon, TriangleAlertIcon, WalletIcon, WorldIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Badge, Button, Callout, Card, Code, DataList, Flex, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { getApiError } from "nfx-ui/utils";

import { ActionBar, EmptyState, PageHeader, SideCard, StatCard } from "@/components";
import { useDeleteNamecheapCredential, useNamecheapBalances, useNamecheapCredential, useVerifyNamecheapCredential } from "@/hooks/dns";
import { PageFrame } from "@/layouts";
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
        <EmptyState
          icon={RouterIcon}
          title={t("accounts.missing")}
          description={getApiError(credentialQuery.error)?.message}
          action={
            <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_OVERVIEW)}>
              {t("accounts.back")}
            </Button>
          }
        />
      </PageFrame>
    );
  }

  const go = (route: string) => () => navigate(route.replace(":credentialId", credentialId));

  return (
    <PageFrame>
      <PageHeader icon={RouterIcon} index={t("index")} title={credential.label || credential.apiUser} description={t("accounts.detailHint")} />
      <ActionBar
        status={
          <Badge size="2" variant="surface" radius="full" color={credential.sandbox ? "amber" : "green"}>
            {credential.sandbox ? t("accounts.sandbox") : t("accounts.production")}
          </Badge>
        }
      >
        <Button variant="outline" color="gray" onClick={() => navigate(ROUTES.NAMECHEAP_OVERVIEW)}>
          <ArrowNarrowLeftIcon size={16} />
          {t("accounts.back")}
        </Button>
        <Button variant="outline" color="gray" loading={verify.isPending} onClick={() => void verify.mutateAsync(credentialId)}>
          <RefreshIcon size={16} />
          {t("credential.verify")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "1", lg: "minmax(0, 1fr) 18rem" }} gap="5" align="start">
        <Flex direction="column" gap="4" minWidth="0">
          {balancesQuery.isError ? (
            <Callout.Root color="red" variant="surface" role="alert">
              <Callout.Icon>
                <TriangleAlertIcon size={16} />
              </Callout.Icon>
              <Callout.Text size="2">{getApiError(balancesQuery.error)?.message}</Callout.Text>
            </Callout.Root>
          ) : (
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <StatCard icon={WalletIcon} label={t("balances.available")} value={balances?.availableBalance ?? "—"} suffix={balances?.currency} />
              <StatCard icon={CurrencyDollarIcon} label={t("balances.account")} value={balances?.accountBalance ?? "—"} suffix={balances?.currency} tone="gray" />
            </Grid>
          )}
          <Card size="3" variant="surface">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="3">
                <Flex align="center" justify="center" flexShrink="0" className={styles.stamp}>
                  <ShieldCheck size={16} />
                </Flex>
                <Heading as="h3" size="3" weight="bold">
                  {t("credential.title")}
                </Heading>
              </Flex>
              <DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
                <DataList.Item>
                  <DataList.Label minWidth="9rem">{t("credential.label")}</DataList.Label>
                  <DataList.Value>{credential.label || "—"}</DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="9rem">{t("credential.apiUser")}</DataList.Label>
                  <DataList.Value>
                    <Code variant="ghost">{credential.apiUser}</Code>
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="9rem">{t("credential.clientIp")}</DataList.Label>
                  <DataList.Value>
                    <Code variant="ghost">{credential.clientIp}</Code>
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="9rem">{t("credential.connection")}</DataList.Label>
                  <DataList.Value>
                    <Badge variant="surface" radius="full" color={credential.sandbox ? "amber" : "green"}>
                      {credential.sandbox ? t("accounts.sandbox") : t("accounts.production")}
                    </Badge>
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="9rem">{t("credential.verifiedAtShort")}</DataList.Label>
                  <DataList.Value>
                    <Code variant="ghost">{credential.lastVerifiedAt || "—"}</Code>
                  </DataList.Value>
                </DataList.Item>
              </DataList.Root>
              {credential.lastErrorMessage ? (
                <Callout.Root color="red" variant="surface" role="alert">
                  <Callout.Icon>
                    <TriangleAlertIcon size={16} />
                  </Callout.Icon>
                  <Flex direction="column" gap="1">
                    <Text size="1" weight="bold">
                      {t("credential.lastError")}
                    </Text>
                    <Callout.Text size="2" className={styles.mono}>
                      {credential.lastErrorMessage}
                    </Callout.Text>
                  </Flex>
                </Callout.Root>
              ) : null}
            </Flex>
          </Card>
        </Flex>
        <SideCard icon={RouterIcon} title={credential.label || credential.apiUser} caption={credential.apiUser}>
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray" className={styles.kicker}>
              {t("credential.shortcuts")}
            </Text>
            <Button onClick={go(ROUTES.NAMECHEAP_DOMAINS)}>
              <WorldIcon size={16} />
              {t("domains.title")}
            </Button>
            <Button variant="outline" color="gray" onClick={go(ROUTES.NAMECHEAP_DOMAINS_BULK)}>
              <StackIcon size={16} />
              {t("bulk.open")}
            </Button>
            <Button variant="outline" color="gray" onClick={go(ROUTES.NAMECHEAP_SSL)}>
              <ShieldCheck size={16} />
              {t("ssl.title")}
            </Button>
          </Flex>
          <Separator size="4" />
          <Flex direction="column" gap="2">
            <Text size="1" weight="medium" color="gray" className={styles.kicker}>
              {t("credential.manage")}
            </Text>
            <Button variant="outline" color="gray" onClick={go(ROUTES.NAMECHEAP_EDIT)}>
              <PenIcon size={16} />
              {t("credential.edit")}
            </Button>
            <Button
              color="red"
              variant="outline"
              loading={remove.isPending}
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
              <TrashIcon size={16} />
              {t("credential.delete")}
            </Button>
          </Flex>
        </SideCard>
      </Grid>
    </PageFrame>
  );
});

NamecheapDetailPage.displayName = "NamecheapDetailPage";

export default NamecheapDetailPage;
