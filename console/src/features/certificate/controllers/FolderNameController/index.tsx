import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";
import { folderNameFromDomain } from "../../utils/folderNameFromDomain";

import { memo, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import styles from "../DomainController/s.module.css";

const FolderNameController = memo(() => {
  const { t } = useTranslation("certificateElements");
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();
  const domain = watch("domain");

  useEffect(() => {
    const next = folderNameFromDomain(domain ?? "");
    if (!next || getValues("folderName").trim()) return;
    setValue("folderName", next, { shouldValidate: true, shouldDirty: false });
  }, [domain, getValues, setValue]);

  const folderNameRegister = useMemo(
    () => register("folderName"),
    [register]
  );

  const displayError = errors.folderName?.message;

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.folderName")}
      </label>
      <Input
        {...folderNameRegister}
        type="text"
        placeholder={t("form.folderNamePlaceholder")}
        error={displayError}
        helperText={!displayError ? t("form.folderNameHelp") : undefined}
      />
    </div>
  );
});

FolderNameController.displayName = "FolderNameController";

export default FolderNameController;
