import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { Checkbox, Flex, Text } from "@radix-ui/themes";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import styles from "../EmailControllerForAdd/s.module.css";

const ForceRenewalController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const { control } = useFormContext<CertificateFormSharedValues>();

  return (
    <Flex direction="column" gap="1" className={styles.formControl}>
      <Text as="label" size="2">
        <Flex align="center" gap="2">
          <Controller
            name="forceRenewal"
            control={control}
            render={({ field }) => <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />}
          />
          <Text size="2">{t("form.forceRenewal")}</Text>
        </Flex>
      </Text>
      <Text size="1" color="gray">
        {t("form.forceRenewalHelp")}
      </Text>
    </Flex>
  );
});

ForceRenewalController.displayName = "ForceRenewalController";

export default ForceRenewalController;
