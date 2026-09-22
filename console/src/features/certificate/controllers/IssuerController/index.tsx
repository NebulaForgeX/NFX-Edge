import type { CertificateFormSharedValues } from "../../schemas/certificateSchema";

import { memo, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Dropdown } from "@/components";
import { CERTIFICATE_ISSUER_VALUES, DEFAULT_CERTIFICATE_ISSUER } from "@/enums";
import styles from "./s.module.css";

type IssuerControllerProps = {
  /** Import / edit: show the cert's issuer CN. Apply: ACME dropdown (Let's Encrypt only). */
  record?: boolean;
};

const IssuerController = memo(({ record = false }: IssuerControllerProps) => {
  const { t } = useTranslation("certificateElements");
  const { watch, setValue, formState: { errors } } = useFormContext<CertificateFormSharedValues>();
  const issuer = watch("issuer");
  const current = (issuer ?? "").trim();

  useEffect(() => {
    if (record) return;
    if (current === DEFAULT_CERTIFICATE_ISSUER) return;
    setValue("issuer", DEFAULT_CERTIFICATE_ISSUER, { shouldValidate: true, shouldDirty: false });
  }, [record, current, setValue]);

  const options = useMemo(
    () => CERTIFICATE_ISSUER_VALUES.map((value) => ({ value, label: value })),
    [],
  );

  return (
    <div className={styles.formControl}>
      <label className={styles.label}>{t("form.issuer")}</label>
      {record ? (
        <p className={styles.helpText}>{current || "—"}</p>
      ) : (
        <Dropdown
          options={options}
          value={DEFAULT_CERTIFICATE_ISSUER}
          onChange={(value) => setValue("issuer", value, { shouldValidate: true, shouldDirty: true })}
          error={Boolean(errors.issuer?.message)}
        />
      )}
    </div>
  );
});

IssuerController.displayName = "IssuerController";

export default IssuerController;
