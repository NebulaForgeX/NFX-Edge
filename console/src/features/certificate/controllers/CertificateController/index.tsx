import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Text } from "@radix-ui/themes";
import { PemSheet } from "@/components";
import { safeStringable } from "nfx-ui/utils";

const CertificateController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CertificateFormValues>();

  return (
    <>
      <PemSheet
        id="import-certificate"
        label={t("form.certificate")}
        kind="X.509 · CERT"
        value={safeStringable(watch("certificate"))}
        onChange={(value) => setValue("certificate", value, { shouldValidate: true })}
        placeholder={t("form.certificatePlaceholder")}
        accept=".crt,.pem,.cert"
        browseLabel={t("form.uploadCertificate")}
        dropLabel={t("form.dropCertificate")}
        error={errors.certificate?.message}
      />
      {errors.certificate ? (
        <Text size="1" color="red">
          {errors.certificate.message}
        </Text>
      ) : null}
    </>
  );
});

CertificateController.displayName = "CertificateController";

export default CertificateController;
