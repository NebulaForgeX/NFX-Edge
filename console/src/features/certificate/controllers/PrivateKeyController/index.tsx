import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Flex, Text } from "@radix-ui/themes";
import { PemSheet } from "@/components";
import { safeStringable } from "nfx-ui/utils";

const PrivateKeyController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <Flex direction="column" gap="2" minWidth="0">
      <PemSheet
        id="import-private-key"
        label={t("form.privateKey")}
        kind="PKCS8 · KEY"
        value={safeStringable(watch("privateKey"))}
        onChange={(value) => setValue("privateKey", value, { shouldValidate: true })}
        placeholder={t("form.privateKeyPlaceholder")}
        accept=".key,.pem"
        browseLabel={t("form.uploadPrivateKey")}
        dropLabel={t("form.dropPrivateKey")}
        error={errors.privateKey?.message}
      />
      {errors.privateKey ? (
        <Text size="1" color="red">
          {errors.privateKey.message}
        </Text>
      ) : null}
    </Flex>
  );
});

PrivateKeyController.displayName = "PrivateKeyController";

export default PrivateKeyController;
