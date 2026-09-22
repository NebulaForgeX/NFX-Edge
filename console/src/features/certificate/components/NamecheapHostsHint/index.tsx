import { memo, useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { DataTable } from "@/components";
import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";
import { hostToFqdn, normalizeApex, uniqueFqdns } from "@/features/dns/hostFqdn";
import { formatNamecheapTtl } from "@/features/dns/ttl";
import { useNamecheapDomainLookup } from "@/hooks/dns";
import { ROUTES } from "@/navigations";
import { routerEventEmitter } from "@/events/router";
import type { NamecheapHost } from "@/types";

import styles from "./s.module.css";

function NamecheapHostsHint() {
  const { t } = useTranslation("certificateElements");
  const [searchParams] = useSearchParams();
  const preferredCredentialId = (searchParams.get("credentialId") ?? "").trim();
  const { watch, getValues, setValue } = useFormContext<CertificateFormSharedValues>();
  const domain = watch("domain") ?? "";
  const [apex, setApex] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setApex(normalizeApex(domain)), 400);
    return () => window.clearTimeout(timer);
  }, [domain]);

  const { creds, lookup, hasCredentials } = useNamecheapDomainLookup(apex, preferredCredentialId);
  const hosts = lookup.data?.detail?.hosts?.hosts ?? [];
  const info = lookup.data?.detail?.info;
  const registered = info?.domain || apex;

  const addSan = (host: NamecheapHost) => {
    const cn = normalizeApex(getValues("domain"));
    const fqdn = hostToFqdn(host.name, registered || cn);
    if (!fqdn || fqdn === cn) return;
    const current = getValues("sans") ?? [];
    const next = uniqueFqdns([...current, fqdn]);
    if (next.length === current.length) return;
    setValue("sans", next, { shouldValidate: true, shouldDirty: true });
  };

  let body;
  if (!apex.includes(".")) {
    body = <Text className={styles.hint}>{t("hostsHint.emptyDomain")}</Text>;
  } else if (!creds.isSuccess) {
    body = <Text className={styles.hint}>{creds.isError ? t("hostsHint.needAccount") : t("hostsHint.looking")}</Text>;
  } else if (!hasCredentials) {
    body = (
      <Flex direction="column" gap="3">
        <Text className={styles.hint}>{t("hostsHint.needAccount")}</Text>
        <Button type="button" variant="outline" onClick={() => routerEventEmitter.navigate({ to: ROUTES.NAMECHEAP_NEW })}>
          {t("hostsHint.connect")}
        </Button>
      </Flex>
    );
  } else if (!lookup.data && (lookup.isLoading || lookup.isFetching)) {
    body = <Text className={styles.hint}>{t("hostsHint.looking")}</Text>;
  } else if (lookup.isError || !lookup.data?.detail) {
    body = <Text className={styles.hint}>{t("hostsHint.notFound")}</Text>;
  } else {
    body = (
      <Flex direction="column" gap="3" width="100%" className={styles.body}>
        {info ? (
          <Text className={styles.hint}>
            {t("hostsHint.expires", { at: info.expires || "—" })} · {t("hostsHint.locked", { value: info.isLocked || info.status || "—" })} ·{" "}
            {t("hostsHint.ourDns", { value: String(info.isOurDns) })}
          </Text>
        ) : null}
        {hosts.length === 0 ? (
          <Text className={styles.hint}>{t("hostsHint.noHosts")}</Text>
        ) : (
          <div className={styles.scroll}>
            <DataTable
              empty={t("hostsHint.noHosts")}
              rows={hosts}
              rowKey={(host) => `${host.hostId}|${host.name}|${host.type}|${host.address}`}
              onRowClick={addSan}
              columns={[
                { key: "name", header: t("hostsHint.colHost"), render: (host) => host.name, mono: true },
                { key: "type", header: t("hostsHint.colType") },
                { key: "address", header: t("hostsHint.colAddress"), render: (host) => host.address, mono: true },
                { key: "ttl", header: t("hostsHint.colTtl"), render: (host) => formatNamecheapTtl(host.ttl, t("hostsHint.ttlAutomatic")) },
              ]}
            />
          </div>
        )}
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="3" width="100%" height="100%" className={styles.panel}>
      <Box className={styles.titleHairline}>
        <Box pb="3">
          <Text size="2" weight="bold">
            {t("hostsHint.title")}
          </Text>
        </Box>
      </Box>
      <Text className={styles.hint}>{t("hostsHint.clickToAdd")}</Text>
      {body}
    </Flex>
  );
}

export default memo(NamecheapHostsHint);
