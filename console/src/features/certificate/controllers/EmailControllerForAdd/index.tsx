import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components";
import useLoginEmail from "../../hooks/useLoginEmail";
import styles from "./s.module.css";

interface EmailControllerForAddProps {
  requireEmail?: boolean;
}

const EmailControllerForAdd = memo(({ requireEmail = false }: EmailControllerForAddProps) => {
  const { t } = useTranslation("certificateElements");
  const loginEmail = useLoginEmail();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CertificateFormSharedValues>();

  useEffect(() => {
    if (loginEmail) {
      setValue("email", loginEmail, { shouldValidate: true, shouldDirty: false });
    }
  }, [loginEmail, setValue]);

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>
        {t("form.email")}
        {requireEmail ? <span className={styles.required}> *</span> : null}
      </label>
      <Input
        {...register("email")}
        type="email"
        placeholder={t("form.emailPlaceholder")}
        error={errors.email?.message}
        helperText={loginEmail ? t("form.emailFromAccount") : undefined}
      />
    </div>
  );
});

EmailControllerForAdd.displayName = "EmailControllerForAdd";

export default EmailControllerForAdd;

