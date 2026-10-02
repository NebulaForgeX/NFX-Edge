import { Box, Container, Flex, Grid, Section } from "@radix-ui/themes";
import { TriangleAlertIcon } from "nfx-ui/icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { CertificateDetailResponse } from "@/types";
import styles from "./s.module.css";

interface CertificateInfoProps {
  certDetail: CertificateDetailResponse;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" className={styles.infoItem}>
      <label>{label}</label>
      <span>{value}</span>
    </Flex>
  );
}

const CertificateInfo = memo(({ certDetail }: CertificateInfoProps) => {
  const { t } = useTranslation("certDetail");

  return (
    <Box className={styles.section}>
      <Container width="100%" maxWidth="none" className={styles.sectionInset} >
        <Section className={styles.sectionPad}>
          <Section className={styles.title}>
            <h2 className={styles.titleText}>{t("certificate.info") || "Certificate Information"}</h2>
          </Section>
          <Grid columns="repeat(auto-fit, minmax(12rem, 1fr))" gap="4">
            <InfoItem label={t("certificate.email") || "Contact email"} value={certDetail.email?.trim() ? certDetail.email : "—"} />
            {certDetail.folderName ? <InfoItem label={t("certificate.folderName") || "Folder Name"} value={certDetail.folderName} /> : null}
            {certDetail.status ? <InfoItem label={t("certificate.status") || "Status"} value={certDetail.status} /> : null}
            <InfoItem label={t("certificate.issuer") || "Issuer"} value={certDetail.issuer || t("certificate.unknown") || "Unknown"} />
            {certDetail.notBefore ? <InfoItem label={t("certificate.validFrom") || "Valid From"} value={new Date(certDetail.notBefore).toLocaleString()} /> : null}
            {certDetail.notAfter ? <InfoItem label={t("certificate.expiryDate") || "Expiry Date"} value={new Date(certDetail.notAfter).toLocaleString()} /> : null}
            {certDetail.lastErrorMessage ? (
              <Section className={styles.error}>
                <Container width="100%" maxWidth="none" className={styles.errorInset} >
                  <Section className={styles.errorPad}>
                    <Section className={styles.errorHeader}>
                      <Flex align="center" className={styles.errorHeaderRow}>
                        <TriangleAlertIcon size={18} className={styles.errorIcon} />
                        <label>{t("certificate.lastError") || "Last Error"}</label>
                      </Flex>
                    </Section>
                    <p className={styles.errorMessage}>{certDetail.lastErrorMessage}</p>
                    {certDetail.lastErrorTime ? (
                      <Section className={styles.errorTime}>
                        <p className={styles.errorTimeText}>
                          {t("certificate.errorTime") || "Error Time"}: {new Date(certDetail.lastErrorTime).toLocaleString()}
                        </p>
                      </Section>
                    ) : null}
                  </Section>
                </Container>
              </Section>
            ) : null}
          </Grid>
        </Section>
      </Container>
    </Box>
  );
});

CertificateInfo.displayName = "CertificateInfo";

export default CertificateInfo;
