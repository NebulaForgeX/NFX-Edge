import { MagnifierIcon, ShieldCheck } from "nfx-ui/icons";
import { memo, useMemo, useState } from "react";
import { Badge, Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { PageFrame } from "@/layouts";
import { PageHeader, PemSheet } from "@/components";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "nfx-ui/utils";
import { getCommandMessage } from "@/utils";
import type { AnalyzeTLSResponse } from "@/types";
import { useAnalyzeTls } from "@/hooks/analysis";

import styles from "./s.module.css";

const TLSAnalysisPage = memo(() => {
  const { t } = useTranslation("tlsAnalysis");
  const analyzeMutation = useAnalyzeTls();
  const [certificate, setCertificate] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [result, setResult] = useState<AnalyzeTLSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = analyzeMutation.isPending;

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
      { key: "domain", label: t("result.domain"), value: cert.commonName || t("na") },
      { key: "issuer", label: t("result.issuer"), value: cert.issuer || t("na") },
      { key: "notBefore", label: t("result.notBefore"), value: cert.notBefore || t("na") },
      { key: "notAfter", label: t("result.notAfter"), value: cert.notAfter || t("na") },
      { key: "days", label: t("result.daysRemaining"), value: String(specimen.summary.daysRemaining ?? t("na")) },
      { key: "hasKey", label: t("result.hasPrivateKey"), value: specimen.summary.hasPrivateKey ? t("yes") : t("no") },
      { key: "keyValid", label: t("result.keyValid"), value: specimen.summary.keyValid === null ? t("na") : specimen.summary.keyValid ? t("yes") : t("no") },
    ];
  }, [specimen, t]);

  return (
    <PageFrame>
      <PageHeader icon={ShieldCheck} index={t("index")} title={t("title")} description={t("subtitle")} />
      <Flex align="start" gap="5" width="100%" wrap="wrap">
        <Flex direction="column" gap="4" className={styles.intake}>
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
          <Flex gap="2" wrap="wrap" align="center">
            <Button size="3" onClick={() => void handleAnalyze()} disabled={!certificate.trim() || pending} loading={pending}>
              <MagnifierIcon size={16} />
              {pending ? t("analyzing") : t("analyze")}
            </Button>
            <Button size="3" variant="outline" onClick={handleClear} disabled={pending}>
              {t("clear")}
            </Button>
            {error ? (
              <Text size="2" color="red">
                {error}
              </Text>
            ) : null}
          </Flex>
        </Flex>

        <Box className={styles.stage} flexGrow="1" minWidth="0">
          <Box className={styles.sheet}>
            <span className={`${styles.corner} ${styles.cornerTl}`} />
            <span className={`${styles.corner} ${styles.cornerTr}`} />
            <span className={`${styles.corner} ${styles.cornerBl}`} />
            <span className={`${styles.corner} ${styles.cornerBr}`} />
            <Box className={styles.sheetPx}>
              <Box className={styles.sheetPy}>
                <Flex direction="column" gap="4">
                  <Box className={styles.hairline}>
                    <Box pb="3">
                      <Flex align="center" justify="between" gap="3">
                        <Text className={styles.kicker}>{t("specimen")}</Text>
                        {specimen ? (
                          <Badge color={valid ? "green" : "red"} variant="outline">
                            {valid ? t("validStamp") : t("invalidStamp")}
                          </Badge>
                        ) : (
                          <Text className={styles.kicker}>{t("awaiting")}</Text>
                        )}
                      </Flex>
                    </Box>
                  </Box>
                  {specimen ? (
                    <Flex direction="column" gap="4">
                      <Heading as="h2" size="6" className={styles.subject}>
                        {specimen.certificate.commonName || t("na")}
                      </Heading>
                      <dl className={styles.meta}>
                        {fields.map((field) => (
                          <div key={field.key} className={styles.metaItem}>
                            <dt>{field.label}</dt>
                            <dd>{field.value}</dd>
                          </div>
                        ))}
                      </dl>
                      {specimen.certificate.allDomains?.length ? (
                        <Box className={styles.sansHairline}>
                          <Box pt="4">
                            <Flex gap="2" wrap="wrap">
                              {specimen.certificate.allDomains.map((domain) => (
                                <Badge key={domain} variant="outline" color="gray">
                                  {domain}
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        </Box>
                      ) : null}
                    </Flex>
                  ) : (
                    <Box className={styles.vacant}>
                      <span className={styles.watermark}>{t("watermark")}</span>
                      <Text size="2" color="gray">
                        {t("emptyResult")}
                      </Text>
                    </Box>
                  )}
                </Flex>
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
    </PageFrame>
  );
});

TLSAnalysisPage.displayName = "TLSAnalysisPage";

export default TLSAnalysisPage;
