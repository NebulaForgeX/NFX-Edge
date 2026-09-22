import { CopyIcon } from "nfx-ui/icons";
import { memo } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import styles from "./s.module.css";

interface CertificateContentProps {
  certificate: string;
  onCopy: () => void;
}

const CertificateContent = memo(({ certificate, onCopy }: CertificateContentProps) => {
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
          {t("certificate.content")}
        </Text>
        <Button size="1" variant="outline" onClick={onCopy}>
          <CopyIcon size={14} />
          {t("copy.certificate")}
        </Button>
      </div>
      <pre className={styles.body}>{certificate}</pre>
          </div>
        </div>
      </div>
    </div>
  );
});

CertificateContent.displayName = "CertificateContent";

export default CertificateContent;
