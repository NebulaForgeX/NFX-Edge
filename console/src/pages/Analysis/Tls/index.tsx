import { CheckedIcon, MagnifierIcon, ShieldCheck, TriangleAlertIcon } from "nfx-ui/icons";
import { memo, useMemo, useRef, useState } from "react";
import { Badge, Box, Button, Callout, Card, DataList, Flex, Grid, Heading, Section, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "nfx-ui/utils";

import { useReveal } from "@/animations";
import { ActionBar, PageHeader, PemSheet } from "@/components";
import { useAnalyzeTls } from "@/hooks/analysis";
import { PageFrame } from "@/layouts";
import type { AnalyzeTLSResponse } from "@/types";
import { getCommandMessage } from "@/utils";

import styles from "./s.module.css";

const TLSAnalysisPage = memo(() => {
  const { t } = useTranslation("tlsAnalysis");
  const analyzeMutation = useAnalyzeTls();
  const [certificate, setCertificate] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [result, setResult] = useState<Nullable<AnalyzeTLSResponse>>(null);
  const [error, setError] = useState<Nullable<string>>(null);
  const pending = analyzeMutation.isPending;
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (pending) return;
    if (!certificate.trim()) {
      setError(t("errorNeedCert"));
      return;
    }
    setError(null);
    setResult(null);
    try {
      const response = await analyzeMutation.mutateAsync({
        certificate: certificate.trim(),
        privateKey: privateKey.trim() || undefined,
      });
      setResult(response);
      if (!response.success) setError(getCommandMessage(response.message, t("errorFailed")));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err as never, t("errorFailed")));
    }
  };

  const handleClear = () => {
    setCertificate("");
    setPrivateKey("");
    setResult(null);
    setError(null);
  };

  const specimen = result?.success ? result.data : null;
  const valid = Boolean(specimen?.summary.isValid);
  const fields = useMemo(() => {
    if (!specimen) return [];
    const cert = specimen.certificate;
    return [
      { key: "issuer", label: t("result.issuer"), value: cert.issuer || t("na") },
      { key: "notBefore", label: t("result.notBefore"), value: cert.notBefore || t("na") },
      { key: "notAfter", label: t("result.notAfter"), value: cert.notAfter || t("na") },
      { key: "hasKey", label: t("result.hasPrivateKey"), value: specimen.summary.hasPrivateKey ? t("yes") : t("no") },
      { key: "keyValid", label: t("result.keyValid"), value: specimen.summary.keyValid === null ? t("na") : specimen.summary.keyValid ? t("yes") : t("no") },
    ];
  }, [specimen, t]);

  useReveal(resultRef, { selector: "[data-reveal]", dependencies: [specimen], distance: 10, stagger: 0.05 });

  return (
    <PageFrame>
      <PageHeader icon={ShieldCheck} index={t("index")} title={t("title")} description={t("subtitle")} />
      <ActionBar>
        <Button size="2" variant="outline" color="gray" onClick={handleClear} disabled={pending}>
          {t("clear")}
        </Button>
        <Button size="2" onClick={() => void handleAnalyze()} disabled={!certificate.trim() || pending} loading={pending}>
          <MagnifierIcon size={16} />
          {pending ? t("analyzing") : t("analyze")}
        </Button>
      </ActionBar>
      <Grid columns={{ initial: "minmax(0, 1fr)", md: "26rem minmax(0, 1fr)" }} gap="5" width="100%" align="start">
        <Flex direction="column" gap="4" minWidth="0">
          <PemSheet
            id="tls-cert"
            label={t("pemCert")}
            kind="X.509 · CERT"
            value={certificate}
            onChange={setCertificate}
            placeholder={t("pemCertPlaceholder")}
            accept=".crt,.pem,.cert"
            browseLabel={t("browse")}
            dropLabel={t("drop")}
          />
          <PemSheet
            id="tls-key"
            label={t("pemKey")}
            kind="PKCS8 · KEY"
            value={privateKey}
            onChange={setPrivateKey}
            placeholder={t("pemKeyPlaceholder")}
            accept=".key,.pem"
            optional
            optionalLabel={t("optional")}
            browseLabel={t("browse")}
            dropLabel={t("drop")}
          />
          {error ? (
            <Callout.Root color="red" variant="surface" role="alert">
              <Callout.Icon>
                <TriangleAlertIcon size={16} />
              </Callout.Icon>
              <Callout.Text size="2">{error}</Callout.Text>
            </Callout.Root>
          ) : null}
        </Flex>

        <Card size="3" variant="classic" className={styles.sheet} data-valid={specimen ? String(valid) : undefined}>
          <Box className={styles.corners} aria-hidden="true" />
          <Flex direction="column" gap="5" ref={resultRef}>
            <Section size="1" pt="0" pb="3" className={styles.hairline}>
              <Flex align="center" justify="between" gap="3">
                <Text size="1" weight="medium" color="gray" className={styles.kicker}>
                  {t("specimen")}
                </Text>
                {specimen ? (
                  <Badge size="2" color={valid ? "green" : "red"} variant="surface" radius="full">
                    {valid ? <CheckedIcon size={12} /> : <TriangleAlertIcon size={12} />}
                    {valid ? t("validStamp") : t("invalidStamp")}
                  </Badge>
                ) : (
                  <Text size="1" color="gray" className={styles.kicker}>
                    {t("awaiting")}
                  </Text>
                )}
              </Flex>
            </Section>
            {specimen ? (
              <>
                <Flex direction={{ initial: "column", sm: "row" }} align={{ initial: "start", sm: "end" }} justify="between" gap="4" data-reveal>
                  <Flex direction="column" gap="1" minWidth="0">
                    <Text size="1" weight="medium" color="gray" className={styles.kicker}>
                      {t("result.domain")}
                    </Text>
                    <Heading as="h2" size="7" weight="bold" className={styles.subject}>
                      {specimen.certificate.commonName || t("na")}
                    </Heading>
                  </Flex>
                  <Flex direction="column" align={{ initial: "start", sm: "end" }} gap="1" flexShrink="0">
                    <Text size="1" weight="medium" color="gray" className={styles.kicker}>
                      {t("result.daysRemaining")}
                    </Text>
                    <Text size="8" weight="bold" color={valid ? undefined : "red"} className={styles.days}>
                      {specimen.summary.daysRemaining ?? t("na")}
                    </Text>
                  </Flex>
                </Flex>
                <DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2" data-reveal>
                  {fields.map((field) => (
                    <DataList.Item key={field.key}>
                      <DataList.Label minWidth="9rem">{field.label}</DataList.Label>
                      <DataList.Value className={styles.mono}>{field.value}</DataList.Value>
                    </DataList.Item>
                  ))}
                </DataList.Root>
                {specimen.certificate.allDomains?.length ? (
                  <Section size="1" pt="4" pb="0" className={styles.sans} data-reveal>
                    <Flex gap="2" wrap="wrap">
                      {specimen.certificate.allDomains.map((domain) => (
                        <Badge key={domain} variant="surface" color="gray" radius="full" className={styles.mono}>
                          {domain}
                        </Badge>
                      ))}
                    </Flex>
                  </Section>
                ) : null}
              </>
            ) : (
              <Section size="1" py="9" className={styles.vacant}>
                <Box className={styles.watermark} aria-hidden="true">
                  {t("watermark")}
                </Box>
                <Text as="p" size="2" color="gray">
                  {t("emptyResult")}
                </Text>
              </Section>
            )}
          </Flex>
        </Card>
      </Grid>
    </PageFrame>
  );
});

TLSAnalysisPage.displayName = "TLSAnalysisPage";

export default TLSAnalysisPage;
