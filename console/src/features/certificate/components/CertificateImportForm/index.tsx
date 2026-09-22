import type { FieldErrors } from "react-hook-form";
import type { CertificateFormValues } from "../../schemas/certificateSchema";

import { memo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components";
import { useParseCertificatePreview } from "@/hooks";
import { showError, showSuccess } from "@/stores/modal";
import { getCommandMessage } from "@/utils";
import { safeArray, safeStringable } from "nfx-ui/utils";

import {
  CertificateController,
  DomainController,
  EmailControllerForAdd,
  FolderNameController,
  IssuerController,
  PrivateKeyController,
  SANsController,
} from "../../controllers";

import styles from "../CertificateApplyForm/s.module.css";

export interface CertificateImportFormProps {
  onSubmit: (data: CertificateFormValues) => Promise<void>;
  onSubmitError: (errors: FieldErrors<CertificateFormValues>) => void;
  isPending: boolean;
}

const CertificateImportForm = memo(({ onSubmit, onSubmitError, isPending }: CertificateImportFormProps) => {
  const { t } = useTranslation("certificateElements");
  const methods = useFormContext<CertificateFormValues>();
  const { mutateAsync: parsePreview, isPending: parsing } = useParseCertificatePreview();

  const handleParsed = useCallback(
    async (text: string) => {
      try {
        const r = await parsePreview({ certificate: text.trim() });
        if (!r.success) {
          showError(getCommandMessage(r.message, t("upload.parseFailed")));
          return;
        }
        if (r.domain) methods.setValue("domain", r.domain, { shouldValidate: true });
        const sansList = safeArray<string>(r.sans);
        if (sansList.length) {
          const primary = safeStringable(r.domain).trim().toLowerCase();
          const filtered = sansList.map((s: string) => s.trim()).filter(Boolean);
          const dedup = primary ? filtered.filter((s: string) => s.toLowerCase() !== primary) : filtered;
          methods.setValue("sans", dedup, { shouldValidate: true });
        }
        if (r.issuer) methods.setValue("issuer", r.issuer, { shouldValidate: true });
        showSuccess(getCommandMessage(r.message, t("upload.parseOk")));
      } catch {
        showError(t("upload.parseFailed"));
      }
    },
    [methods, parsePreview, t],
  );

  return (
    <div className={styles.root}>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.sectionPem")}</h3>
          <p className={styles.sectionHint}>{t("form.sectionPemHint")}</p>
          <CertificateController />
          <PrivateKeyController />
          <Button
            type="button"
            variant="outline"
            disabled={parsing || !methods.watch("certificate")?.trim()}
            onClick={() => void handleParsed(methods.getValues("certificate"))}
          >
            {parsing ? t("upload.parsing") : t("upload.parseFill")}
          </Button>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t("form.basicInfo")}</h3>
          <div className={styles.basicInfoGrid}>
            <div className={styles.leftColumn}>
              <DomainController />
              <FolderNameController />
              <EmailControllerForAdd />
              <IssuerController record />
            </div>
          </div>
          <SANsController />
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            size="large"
            className={styles.submitBtn}
            disabled={isPending}
            onClick={methods.handleSubmit(onSubmit, onSubmitError)}
          >
            {isPending ? t("form.creating") : t("form.create")}
          </Button>
        </div>
      </form>
    </div>
  );
});

CertificateImportForm.displayName = "CertificateImportForm";

export default CertificateImportForm;
