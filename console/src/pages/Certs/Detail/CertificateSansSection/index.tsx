import { Badge, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { AnimatedIcon, LayersIcon } from "nfx-ui/icons";
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
    <Card size="3" variant="surface" aria-labelledby="cert-sans-heading">
      <Flex direction="column" gap="4">
        <Flex align="start" justify="between" gap="4">
          <Flex align="start" gap="3" minWidth="0">
            <Flex align="center" justify="center" flexShrink="0" className={styles.stamp} aria-hidden>
              <AnimatedIcon icon={LayersIcon} size={14} />
            </Flex>
            <Flex direction="column" gap="1" minWidth="0">
              <Heading as="h2" id="cert-sans-heading" size="3" weight="bold">
                {t("certificate.sans")}
              </Heading>
              <Text as="p" size="2" color="gray" className={styles.subtitle}>
                {t("certificate.sansSectionSubtitle")}
              </Text>
            </Flex>
          </Flex>
          <Badge size="2" variant="surface" radius="full" title={t("certificate.sansCountTitle", { count: list.length })}>
            {list.length}
          </Badge>
        </Flex>
        <Flex asChild direction="column" className={styles.list}>
          <ul>
            {list.map((name, i) => (
              <Flex asChild key={`${name}:${i}`} align="baseline" gap="3" className={styles.item}>
                <li>
                  <Text size="1" color="gray" className={styles.index} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Text size="2" className={styles.name}>
                    {name}
                  </Text>
                </li>
              </Flex>
            ))}
          </ul>
        </Flex>
      </Flex>
    </Card>
  );
});

CertificateSansSection.displayName = "CertificateSansSection";

export default CertificateSansSection;
