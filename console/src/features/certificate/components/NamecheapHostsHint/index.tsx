import { memo, useEffect, useState } from "react";
import { Button, Flex, ScrollArea, Section, Text } from "@radix-ui/themes";
import { RouterIcon } from "nfx-ui/icons";
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
    body = <Text size="1" color="gray">{t("hostsHint.emptyDomain")}</Text>;
  } else if (!creds.isSuccess) {
    body = <Text size="1" color="gray">{creds.isError ? t("hostsHint.needAccount") : t("hostsHint.looking")}</Text>;
  } else if (!hasCredentials) {
    body = (
      <Flex direction="column" gap="3">
        <Text size="1" color="gray">{t("hostsHint.needAccount")}</Text>
        <Button type="button" variant="outline" color="gray" onClick={() => routerEventEmitter.navigate({ to: ROUTES.NAMECHEAP_NEW })}>
          {t("hostsHint.connect")}
        </Button>
      </Flex>
    );
  } else if (!lookup.data && (lookup.isLoading || lookup.isFetching)) {
    body = <Text size="1" color="gray">{t("hostsHint.looking")}</Text>;
  } else if (lookup.isError || !lookup.data?.detail) {
    body = <Text size="1" color="gray">{t("hostsHint.notFound")}</Text>;
  } else {
    body = (
      <Flex direction="column" gap="3" width="100%" flexGrow="1" minHeight="0">
        {info ? (
          <Text size="1" color="gray">
            {t("hostsHint.expires", { at: info.expires || "—" })} · {t("hostsHint.locked", { value: info.isLocked || info.status || "—" })} ·{" "}
            {t("hostsHint.ourDns", { value: String(info.isOurDns) })}
          </Text>
        ) : null}
        {hosts.length === 0 ? (
          <Text size="1" color="gray">{t("hostsHint.noHosts")}</Text>
        ) : (
          <ScrollArea type="auto" scrollbars="vertical" className={styles.scroll}>
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
          </ScrollArea>
        )}
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="3" width="100%" height="100%" minHeight="0">
      <Section size="1" pt="0" pb="3" className={styles.title}>
        <Flex align="center" gap="2">
          <Flex align="center" justify="center" flexShrink="0" className={styles.stamp}>
            <RouterIcon size={14} />
          </Flex>
          <Text size="2" weight="bold">
            {t("hostsHint.title")}
          </Text>
        </Flex>
      </Section>
      <Text size="1" color="gray">{t("hostsHint.clickToAdd")}</Text>
      {body}
    </Flex>
  );
}

export default memo(NamecheapHostsHint);
