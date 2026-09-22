import { CopyIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

interface PrivateKeyContentProps {
  privateKey: string;
  onCopy: () => void;
}

const PrivateKeyContent = memo(({ privateKey, onCopy }: PrivateKeyContentProps) => {
  const { t } = useTranslation("certDetail");

  return (
    <div className={styles.sheet}>
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />
      <span className={`${styles.corner} ${styles.cornerBl}`} />
      <span className={`${styles.corner} ${styles.cornerBr}`} />
      <div className={styles.sheetPx}>
        <div className={styles.sheetPy}>
          <div className={styles.sheetStack}>
      <div className={styles.head}>
        <Text as="span" className={styles.kind}>
          {t("certificate.privateKey")}
        </Text>
        <Button size="1" variant="outline" onClick={onCopy}>
          <CopyIcon size={14} />
          {t("copy.privateKey")}
        </Button>
      </div>
      <pre className={`${styles.body} ${styles.key}`}>{privateKey}</pre>
          </div>
        </div>
      </div>
    </div>
  );
});

PrivateKeyContent.displayName = "PrivateKeyContent";

export default PrivateKeyContent;
