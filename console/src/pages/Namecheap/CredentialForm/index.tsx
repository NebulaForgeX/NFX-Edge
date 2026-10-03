import { memo, useEffect, useState } from "react";
import { Box, Button, Callout, Card, Flex, Grid, Section, Switch, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { InfoCircleIcon, WifiIcon } from "nfx-ui/icons";

import { Input } from "@/components";
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
    <Card size="3" variant="surface">
      <Flex direction="column" gap="5">
        <Callout.Root variant="surface" size="1">
          <Callout.Icon>
            <InfoCircleIcon size={16} />
          </Callout.Icon>
          <Callout.Text size="2">{t("credential.hint", { ip: outboundIp })}</Callout.Text>
        </Callout.Root>
        <Box position="relative">
          <div className={styles.trap} aria-hidden="true">
            <input type="text" name="username" autoComplete="username" tabIndex={-1} readOnly />
            <input type="password" name="password" autoComplete="current-password" tabIndex={-1} readOnly />
          </div>
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
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
          </Grid>
        </Box>
        <Section size="1" pt="4" pb="0" className={styles.footer}>
          <Flex wrap="wrap" gap="3" align="center" justify="between">
            <Text as="label" size="2">
              <Flex gap="2" align="center">
                <Switch checked={sandbox} onCheckedChange={setSandbox} />
                {t("credential.sandbox")}
              </Flex>
            </Text>
            <Flex wrap="wrap" gap="2" align="center">
              <Button
                variant="outline"
                color="gray"
                onClick={() => {
                  const ip = outboundQuery.data?.ipv4;
                  if (ip) setClientIp(ip);
                }}
                disabled={!outboundQuery.data?.ipv4}
              >
                <WifiIcon size={14} />
                {t("credential.useOutbound")}
              </Button>
              <Button
                loading={pending}
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
        </Section>
      </Flex>
    </Card>
  );
});

CredentialForm.displayName = "CredentialForm";

export default CredentialForm;
