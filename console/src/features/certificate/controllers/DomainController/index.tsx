import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import { Input } from "@/components";
import styles from "./s.module.css";

const DomainController = memo(() => {
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
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.domain")} <span className={styles.required}>*</span>
      </label>
      <Input
        {...register("domain")}
        type="text"
        placeholder={t("form.domainPlaceholder")}
        error={errors.domain?.message}
        readOnly={Boolean(lockedApex)}
        helperText={lockedApex ? t("form.domainLocked") : t("form.domainApexHelp")}
      />
    </div>
  );
});

DomainController.displayName = "DomainController";

export default DomainController;
