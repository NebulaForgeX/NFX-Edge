import { Callout } from "@radix-ui/themes";
import { TriangleAlertIcon } from "nfx-ui/icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export interface SansChangedBannerProps {
  visible: boolean;
}

const SansChangedBanner = memo(({ visible }: SansChangedBannerProps) => {
  const { t } = useTranslation("certDetail");

  if (!visible) return null;

  return (
    <Callout.Root color="amber" variant="surface" size="2" role="status">
      <Callout.Icon>
        <TriangleAlertIcon size={18} />
      </Callout.Icon>
      <Callout.Text weight="medium">{t("sansChanged.banner")}</Callout.Text>
    </Callout.Root>
  );
});

SansChangedBanner.displayName = "SansChangedBanner";

export default SansChangedBanner;
