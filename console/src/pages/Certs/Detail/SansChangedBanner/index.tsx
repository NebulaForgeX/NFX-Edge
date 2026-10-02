import { Container, Flex, Section } from "@radix-ui/themes";
import { TriangleAlertIcon } from "nfx-ui/icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

export interface SansChangedBannerProps {
  visible: boolean;
}

const SansChangedBanner = memo(({ visible }: SansChangedBannerProps) => {
  const { t } = useTranslation("certDetail");

  if (!visible) return null;

  return (
    <Section className={styles.root}>
      <Section className={styles.rootPad}>
        <Container width="100%" maxWidth="none" className={styles.rootInset} >
          <Flex align="start" className={styles.row} role="status">
            <Section mt="1" pt="0" pb="0">
              <Flex flexShrink="0" className={styles.icon} aria-hidden>
                <TriangleAlertIcon size={22} strokeWidth={2} />
              </Flex>
            </Section>
            <p className={styles.text}>{t("sansChanged.banner")}</p>
          </Flex>
        </Container>
      </Section>
    </Section>
  );
});

SansChangedBanner.displayName = "SansChangedBanner";

export default SansChangedBanner;
