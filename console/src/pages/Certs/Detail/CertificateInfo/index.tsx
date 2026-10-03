import { Callout, Card, Code, DataList, Flex, Heading, Text } from "@radix-ui/themes";
import { AnimatedIcon, InfoCircleIcon, TriangleAlertIcon } from "nfx-ui/icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import type { CertificateDetailResponse } from "@/types";

import styles from "./s.module.css";

interface CertificateInfoProps {
  certDetail: CertificateDetailResponse;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <DataList.Item>
      <DataList.Label minWidth="9rem">{label}</DataList.Label>
      <DataList.Value>
        <Text size="2" className={styles.value}>
          {value}
        </Text>
      </DataList.Value>
    </DataList.Item>
  );
}

const CertificateInfo = memo(({ certDetail }: CertificateInfoProps) => {
  const { t } = useTranslation("certDetail");

  return (
    <Card size="3" variant="surface">
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2">
          <Flex align="center" justify="center" className={styles.stamp}>
            <AnimatedIcon icon={InfoCircleIcon} size={14} />
          </Flex>
          <Heading as="h2" size="3" weight="bold">
            {t("certificate.info")}
          </Heading>
        </Flex>
        <DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
          <InfoRow label={t("certificate.email")} value={certDetail.email?.trim() ? certDetail.email : "—"} />
          {certDetail.folderName ? <InfoRow label={t("certificate.folderName")} value={certDetail.folderName} /> : null}
          {certDetail.status ? (
            <DataList.Item>
              <DataList.Label minWidth="9rem">{t("certificate.status")}</DataList.Label>
              <DataList.Value>
                <Code size="2" variant="ghost">
                  {certDetail.status}
                </Code>
              </DataList.Value>
            </DataList.Item>
          ) : null}
          <InfoRow label={t("certificate.issuer")} value={certDetail.issuer || t("certificate.unknown")} />
          {certDetail.notBefore ? <InfoRow label={t("certificate.validFrom")} value={new Date(certDetail.notBefore).toLocaleString()} /> : null}
          {certDetail.notAfter ? <InfoRow label={t("certificate.expiryDate")} value={new Date(certDetail.notAfter).toLocaleString()} /> : null}
        </DataList.Root>
        {certDetail.lastErrorMessage ? (
          <Callout.Root color="red" variant="surface" role="alert">
            <Callout.Icon>
              <TriangleAlertIcon size={16} />
            </Callout.Icon>
            <Flex direction="column" gap="1">
              <Text size="2" weight="bold">
                {t("certificate.lastError")}
              </Text>
              <Callout.Text size="2" className={styles.mono}>
                {certDetail.lastErrorMessage}
              </Callout.Text>
              {certDetail.lastErrorTime ? (
                <Text size="1" color="gray" className={styles.mono}>
                  {t("certificate.errorTime")}: {new Date(certDetail.lastErrorTime).toLocaleString()}
                </Text>
              ) : null}
            </Flex>
          </Callout.Root>
        ) : null}
      </Flex>
    </Card>
  );
});

CertificateInfo.displayName = "CertificateInfo";

export default CertificateInfo;
