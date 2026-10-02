import { CopyIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Box, Button, Container, Flex, Section, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

interface PrivateKeyContentProps {
  privateKey: string;
  onCopy: () => void;
}

const PrivateKeyContent = memo(({ privateKey, onCopy }: PrivateKeyContentProps) => {
  const { t } = useTranslation("certDetail");

  return (
    <Box className={styles.sheet}>
      <Box className={`${styles.corner} ${styles.cornerTl}`} />
      <Box className={`${styles.corner} ${styles.cornerTr}`} />
      <Box className={`${styles.corner} ${styles.cornerBl}`} />
      <Box className={`${styles.corner} ${styles.cornerBr}`} />
      <Container width="100%" maxWidth="none" className={styles.sheetInset} >
        <Section className={styles.sheetPad}>
          <Flex direction="column" className={styles.stack}>
            <Section className={styles.head}>
              <Flex align="center" justify="between" gap="3">
                <Text as="span" className={styles.kind}>
                  {t("certificate.privateKey")}
                </Text>
                <Button size="1" variant="outline" onClick={onCopy}>
                  <CopyIcon size={14} />
                  {t("copy.privateKey")}
                </Button>
              </Flex>
            </Section>
            <Flex direction="column" className={styles.body} >
              <pre className={styles.pem}>{privateKey}</pre>
            </Flex>
          </Flex>
        </Section>
      </Container>
    </Box>
  );
});

PrivateKeyContent.displayName = "PrivateKeyContent";

export default PrivateKeyContent;
