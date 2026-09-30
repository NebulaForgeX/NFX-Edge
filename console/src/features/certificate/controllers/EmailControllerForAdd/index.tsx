import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import useLoginEmail from "../../hooks/useLoginEmail";

interface EmailControllerForAddProps {
  requireEmail?: boolean;
  prefillAccount?: boolean;
}

const EmailControllerForAdd = memo(({ requireEmail = false, prefillAccount = true }: EmailControllerForAddProps) => {
  const { t } = useTranslation("certificateElements");
  const loginEmail = useLoginEmail();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  useEffect(() => {
    if (!prefillAccount || !loginEmail) return;
    setValue("email", loginEmail, { shouldValidate: true, shouldDirty: false });
  }, [loginEmail, prefillAccount, setValue]);

  return (
    <Input
      {...register("email")}
      label={requireEmail ? `${t("form.email")} *` : t("form.email")}
      type="email"
      placeholder={t("form.emailPlaceholder")}
      error={errors.email?.message}
      helperText={loginEmail && prefillAccount ? t("form.emailFromAccount") : undefined}
    />
  );
});

EmailControllerForAdd.displayName = "EmailControllerForAdd";

export default EmailControllerForAdd;

