import { memo, useEffect, useState } from "react";
import { Box, Button, Checkbox, Flex, Text } from "@radix-ui/themes";
import { Input } from "@/components";
import { useTranslation } from "react-i18next";

import { useDnsOutboundIp } from "@/hooks/dns";
import type { WriteNamecheapCredentialRequest } from "@/types";

import styles from "./s.module.css";

export type CredentialFormValues = {
  label: string;
  apiUser: string;
  apiKey: string;
  clientIp: string;
  sandbox: boolean;
};

type CredentialFormProps = {
  initial?: Partial<CredentialFormValues>;
  keepKeyHint?: boolean;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (values: WriteNamecheapCredentialRequest) => void;
};

const CredentialForm = memo(({ initial, keepKeyHint, pending, submitLabel, onSubmit }: CredentialFormProps) => {
  const { t } = useTranslation("dns");
  const outboundQuery = useDnsOutboundIp();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [apiUser, setApiUser] = useState(initial?.apiUser ?? "");
  const [apiKey, setApiKey] = useState("");
  const [clientIp, setClientIp] = useState(initial?.clientIp ?? "");
  const [sandbox, setSandbox] = useState(initial?.sandbox ?? false);
  const outboundIp = outboundQuery.data?.ipv4 ?? "—";

  useEffect(() => {
    const ip = outboundQuery.data?.ipv4?.trim();
    if (!ip) return;
    setClientIp((current) => (current.trim() ? current : ip));
  }, [outboundQuery.data?.ipv4]);

  return (
    <Flex direction="column" gap="4">
      <Text className={styles.hint}>{t("credential.hint", { ip: outboundIp })}</Text>
      <Box position="relative">
        <div className={styles.trap} aria-hidden="true">
          <input type="text" name="username" autoComplete="username" tabIndex={-1} readOnly />
          <input type="password" name="password" autoComplete="current-password" tabIndex={-1} readOnly />
        </div>
        <Flex direction="column" gap="4">
          <Input label={t("credential.label")} name="namecheap-label" autoComplete="off" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input
            label={t("credential.apiUser")}
            helperText={t("credential.apiUserHint")}
            name="namecheap-api-user"
            autoComplete="off"
            value={apiUser}
            onChange={(e) => setApiUser(e.target.value)}
          />
          <Input
            label={t("credential.apiKey")}
            type="password"
            name="namecheap-api-key"
            autoComplete="new-password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={keepKeyHint ? t("credential.apiKeyKeep") : ""}
          />
          <Input label={t("credential.clientIp")} name="namecheap-client-ip" autoComplete="off" value={clientIp} onChange={(e) => setClientIp(e.target.value)} />
        </Flex>
      </Box>
      <Flex wrap="wrap" gap="2" align="center">
        <Flex gap="2" align="center">
          <Checkbox checked={sandbox} onCheckedChange={(v) => setSandbox(v === true)} />
          {t("credential.sandbox")}
        </Flex>
        <Button
          variant="outline"
          onClick={() => {
            const ip = outboundQuery.data?.ipv4;
            if (ip) setClientIp(ip);
          }}
          disabled={!outboundQuery.data?.ipv4}
        >
          {t("credential.useOutbound")}
        </Button>
        <Button
          disabled={pending}
          onClick={() =>
            onSubmit({
              label,
              apiUser: apiUser.trim(),
              apiKey: apiKey || undefined,
              clientIp: clientIp.trim() || outboundQuery.data?.ipv4?.trim() || "",
              sandbox,
            })
          }
        >
          {submitLabel}
        </Button>
      </Flex>
    </Flex>
  );
});

CredentialForm.displayName = "CredentialForm";

export default CredentialForm;
