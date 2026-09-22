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
    <div className={styles.root} role="status">
      <span className={styles.icon} aria-hidden>
        <TriangleAlertIcon size={22} strokeWidth={2} />
      </span>
      <p className={styles.text}>{t("sansChanged.banner")}</p>
    </div>
  );
});

SansChangedBanner.displayName = "SansChangedBanner";

export default SansChangedBanner;
