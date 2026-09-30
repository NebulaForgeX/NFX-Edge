import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";
import { folderNameFromDomain } from "../../utils/folderNameFromDomain";

import { memo, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";

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
    <Input
      {...folderNameRegister}
      label={t("form.folderName")}
      type="text"
      placeholder={t("form.folderNamePlaceholder")}
      error={displayError}
      helperText={!displayError ? t("form.folderNameHelp") : undefined}
    />
  );
});

FolderNameController.displayName = "FolderNameController";

export default FolderNameController;
