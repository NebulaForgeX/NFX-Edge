import { Container, Flex, Grid, Section } from "@radix-ui/themes";
import { LayersIcon } from "nfx-ui/icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { safeArray } from "nfx-ui/utils";

import styles from "./s.module.css";

export interface CertificateSansSectionProps {
  sans?: string[] | null;
}

const CertificateSansSection = memo(({ sans }: CertificateSansSectionProps) => {
  const { t } = useTranslation("certDetail");
  const list: string[] = safeArray(sans)
    .map((item: unknown) => String(item).trim())
    .filter((n: string) => n.length > 0);

  if (list.length === 0) return null;

  return (
    <Section className={styles.root} aria-labelledby="cert-sans-heading">
      <Section className={styles.header}>
        <Container width="100%" maxWidth="none" className={styles.headerInset} >
          <Flex align="start" justify="between" className={styles.headerRow}>
            <Flex align="start" className={styles.headerMain}>
              <Flex align="center" justify="center" className={styles.iconWrap} aria-hidden>
                <LayersIcon size={20} strokeWidth={2} />
              </Flex>
              <div className={styles.headerText}>
                <h2 id="cert-sans-heading" className={styles.title}>
                  {t("certificate.sans") || "Subject Alternative Names (SANs)"}
                </h2>
                <Section className={styles.subtitle}>
                  <p className={styles.subtitleText}>{t("certificate.sansSectionSubtitle")}</p>
                </Section>
              </div>
            </Flex>
            <Container width="auto" maxWidth="none" className={styles.count} >
              <Flex align="center" justify="center" width="100%" height="100%">
                <span className={styles.countText} title={t("certificate.sansCountTitle", { count: list.length })}>
                  {list.length}
                </span>
              </Flex>
            </Container>
          </Flex>
        </Container>
      </Section>

      <Section asChild className={styles.list}>
        <ul>
          {list.map((name, i) => (
            <Section asChild key={`${name}:${i}`} className={styles.item}>
              <li>
                <Container width="100%" maxWidth="none" className={styles.itemInset} >
                  <Grid className={styles.itemGrid}>
                    <span className={styles.itemIndex} aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <code className={styles.itemName}>{name}</code>
                  </Grid>
                </Container>
              </li>
            </Section>
          ))}
        </ul>
      </Section>
    </Section>
  );
});

CertificateSansSection.displayName = "CertificateSansSection";

export default CertificateSansSection;
