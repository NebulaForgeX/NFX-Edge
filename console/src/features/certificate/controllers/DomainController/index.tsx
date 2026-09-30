import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { Input } from "@/components";

const DomainController = memo(({ readOnly = false }: { readOnly?: boolean }) => {
  const { t } = useTranslation("certificateElements");
  const [searchParams] = useSearchParams();
  const lockedApex = (searchParams.get("domain") ?? "").trim();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  useEffect(() => {
    if (lockedApex) {
      setValue("domain", lockedApex, { shouldValidate: true, shouldDirty: false });
    }
  }, [lockedApex, setValue]);

  return (
    <Input
      {...register("domain")}
      label={t("form.domain")}
      type="text"
      placeholder={t("form.domainPlaceholder")}
      error={errors.domain?.message}
      readOnly={readOnly || Boolean(lockedApex)}
      helperText={lockedApex ? t("form.domainLocked") : readOnly ? t("form.domainReadOnly") : t("form.domainApexHelp")}
    />
  );
});

DomainController.displayName = "DomainController";

export default DomainController;
